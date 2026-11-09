import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, User, TaskStatus, TaskComment, TimerSession, WhatsAppNotification, TaskFilterState, DueDateFilterOption, TaskPriority } from '../types';
import { StorageService, subscribeToRealtimeChanges, notifyRealtimeChange } from '../services/storage';
import { WhatsAppTemplates, recordAndDispatchWhatsApp } from '../services/whatsapp';

export type AppView = 'dashboard' | 'helicopter' | 'board' | 'my_tasks';

export const DEFAULT_FILTERS: TaskFilterState = {
  searchKeyword: '',
  assigneeId: 'all',
  status: 'all',
  priority: 'all',
  dueDate: 'all',
  customDueDate: '',
  department: 'all',
  sortBy: 'created_desc',
};

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

interface TaskContextType {
  tasks: Task[];
  users: User[];
  currentUser: User;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  setCurrentUser: (user: User) => void;
  // Timer system
  activeRunningTaskId: string | null;
  activeTimerLiveSeconds: number;
  startTaskTimer: (taskId: string) => void;
  pauseTaskTimer: (taskId: string, sessionNote?: string) => void;
  resetTaskTimer: (taskId: string) => void;
  // Task operations
  createTask: (
    data: Omit<Task, 'id' | 'loggedSeconds' | 'activeTimerStartedAt' | 'activeTimerUserId' | 'createdAt' | 'updatedAt'>,
    sendWhatsAppAlert?: boolean
  ) => Task;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, waitingReason?: string) => void;
  updateTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Comments & Update Notes
  comments: TaskComment[];
  addComment: (taskId: string, content: string, isUpdateNote?: boolean, category?: TaskComment['updateCategory']) => void;
  // Sessions
  sessions: TimerSession[];
  // WhatsApp & Modals
  notifications: WhatsAppNotification[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  whatsAppData: {
    task?: Task;
    recipient?: User;
    defaultType?: WhatsAppNotification['type'];
    prefilledMessage?: string;
  } | null;
  openWhatsAppModal: (data?: {
    task?: Task;
    recipient?: User;
    defaultType?: WhatsAppNotification['type'];
    prefilledMessage?: string;
  }) => void;
  isUserSwitcherOpen: boolean;
  setIsUserSwitcherOpen: (open: boolean) => void;
  // Universal Search & Filter System
  filters: TaskFilterState;
  setFilter: <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => void;
  setFilters: (updates: Partial<TaskFilterState>) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  filteredTasks: Task[];
  filterTaskList: (list: Task[], customFilterState?: Partial<TaskFilterState>) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [users] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUserState] = useState<User>(() => StorageService.getCurrentUser());
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [comments, setComments] = useState<TaskComment[]>(() => StorageService.getComments());
  const [sessions, setSessions] = useState<TimerSession[]>(() => StorageService.getSessions());
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>(() => StorageService.getNotifications());

  // Active running timer state
  const [activeRunningTaskId, setActiveRunningTaskId] = useState<string | null>(() => {
    const running = tasks.find((t) => t.activeTimerStartedAt !== null);
    return running ? running.id : null;
  });
  const [activeTimerLiveSeconds, setActiveTimerLiveSeconds] = useState<number>(0);

  // Modals & Drawer
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<TaskContextType['whatsAppData']>(null);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  // Search & Global Filters
  const [filters, setFiltersState] = useState<TaskFilterState>(DEFAULT_FILTERS);

  const setFilter = useCallback(<K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((updates: Partial<TaskFilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Filter task list helper
  const filterTaskList = useCallback(
    (list: Task[], customFilterState?: Partial<TaskFilterState>): Task[] => {
      const active = { ...filters, ...customFilterState };
      const todayStr = new Date().toISOString().split('T')[0];
      const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      return list
        .filter((task) => {
          // 1. Keyword search (title, description, tags, assignee name)
          if (active.searchKeyword.trim()) {
            const query = active.searchKeyword.toLowerCase().trim();
            const assignee = users.find((u) => u.id === task.assigneeId);
            const matchesTitle = task.title.toLowerCase().includes(query);
            const matchesDesc = task.description.toLowerCase().includes(query);
            const matchesTags = task.tags.some((tag) => tag.toLowerCase().includes(query));
            const matchesAssignee = assignee?.name.toLowerCase().includes(query) || false;

            if (!matchesTitle && !matchesDesc && !matchesTags && !matchesAssignee) {
              return false;
            }
          }

          // 2. Assignee filter
          if (active.assigneeId !== 'all' && task.assigneeId !== active.assigneeId) {
            return false;
          }

          // 3. Status filter
          if (active.status !== 'all' && task.status !== active.status) {
            return false;
          }

          // 4. Priority filter
          if (active.priority !== 'all' && task.priority !== active.priority) {
            return false;
          }

          // 5. Department filter
          if (active.department !== 'all' && task.department !== active.department) {
            return false;
          }

          // 6. Due date filter
          if (active.dueDate !== 'all') {
            if (active.dueDate === 'overdue') {
              if (!(task.dueDate < todayStr && task.status !== 'done')) return false;
            } else if (active.dueDate === 'today') {
              if (task.dueDate !== todayStr) return false;
            } else if (active.dueDate === 'this_week') {
              if (!(task.dueDate >= todayStr && task.dueDate <= nextWeekStr)) return false;
            } else if (active.dueDate === 'upcoming') {
              if (task.dueDate < todayStr) return false;
            } else if (active.dueDate === 'custom' && active.customDueDate) {
              if (task.dueDate !== active.customDueDate) return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          if (active.sortBy === 'priority_desc') {
            const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
            const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
            if (weightA !== weightB) return weightB - weightA;
            return a.dueDate.localeCompare(b.dueDate);
          }
          if (active.sortBy === 'due_date_asc') {
            return a.dueDate.localeCompare(b.dueDate);
          }
          if (active.sortBy === 'title_asc') {
            return a.title.localeCompare(b.title);
          }
          // created_desc (default)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    },
    [filters, users]
  );

  const filteredTasks = useMemo(() => filterTaskList(tasks), [tasks, filterTaskList]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchKeyword.trim()) count++;
    if (filters.assigneeId !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.dueDate !== 'all') count++;
    return count;
  }, [filters]);

  // Sync state from storage reload
  const reloadData = useCallback(() => {
    setTasks(StorageService.getTasks());
    setComments(StorageService.getComments());
    setSessions(StorageService.getSessions());
    setNotifications(StorageService.getNotifications());
  }, []);

  // Listen to cross-tab BroadcastChannel real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChanges((type) => {
      if (type === 'TASKS_UPDATED' || type === 'COMMENT_ADDED' || type === 'SESSION_LOGGED' || type === 'NOTIFICATION_SENT' || type === 'RESET_DATA') {
        reloadData();
      }
      if (type === 'USER_CHANGED') {
        setCurrentUserState(StorageService.getCurrentUser());
      }
    });
    return unsubscribe;
  }, [reloadData]);

  // Keep selectedTask reference synchronized with tasks list
  useEffect(() => {
    if (selectedTask) {
      const refreshed = tasks.find((t) => t.id === selectedTask.id);
      if (refreshed) {
        setSelectedTask(refreshed);
      }
    }
  }, [tasks]);

  // Global stopwatch tick
  useEffect(() => {
    const runningTask = tasks.find((t) => t.id === activeRunningTaskId && t.activeTimerStartedAt !== null);
    if (!runningTask || !runningTask.activeTimerStartedAt) {
      setActiveTimerLiveSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsedSinceStart = Math.floor((Date.now() - (runningTask.activeTimerStartedAt || Date.now())) / 1000);
      setActiveTimerLiveSeconds(elapsedSinceStart);
    }, 500);

    return () => clearInterval(interval);
  }, [activeRunningTaskId, tasks]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    StorageService.setCurrentUser(user);
  };

  // Timer controls
  const startTaskTimer = (taskId: string) => {
    const now = Date.now();
    const updated = tasks.map((t) => {
      // If another task was actively running, finalize its elapsed seconds
      if (t.activeTimerStartedAt !== null && t.id !== taskId) {
        const extraSecs = Math.floor((now - t.activeTimerStartedAt) / 1000);
        return {
          ...t,
          loggedSeconds: t.loggedSeconds + Math.max(0, extraSecs),
          activeTimerStartedAt: null,
          activeTimerUserId: null,
        };
      }
      // Start this task's timer
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'new' ? 'ongoing' : t.status, // Auto bump New to Ongoing
          activeTimerStartedAt: now,
          activeTimerUserId: currentUser.id,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    StorageService.saveTasks(updated);
    setActiveRunningTaskId(taskId);
    setActiveTimerLiveSeconds(0);
  };

  const pauseTaskTimer = (taskId: string, sessionNote?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.activeTimerStartedAt) return;

    const now = Date.now();
    const elapsedSeconds = Math.max(1, Math.floor((now - task.activeTimerStartedAt) / 1000));

    // Record session
    const session = StorageService.logSession({
      taskId,
      userId: currentUser.id,
      userName: currentUser.name,
      startedAt: new Date(task.activeTimerStartedAt).toISOString(),
      endedAt: new Date(now).toISOString(),
      durationSeconds: elapsedSeconds,
      note: sessionNote || `Focused work session (${Math.round(elapsedSeconds / 60)} min)`,
    });
    setSessions((prev) => [session, ...prev]);

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          loggedSeconds: t.loggedSeconds + elapsedSeconds,
          activeTimerStartedAt: null,
          activeTimerUserId: null,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    StorageService.saveTasks(updated);
    setActiveRunningTaskId(null);
    setActiveTimerLiveSeconds(0);
  };

  const resetTaskTimer = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          activeTimerStartedAt: null,
          activeTimerUserId: null,
          loggedSeconds: 0,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setTasks(updated);
    StorageService.saveTasks(updated);
    if (activeRunningTaskId === taskId) {
      setActiveRunningTaskId(null);
      setActiveTimerLiveSeconds(0);
    }
  };

  // Task status transition with real-time feedback
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, waitingReason?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If marking as done while timer is active, pause & log it first
    if (newStatus === 'done' && task.activeTimerStartedAt) {
      pauseTaskTimer(taskId, 'Final completion session');
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          waitingReason: newStatus === 'waiting_response' ? (waitingReason || t.waitingReason || 'Awaiting external reply') : undefined,
          waitingSince: newStatus === 'waiting_response' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    StorageService.saveTasks(updated);

    // If status is changed to 'waiting_response', create an automatic update note
    if (newStatus === 'waiting_response' && waitingReason) {
      addComment(taskId, `Status changed to Waiting for Responses: ${waitingReason}`, true, 'blocker');
    } else if (newStatus === 'done') {
      addComment(taskId, `Task marked as DONE by ${currentUser.name}.`, true, 'resolution');
    }
  };

  const updateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } : t));
    setTasks(updated);
    StorageService.saveTasks(updated);
    addComment(taskId, `Task priority updated to ${newPriority.toUpperCase()} by ${currentUser.name}.`, true, 'general');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    setTasks(updated);
    StorageService.saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    StorageService.saveTasks(updated);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    if (activeRunningTaskId === taskId) {
      setActiveRunningTaskId(null);
      setActiveTimerLiveSeconds(0);
    }
  };

  const createTask = (
    data: Omit<Task, 'id' | 'loggedSeconds' | 'activeTimerStartedAt' | 'activeTimerUserId' | 'createdAt' | 'updatedAt'>,
    sendWhatsAppAlert = true
  ): Task => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      loggedSeconds: 0,
      activeTimerStartedAt: null,
      activeTimerUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageService.saveTasks(updated);

    // If requested, send/dispatch WhatsApp notification to assignee
    if (sendWhatsAppAlert) {
      const assignee = users.find((u) => u.id === newTask.assigneeId);
      if (assignee) {
        const message = WhatsAppTemplates.taskAssignment(newTask, assignee, currentUser);
        const notif = recordAndDispatchWhatsApp({
          taskId: newTask.id,
          taskTitle: newTask.title,
          recipientName: assignee.name,
          recipientPhone: assignee.phone,
          message,
          type: 'assignment',
          openDirectly: false, // Don't block screen, but logged and ready in drawer
        });
        setNotifications((prev) => [notif, ...prev]);
      }
    }

    return newTask;
  };

  const addComment = (
    taskId: string,
    content: string,
    isUpdateNote = false,
    category: TaskComment['updateCategory'] = 'general'
  ) => {
    const newComm = StorageService.addComment({
      taskId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      isUpdateNote,
      updateCategory: category,
    });
    setComments((prev) => [newComm, ...prev]);
  };

  const openWhatsAppModal = (data?: {
    task?: Task;
    recipient?: User;
    defaultType?: WhatsAppNotification['type'];
    prefilledMessage?: string;
  }) => {
    setWhatsAppData(data || null);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users,
        currentUser,
        currentView,
        setCurrentView,
        setCurrentUser,
        activeRunningTaskId,
        activeTimerLiveSeconds,
        startTaskTimer,
        pauseTaskTimer,
        resetTaskTimer,
        createTask,
        updateTaskStatus,
        updateTaskPriority,
        updateTask,
        deleteTask,
        comments,
        addComment,
        sessions,
        notifications,
        selectedTask,
        setSelectedTask,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        whatsAppData,
        openWhatsAppModal,
        isUserSwitcherOpen,
        setIsUserSwitcherOpen,
        // Universal Search & Filter System
        filters,
        setFilter,
        setFilters,
        resetFilters,
        activeFilterCount,
        filteredTasks,
        filterTaskList,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

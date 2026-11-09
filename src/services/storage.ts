import { User, Task, TaskComment, TimerSession, WhatsAppNotification, TaskStatus } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_sarah_spv',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@pulseteam.internal',
    password: 'password123',
    role: 'spv',
    roleTitle: 'Product & Operations Lead (SPV)',
    avatar: '/src/assets/images/avatar_sarah_spv_1794210536825.jpg',
    phone: '+6281234567890',
    department: 'Quality & Ops',
    weeklyCapacityHours: 40,
    joinedDate: '2026-01-10',
  },
  {
    id: 'user_alex_dev',
    name: 'Alex Rivera',
    email: 'alex.rivera@pulseteam.internal',
    password: 'password123',
    role: 'staff',
    roleTitle: 'Senior Full-Stack Engineer',
    avatar: '/src/assets/images/avatar_alex_dev_1794210538039.jpg',
    phone: '+6281122334455',
    department: 'Engineering',
    weeklyCapacityHours: 40,
    joinedDate: '2026-02-15',
  },
  {
    id: 'user_maya_design',
    name: 'Maya Lin',
    email: 'maya.lin@pulseteam.internal',
    password: 'password123',
    role: 'staff',
    roleTitle: 'Lead Product & UI/UX Designer',
    avatar: '/src/assets/images/avatar_maya_designer_1794210537426.jpg',
    phone: '+6281987654321',
    department: 'Design',
    weeklyCapacityHours: 35,
    joinedDate: '2026-03-01',
  },
  {
    id: 'user_david_qa',
    name: 'David Kim',
    email: 'david.kim@pulseteam.internal',
    password: 'password123',
    role: 'staff',
    roleTitle: 'DevOps & Quality Assurance',
    avatar: '/src/assets/images/avatar_david_qa_1794210538270.jpg',
    phone: '+6281344556677',
    department: 'Engineering',
    weeklyCapacityHours: 40,
    joinedDate: '2026-03-12',
  },
  {
    id: 'user_elena_marketing',
    name: 'Elena Rostova',
    email: 'elena.rostova@pulseteam.internal',
    password: 'password123',
    role: 'staff',
    roleTitle: 'Client Success & Marketing Specialist',
    avatar: '', // CSS styled fallback with initials
    phone: '+6281566778899',
    department: 'Marketing',
    weeklyCapacityHours: 35,
    joinedDate: '2026-04-05',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    title: 'Migrate Payment Webhooks to Stripe V3 & Add Idempotency',
    description: 'Ensure all asynchronous checkout events are verified with cryptographic signature verification and handled with strict idempotency keys to prevent double-charging.',
    status: 'ongoing',
    priority: 'urgent',
    assigneeId: 'user_alex_dev',
    creatorId: 'user_sarah_spv',
    department: 'Engineering',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    estimatedHours: 8,
    loggedSeconds: 12600, // 3.5 hrs
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Backend', 'Billing', 'Stripe'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-102',
    title: 'Helicopter View & Workload Matrix UI Polish',
    description: 'Refine high-level supervisor dashboard with real-time capacity gauges, bottleneck radar, and department filter tabs.',
    status: 'ongoing',
    priority: 'high',
    assigneeId: 'user_maya_design',
    creatorId: 'user_sarah_spv',
    department: 'Design',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedHours: 6,
    loggedSeconds: 7200, // 2 hrs
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['UI/UX', 'Dashboard', 'Figma'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-103',
    title: 'Client SSO Integration with Google Workspace OAuth',
    description: 'Set up seamless single-sign on flow for corporate clients using Google Workspace directory sync.',
    status: 'waiting_response',
    priority: 'high',
    assigneeId: 'user_alex_dev',
    creatorId: 'user_sarah_spv',
    department: 'Engineering',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    estimatedHours: 10,
    loggedSeconds: 14400, // 4 hrs
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Auth', 'Security', 'SSO'],
    waitingReason: 'Waiting for Enterprise Client IT Admin to whitelist domain and provide Google OAuth Client ID',
    waitingSince: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'task-104',
    title: 'Automated E2E Regression Suite on GitHub Actions',
    description: 'Configure daily Playwright test runs across Safari, Chromium and Mobile Firefox on staging branch.',
    status: 'new',
    priority: 'medium',
    assigneeId: 'user_david_qa',
    creatorId: 'user_sarah_spv',
    department: 'Engineering',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    estimatedHours: 12,
    loggedSeconds: 0,
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['CI/CD', 'QA', 'Automation'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'task-105',
    title: 'Enterprise Q4 Onboarding Materials & WhatsApp Templates',
    description: 'Draft the automated welcome sequence, WhatsApp reminder templates, and step-by-step PDF manual for small business cohorts.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'user_elena_marketing',
    creatorId: 'user_sarah_spv',
    department: 'Marketing',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    estimatedHours: 5,
    loggedSeconds: 18000, // 5 hrs
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Documentation', 'Marketing', 'Templates'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-106',
    title: 'API Rate Limiting & Redis Token Bucket Validator',
    description: 'Implement distributed rate limiter across ingress proxies to protect sensitive authentication endpoints from brute force attempts.',
    status: 'done',
    priority: 'high',
    assigneeId: 'user_david_qa',
    creatorId: 'user_sarah_spv',
    department: 'Quality & Ops',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    estimatedHours: 6,
    loggedSeconds: 21600, // 6 hrs
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Security', 'Redis', 'Ops'],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-107',
    title: 'Design System Typography & Accessible Dark Contrast Audit',
    description: 'Review contrast ratios across all states of interactive components for full WCAG AA compliance.',
    status: 'waiting_response',
    priority: 'low',
    assigneeId: 'user_maya_design',
    creatorId: 'user_sarah_spv',
    department: 'Design',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    estimatedHours: 4,
    loggedSeconds: 3600, // 1 hr
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Design System', 'Accessibility'],
    waitingReason: 'Waiting for brand stakeholder review on primary indigo hue saturation',
    waitingSince: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-108',
    title: 'Productivity Analytics CSV Export & Monthly Workload Digest',
    description: 'Allow managers to export sprint metrics, logged hours per staff member, and completion velocity for HR payroll audits.',
    status: 'new',
    priority: 'medium',
    assigneeId: 'user_elena_marketing',
    creatorId: 'user_sarah_spv',
    department: 'Marketing',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    estimatedHours: 4,
    loggedSeconds: 0,
    activeTimerStartedAt: null,
    activeTimerUserId: null,
    tags: ['Reporting', 'Analytics'],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const INITIAL_COMMENTS: TaskComment[] = [
  {
    id: 'comm-1',
    taskId: 'task-101',
    authorId: 'user_sarah_spv',
    authorName: 'Sarah Jenkins',
    authorAvatar: '/src/assets/images/avatar_sarah_spv_1794210536825.jpg',
    content: 'Alex, please ensure we simulate webhook delivery retries with exponential backoff before cutting over staging.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isUpdateNote: false,
  },
  {
    id: 'comm-2',
    taskId: 'task-101',
    authorId: 'user_alex_dev',
    authorName: 'Alex Rivera',
    authorAvatar: '/src/assets/images/avatar_alex_dev_1794210538039.jpg',
    content: 'Update Note: Handled event signatures and verified replay protection. Running final mock webhook load test now.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isUpdateNote: true,
    updateCategory: 'progress',
  },
  {
    id: 'comm-3',
    taskId: 'task-103',
    authorId: 'user_alex_dev',
    authorName: 'Alex Rivera',
    authorAvatar: '/src/assets/images/avatar_alex_dev_1794210538039.jpg',
    content: 'Blocker: Waiting on client IT team to confirm the authorized redirect URIs in their Google Cloud Console.',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    isUpdateNote: true,
    updateCategory: 'blocker',
  },
  {
    id: 'comm-4',
    taskId: 'task-105',
    authorId: 'user_elena_marketing',
    authorName: 'Elena Rostova',
    authorAvatar: '',
    content: 'Resolution: All 5 onboarding templates finalized and tested with live WhatsApp Web dispatch. Ready for deployment!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isUpdateNote: true,
    updateCategory: 'resolution',
  },
];

export const INITIAL_SESSIONS: TimerSession[] = [
  {
    id: 'sess-1',
    taskId: 'task-101',
    userId: 'user_alex_dev',
    userName: 'Alex Rivera',
    startedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 5.5).toISOString(),
    durationSeconds: 9000,
    note: 'Stripe webhook signature validation setup and test vectors',
  },
  {
    id: 'sess-2',
    taskId: 'task-101',
    userId: 'user_alex_dev',
    userName: 'Alex Rivera',
    startedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    durationSeconds: 3600,
    note: 'Added Redis idempotency lock',
  },
  {
    id: 'sess-3',
    taskId: 'task-102',
    userId: 'user_maya_design',
    userName: 'Maya Lin',
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    durationSeconds: 7200,
    note: 'Figma layout specs for SPV helicopter radar and capacity bars',
  },
];

export const INITIAL_NOTIFICATIONS: WhatsAppNotification[] = [
  {
    id: 'wa-1',
    taskId: 'task-101',
    taskTitle: 'Migrate Payment Webhooks to Stripe V3 & Add Idempotency',
    recipientName: 'Alex Rivera',
    recipientPhone: '+6281122334455',
    message: '👋 Hi Alex Rivera, you have been assigned an urgent task: *Migrate Payment Webhooks to Stripe V3 & Add Idempotency*. Priority: URGENT. Due: Nov 10. Check details on PulseTeam.',
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'assignment',
  },
  {
    id: 'wa-2',
    taskId: 'task-103',
    taskTitle: 'Client SSO Integration with Google Workspace OAuth',
    recipientName: 'Sarah Jenkins',
    recipientPhone: '+6281234567890',
    message: '⏳ *PulseTeam Alert*: Task *Client SSO Integration* is WAITING FOR RESPONSES. Reason: Waiting for Enterprise Client IT Admin. Action required from SPV.',
    sentAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    type: 'waiting_ping',
  },
];

const STORAGE_KEYS = {
  TASKS: 'pulseteam_tasks_v1',
  USERS: 'pulseteam_users_v1',
  CURRENT_USER: 'pulseteam_current_user_v1',
  COMMENTS: 'pulseteam_comments_v1',
  SESSIONS: 'pulseteam_sessions_v1',
  NOTIFICATIONS: 'pulseteam_notifications_v1',
};

// Safe localStorage helpers
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save ${key} to storage:`, err);
  }
}

// BroadcastChannel for instant real-time sync across multi-windows/tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('pulseteam_sync_bus');
  }
} catch {
  broadcastChannel = null;
}

export function notifyRealtimeChange(eventType: string, payload?: unknown) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: eventType, payload, timestamp: Date.now() });
  }
}

export function subscribeToRealtimeChanges(callback: (type: string, payload: unknown) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    callback(event.data.type, event.data.payload);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export const StorageService = {
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  saveUsers(users: User[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
    notifyRealtimeChange('USERS_UPDATED', users);
  },

  addUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
      weeklyCapacityHours: userData.weeklyCapacityHours || 40,
      avatar: userData.avatar || '',
      password: userData.password || 'password123',
    };
    const updated = [...users, newUser];
    this.saveUsers(updated);
    return newUser;
  },

  updateUser(userId: string, updates: Partial<User>): User[] {
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    this.saveUsers(updated);

    // If current logged in user was updated, keep currentUser synced
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser({ ...current, ...updates });
    }
    return updated;
  },

  removeUser(userId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.length <= 1) {
      return { success: false, error: 'Cannot remove the only remaining user in the organization.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    // Check if target is the last supervisor
    const supervisors = users.filter((u) => u.role === 'spv');
    if (targetUser.role === 'spv' && supervisors.length <= 1) {
      return { success: false, error: 'Cannot remove the only supervisor. Please promote another staff member to SPV first.' };
    }

    // Filter out user
    const updatedUsers = users.filter((u) => u.id !== userId);
    this.saveUsers(updatedUsers);

    // Reassign any tasks assigned to this user to another user (e.g. primary supervisor)
    const fallbackUser = updatedUsers.find((u) => u.role === 'spv') || updatedUsers[0];
    const tasks = this.getTasks();
    const updatedTasks = tasks.map((t) => {
      if (t.assigneeId === userId) {
        return {
          ...t,
          assigneeId: fallbackUser.id,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.saveTasks(updatedTasks);

    // If current user is the one being removed, switch to fallback user
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(fallbackUser);
    }

    return { success: true };
  },

  getCurrentUser(): User {
    const saved = getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved) return saved;
    // Default to Sarah (SPV) so supervisor view is immediately inspectable
    const users = this.getUsers();
    return users[0] || INITIAL_USERS[0];
  },

  setCurrentUser(user: User): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    notifyRealtimeChange('USER_CHANGED', user);
  },

  login(email: string, password?: string): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;

    // Check password if set
    if (password && user.password && user.password !== password.trim()) {
      return null;
    }

    this.setCurrentUser(user);
    return user;
  },

  logout(): void {
    // Keep in demo mode or set to guest/null
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
    notifyRealtimeChange('USER_LOGGED_OUT');
  },

  getTasks(): Task[] {
    return getFromStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },

  saveTasks(tasks: Task[]): void {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    notifyRealtimeChange('TASKS_UPDATED', tasks);
  },

  updateTaskStatus(taskId: string, newStatus: TaskStatus, waitingReason?: string): Task[] {
    const tasks = this.getTasks();
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
    this.saveTasks(updated);
    return updated;
  },

  getComments(taskId?: string): TaskComment[] {
    const all = getFromStorage<TaskComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    if (!taskId) return all;
    return all.filter((c) => c.taskId === taskId);
  },

  addComment(comment: Omit<TaskComment, 'id' | 'createdAt'>): TaskComment {
    const all = getFromStorage<TaskComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    const newComment: TaskComment = {
      ...comment,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newComment, ...all];
    saveToStorage(STORAGE_KEYS.COMMENTS, updated);
    notifyRealtimeChange('COMMENT_ADDED', newComment);
    return newComment;
  },

  getSessions(taskId?: string): TimerSession[] {
    const all = getFromStorage<TimerSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    if (!taskId) return all;
    return all.filter((s) => s.taskId === taskId);
  },

  logSession(session: Omit<TimerSession, 'id'>): TimerSession {
    const all = getFromStorage<TimerSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    const newSession: TimerSession = {
      ...session,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newSession, ...all];
    saveToStorage(STORAGE_KEYS.SESSIONS, updated);
    notifyRealtimeChange('SESSION_LOGGED', newSession);
    return newSession;
  },

  getNotifications(): WhatsAppNotification[] {
    return getFromStorage<WhatsAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<WhatsAppNotification, 'id' | 'sentAt'>): WhatsAppNotification {
    const all = getFromStorage<WhatsAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: WhatsAppNotification = {
      ...notif,
      id: `wa-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...all];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    notifyRealtimeChange('NOTIFICATION_SENT', newNotif);
    return newNotif;
  },

  resetToDefault(): void {
    saveToStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    saveToStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    saveToStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifyRealtimeChange('RESET_DATA');
  },
};

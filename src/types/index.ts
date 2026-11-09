export type UserRole = 'spv' | 'staff';

export type Department = 'Engineering' | 'Design' | 'Marketing' | 'Quality & Ops';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  phone: string;
  department: Department;
  weeklyCapacityHours: number;
  joinedDate?: string;
}

export type TaskStatus = 'new' | 'ongoing' | 'waiting_response' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isUpdateNote?: boolean; // Highlighted as an official milestone/blocker update note
  updateCategory?: 'progress' | 'blocker' | 'resolution' | 'general';
}

export interface TimerSession {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  creatorId: string;
  department: Department;
  dueDate: string;
  estimatedHours: number;
  loggedSeconds: number;
  activeTimerStartedAt: number | null; // epoch timestamp in ms if running
  activeTimerUserId: string | null;
  tags: string[];
  waitingReason?: string; // e.g. "Waiting for client Figma approval" or "Waiting on API credentials"
  waitingSince?: string;
  createdAt: string;
  updatedAt: string;
}

export type DueDateFilterOption = 'all' | 'overdue' | 'today' | 'this_week' | 'upcoming' | 'custom';

export type SortOption = 'priority_desc' | 'due_date_asc' | 'title_asc' | 'created_desc';

export interface TaskFilterState {
  searchKeyword: string;
  assigneeId: string; // 'all' or user.id
  status: string; // 'all' or TaskStatus
  priority: string; // 'all' or TaskPriority
  dueDate: DueDateFilterOption;
  customDueDate?: string;
  department: string; // 'all' or Department
  sortBy: SortOption;
}

export interface WhatsAppNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  sentAt: string;
  type: 'assignment' | 'status_change' | 'waiting_ping' | 'completion' | 'custom';
}


import { Task, User, TaskStatus, WhatsAppNotification } from '../types';
import { StorageService } from './storage';

export function normalizePhoneNumber(phone: string): string {
  // Strip all non-numeric characters except leading '+' if any, then remove '+'
  return phone.replace(/[^0-9]/g, '');
}

export function formatTimeSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function formatHoursDecimal(seconds: number): string {
  return (seconds / 3600).toFixed(1) + 'h';
}

export const WhatsAppTemplates = {
  taskAssignment(task: Task, assignee: User, assigner: User): string {
    return `👋 *PulseTeam: Task Assignment*\n\nHello *${assignee.name}*,\nYou have been assigned a new task by ${assigner.name}:\n\n📋 *${task.title}*\n🏢 *Department*: ${task.department}\n⚡ *Priority*: ${task.priority.toUpperCase()}\n📅 *Due Date*: ${task.dueDate}\n⏱️ *Estimated*: ${task.estimatedHours} hours\n\n📝 *Brief*:\n${task.description}\n\n👉 *Open PulseTeam to start task timer & review notes.*`;
  },

  statusChange(task: Task, newStatus: TaskStatus, actor: User, assignee: User): string {
    const statusLabels: Record<TaskStatus, string> = {
      new: 'NEW',
      ongoing: 'IN PROGRESS / ONGOING',
      waiting_response: 'WAITING FOR RESPONSES ⏳',
      done: 'COMPLETED ✅',
    };
    return `🔔 *PulseTeam Status Change*\n\nTask: *${task.title}*\nAssignee: *${assignee.name}*\nUpdated to: *${statusLabels[newStatus]}*\nChanged by: ${actor.name}\n\n${task.waitingReason ? `⚠️ Note: ${task.waitingReason}\n\n` : ''}_PulseTeam Real-time Workflow_`;
  },

  waitingResponsePing(task: Task, assignee: User, spv: User): string {
    return `⏳ *PulseTeam Escalation: Input Needed*\n\nHello *${assignee.name}*,\nSupervisor ${spv.name} is checking in on task:\n\n📋 *${task.title}*\nStatus: *WAITING FOR RESPONSES*\n\n⚠️ *Blocker / Details*:\n"${task.waitingReason || 'Awaiting feedback / reply'}"\n\nCould you please reply with the latest status or unblock note?`;
  },

  taskCompleted(task: Task, assignee: User): string {
    return `🎉 *PulseTeam: Task Completed!*\n\nTask: *${task.title}*\nFinished by: *${assignee.name}*\nLogged Duration: *${formatTimeSeconds(task.loggedSeconds)}*\nEst. Target: ${task.estimatedHours}h\n\n_Status updated to Done on dashboard._`;
  },
};

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function openWhatsAppChat(phoneNumber: string, message: string): void {
  const url = createWhatsAppLink(phoneNumber, message);
  // Open in new tab or native WhatsApp app
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function recordAndDispatchWhatsApp(params: {
  taskId: string;
  taskTitle: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  type: WhatsAppNotification['type'];
  openDirectly?: boolean;
}): WhatsAppNotification {
  const notification = StorageService.addNotification({
    taskId: params.taskId,
    taskTitle: params.taskTitle,
    recipientName: params.recipientName,
    recipientPhone: params.recipientPhone,
    message: params.message,
    type: params.type,
  });

  if (params.openDirectly) {
    openWhatsAppChat(params.recipientPhone, params.message);
  }

  return notification;
}

import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { 
  Kanban, 
  Table as TableIcon, 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  Send, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  Flame,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Department } from '../../types';
import { formatTimeSeconds, formatHoursDecimal } from '../../services/whatsapp';
import { TaskFilterBar } from '../TaskFilterBar';

export const TaskBoardView: React.FC = () => {
  const {
    tasks,
    filteredTasks,
    users,
    setSelectedTask,
    setIsCreateModalOpen,
    startTaskTimer,
    pauseTaskTimer,
    activeRunningTaskId,
    activeTimerLiveSeconds,
    updateTaskStatus,
    updateTaskPriority,
    openWhatsAppModal,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const columns: { id: TaskStatus; label: string; dot: string; countBg: string }[] = [
    { id: 'new', label: 'New', dot: 'bg-slate-400', countBg: 'bg-slate-200 text-slate-700' },
    { id: 'ongoing', label: 'Ongoing', dot: 'bg-blue-500', countBg: 'bg-blue-100 text-blue-800' },
    { id: 'waiting_response', label: 'Waiting for Responses', dot: 'bg-amber-500', countBg: 'bg-amber-100 text-amber-800' },
    { id: 'done', label: 'Done', dot: 'bg-emerald-500', countBg: 'bg-emerald-100 text-emerald-800' },
  ];

  const priorityConfigs: Record<TaskPriority, { label: string; icon: React.ReactNode; bg: string }> = {
    urgent: {
      label: 'Urgent',
      icon: <Flame className="w-3 h-3 text-rose-600" />,
      bg: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    high: {
      label: 'High',
      icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
      bg: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    medium: {
      label: 'Medium',
      icon: <ArrowUp className="w-3 h-3 text-blue-600" />,
      bg: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    low: {
      label: 'Low',
      icon: <ArrowDown className="w-3 h-3 text-slate-500" />,
      bg: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
            Team Task Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize deliverables across 4 stages, set priority levels, and track stopwatch sessions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Data Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Search & Filtering System */}
      <TaskFilterBar />

      {/* Main View: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No matching tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assignee = users.find((u) => u.id === task.assigneeId);
                      const isRunning = activeRunningTaskId === task.id;
                      const currentSecs = task.loggedSeconds + (isRunning ? activeTimerLiveSeconds : 0);
                      const isOverdue = task.dueDate < todayStr && task.status !== 'done';
                      const priCfg = priorityConfigs[task.priority];

                      return (
                        <div
                          key={task.id}
                          className={`bg-white rounded-xl p-3.5 border transition-all hover:border-slate-300 hover:shadow-xs flex flex-col justify-between ${
                            isRunning ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-xs' : 'border-slate-200'
                          }`}
                        >
                          <div>
                            {/* Card Top Metadata: Priority & Due Date */}
                            <div className="flex items-center justify-between gap-1 mb-2 text-xs">
                              
                              {/* Prominent Priority Selector */}
                              <div className="relative inline-flex items-center">
                                <select
                                  value={task.priority}
                                  onChange={(e) => updateTaskPriority(task.id, e.target.value as TaskPriority)}
                                  className={`pl-1.5 pr-4 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase border appearance-none cursor-pointer focus:outline-none ${priCfg.bg}`}
                                  title="Change Priority"
                                >
                                  <option value="urgent">🔥 URGENT</option>
                                  <option value="high">⚠️ HIGH</option>
                                  <option value="medium">⬆️ MEDIUM</option>
                                  <option value="low">⬇️ LOW</option>
                                </select>
                                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] opacity-60">▼</span>
                              </div>

                              {/* Due Date */}
                              <span className={`text-[11px] font-mono flex items-center gap-1 ${
                                isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                              }`}>
                                {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                                <span>Due {task.dueDate}</span>
                              </span>
                            </div>

                            {/* Title */}
                            <h4
                              onClick={() => setSelectedTask(task)}
                              className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug"
                            >
                              {task.title}
                            </h4>

                            {/* Blocker alert if waiting */}
                            {task.status === 'waiting_response' && (
                              <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                                ⚠️ <span className="font-semibold">Waiting:</span> {task.waitingReason || 'Awaiting response'}
                              </div>
                            )}

                            {/* Tags */}
                            {task.tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-2">
                                {task.tags.slice(0, 2).map((tg) => (
                                  <span key={tg} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                                    #{tg}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Assignee, Timer, Actions */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            {/* Assignee Avatar */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              {assignee?.avatar ? (
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className="w-5 h-5 rounded-full object-cover border"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center">
                                  {assignee?.name.charAt(0) || '?'}
                                </div>
                              )}
                              <span className="text-[11px] text-slate-600 truncate max-w-[80px]">
                                {assignee?.name.split(' ')[0]}
                              </span>
                            </div>

                            {/* Right Controls: Stopwatch & WhatsApp */}
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Timer indicator & Toggle */}
                              <button
                                onClick={() => {
                                  if (isRunning) pauseTaskTimer(task.id);
                                  else startTaskTimer(task.id);
                                }}
                                className={`flex items-center gap-1 px-2 py-0.8 text-[11px] font-mono rounded font-medium transition-colors ${
                                  isRunning
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                                title={isRunning ? 'Pause Timer' : 'Start Timer'}
                              >
                                {isRunning ? (
                                  <Pause className="w-3 h-3 fill-current" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current" />
                                )}
                                <span>{formatHoursDecimal(currentSecs)}</span>
                              </button>

                              {/* WhatsApp Quick Link */}
                              <button
                                onClick={() => openWhatsAppModal({ task, recipient: assignee })}
                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Send WhatsApp alert"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Data Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Deliverable</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3 text-right">Time Tracked</th>
                  <th className="py-3 px-3 text-right">Due Date</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    const isRunning = activeRunningTaskId === task.id;
                    const currentSecs = task.loggedSeconds + (isRunning ? activeTimerLiveSeconds : 0);
                    const priCfg = priorityConfigs[task.priority];
                    const isOverdue = task.dueDate < todayStr && task.status !== 'done';

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="hover:text-indigo-600 text-left line-clamp-1 truncate"
                          >
                            {task.title}
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="relative inline-flex items-center">
                            <select
                              value={task.priority}
                              onChange={(e) => updateTaskPriority(task.id, e.target.value as TaskPriority)}
                              className={`pl-1.5 pr-4 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase border appearance-none cursor-pointer focus:outline-none ${priCfg.bg}`}
                              title="Change Priority"
                            >
                              <option value="urgent">🔥 URGENT</option>
                              <option value="high">⚠️ HIGH</option>
                              <option value="medium">⬆️ MEDIUM</option>
                              <option value="low">⬇️ LOW</option>
                            </select>
                            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] opacity-60">▼</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                              task.status === 'done'
                                ? 'bg-emerald-50 text-emerald-800'
                                : task.status === 'ongoing'
                                ? 'bg-blue-50 text-blue-800'
                                : task.status === 'waiting_response'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'done'
                                  ? 'bg-emerald-500'
                                  : task.status === 'ongoing'
                                  ? 'bg-blue-500'
                                  : task.status === 'waiting_response'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600">{task.department}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {assignee?.avatar ? (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-5 h-5 rounded-full object-cover border"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center">
                                {assignee?.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-slate-800 truncate">{assignee?.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                          {formatHoursDecimal(currentSecs)} / {task.estimatedHours}h
                        </td>

                        <td className={`py-3 px-3 text-right font-mono tabular-nums ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {task.dueDate}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                if (isRunning) pauseTaskTimer(task.id);
                                else startTaskTimer(task.id);
                              }}
                              className={`p-1.5 rounded transition-colors ${
                                isRunning ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                              title="Timer"
                            >
                              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            </button>
                            <button
                              onClick={() => openWhatsAppModal({ task, recipient: assignee })}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                              title="WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

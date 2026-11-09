import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  X, 
  Play, 
  Pause, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Tag, 
  User as UserIcon, 
  MessageSquare, 
  FileText, 
  History, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Flame,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react';
import { TaskStatus, TaskPriority, TaskComment } from '../types';
import { formatTimeSeconds, formatHoursDecimal, openWhatsAppChat, WhatsAppTemplates } from '../services/whatsapp';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTaskStatus,
    updateTaskPriority,
    updateTask,
    deleteTask,
    users,
    currentUser,
    activeRunningTaskId,
    activeTimerLiveSeconds,
    startTaskTimer,
    pauseTaskTimer,
    comments,
    addComment,
    sessions,
    openWhatsAppModal,
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'comments' | 'notes' | 'sessions'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isUpdateNote, setIsUpdateNote] = useState(false);
  const [noteCategory, setNoteCategory] = useState<TaskComment['updateCategory']>('progress');
  const [waitingReasonInput, setWaitingReasonInput] = useState('');
  const [isEditingWaitingReason, setIsEditingWaitingReason] = useState(false);

  if (!selectedTask) return null;

  const assignee = users.find((u) => u.id === selectedTask.assigneeId);
  const creator = users.find((u) => u.id === selectedTask.creatorId);
  const taskComments = comments.filter((c) => c.taskId === selectedTask.id);
  const regularComments = taskComments.filter((c) => !c.isUpdateNote);
  const updateNotes = taskComments.filter((c) => c.isUpdateNote);
  const taskSessions = sessions.filter((s) => s.taskId === selectedTask.id);

  const isTimerRunningOnThis = activeRunningTaskId === selectedTask.id;
  const currentTotalSeconds = selectedTask.loggedSeconds + (isTimerRunningOnThis ? activeTimerLiveSeconds : 0);
  const estSeconds = selectedTask.estimatedHours * 3600;
  const progressPercent = Math.min(100, Math.round((currentTotalSeconds / (estSeconds || 1)) * 100));

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'waiting_response') {
      const reason = prompt('What / Who is this task waiting for?', selectedTask.waitingReason || 'Waiting on feedback from stakeholder');
      if (reason !== null) {
        updateTaskStatus(selectedTask.id, 'waiting_response', reason);
      }
    } else {
      updateTaskStatus(selectedTask.id, newStatus);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedTask.id, commentText.trim(), isUpdateNote, noteCategory);
    setCommentText('');
    setIsUpdateNote(false);
  };

  const handleUpdateWaitingReason = () => {
    if (waitingReasonInput.trim()) {
      updateTask(selectedTask.id, { waitingReason: waitingReasonInput.trim() });
      setIsEditingWaitingReason(false);
    }
  };

  const priorityConfigs: Record<TaskPriority, { label: string; icon: React.ReactNode; bg: string; dot: string; desc: string }> = {
    urgent: {
      label: 'Urgent',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600" />,
      bg: 'text-rose-700 bg-rose-50 border-rose-200',
      dot: 'bg-rose-500',
      desc: 'Critical path, requires immediate attention',
    },
    high: {
      label: 'High Priority',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
      bg: 'text-amber-800 bg-amber-50 border-amber-200',
      dot: 'bg-amber-500',
      desc: 'Core sprint objective, high business impact',
    },
    medium: {
      label: 'Medium Priority',
      icon: <ArrowUp className="w-3.5 h-3.5 text-blue-600" />,
      bg: 'text-blue-700 bg-blue-50 border-blue-200',
      dot: 'bg-blue-500',
      desc: 'Standard priority, normal delivery schedule',
    },
    low: {
      label: 'Low Priority',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
      bg: 'text-slate-600 bg-slate-100 border-slate-200',
      dot: 'bg-slate-400',
      desc: 'Minor refinement or low urgency backlog',
    },
  };

  const statusConfigs: Record<TaskStatus, { label: string; dot: string; bg: string }> = {
    new: { label: 'New', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-700' },
    ongoing: { label: 'Ongoing', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700' },
    waiting_response: { label: 'Waiting for Responses', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-800' },
    done: { label: 'Done', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-800' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5 text-xs">
              {/* Interactive Priority Badge */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedTask.priority}
                  onChange={(e) => updateTaskPriority(selectedTask.id, e.target.value as TaskPriority)}
                  className={`pl-2 pr-6 py-0.5 rounded font-semibold text-xs border appearance-none cursor-pointer focus:outline-none ${priorityConfigs[selectedTask.priority].bg}`}
                  title="Click to change task priority level"
                >
                  <option value="urgent">🔥 URGENT</option>
                  <option value="high">⚠️ HIGH</option>
                  <option value="medium">⬆️ MEDIUM</option>
                  <option value="low">⬇️ LOW</option>
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] opacity-60">▼</span>
              </div>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-medium">{selectedTask.department}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono text-[11px]">Due {selectedTask.dueDate}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 font-display leading-tight">
              {selectedTask.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp Notify Button */}
            <button
              onClick={() => openWhatsAppModal({ task: selectedTask, recipient: assignee })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Send WhatsApp message about this task"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setSelectedTask(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          
          {/* Status Bar, Priority Control & Timer Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            
            {/* Status Selector */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Workflow Status
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['new', 'ongoing', 'waiting_response', 'done'] as TaskStatus[]).map((status) => {
                  const isCurrent = selectedTask.status === status;
                  const cfg = statusConfigs[status];
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all text-left ${
                        isCurrent
                          ? 'border-indigo-600 bg-white text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task Prioritization Block */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block flex items-center justify-between">
                <span>Task Priority</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">editable</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((pri) => {
                  const isCurrent = selectedTask.priority === pri;
                  const cfg = priorityConfigs[pri];
                  return (
                    <button
                      key={pri}
                      onClick={() => updateTaskPriority(selectedTask.id, pri)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all text-left ${
                        isCurrent
                          ? 'border-indigo-600 bg-white text-slate-900 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                      title={cfg.desc}
                    >
                      {cfg.icon}
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stopwatch & Timer Box */}
            <div className="lg:col-span-4 bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Stopwatch & Hours
                  </span>
                  <div className="font-mono text-lg font-bold text-slate-900 tabular-nums flex items-baseline gap-1 mt-0.5">
                    <span>{formatTimeSeconds(currentTotalSeconds)}</span>
                    <span className="text-[11px] font-normal text-slate-500 font-sans">
                      / {selectedTask.estimatedHours}h
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isTimerRunningOnThis ? (
                    <button
                      onClick={() => pauseTaskTimer(selectedTask.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startTaskTimer(selectedTask.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent > 100
                      ? 'bg-rose-500'
                      : isTimerRunningOnThis
                      ? 'bg-emerald-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Blocked / Waiting for Response Alert Callout */}
          {selectedTask.status === 'waiting_response' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-amber-900">
                        Waiting for Responses / Blocker Active
                      </h4>
                      {selectedTask.waitingSince && (
                        <span className="text-[11px] text-amber-700 font-mono">
                          (since {new Date(selectedTask.waitingSince).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                    
                    {isEditingWaitingReason ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={waitingReasonInput}
                          onChange={(e) => setWaitingReasonInput(e.target.value)}
                          placeholder="e.g. Waiting on client confirmation..."
                          className="text-xs bg-white border border-amber-300 rounded px-2.5 py-1 text-slate-800 w-80 focus:outline-none"
                        />
                        <button
                          onClick={handleUpdateWaitingReason}
                          className="px-2.5 py-1 text-xs bg-amber-600 text-white font-medium rounded hover:bg-amber-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-800 mt-1 font-medium">
                        "{selectedTask.waitingReason || 'Awaiting external feedback or response'}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsEditingWaitingReason(true);
                      setWaitingReasonInput(selectedTask.waitingReason || '');
                    }}
                    className="text-xs text-amber-800 hover:text-amber-950 underline font-medium"
                  >
                    Edit reason
                  </button>

                  <button
                    onClick={() =>
                      openWhatsAppModal({
                        task: selectedTask,
                        recipient: assignee,
                        defaultType: 'waiting_ping',
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ping via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Task Details & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Description & Tags */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description & Scope
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  {selectedTask.description}
                </p>
              </div>

              {selectedTask.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee & People */}
            <div className="md:col-span-4 space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assignee & Team
              </h4>

              {assignee && (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {assignee.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {assignee.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {assignee.roleTitle}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openWhatsAppModal({
                        task: selectedTask,
                        recipient: assignee,
                      })
                    }
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title={`Chat with ${assignee.name} on WhatsApp`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Created By */}
              {creator && (
                <div className="text-[11px] text-slate-500 px-1">
                  Created by <strong>{creator.name}</strong> on {new Date(selectedTask.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Activity Section: Comments, Update Notes, Work Sessions */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'comments'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({regularComments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Update Notes ({updateNotes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'sessions'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Work Sessions ({taskSessions.length})</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline">
                Real-time activity sync active
              </span>
            </div>

            {/* Tab: Discussion Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {regularComments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No comments yet. Start the conversation below.
                    </div>
                  ) : (
                    regularComments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {comment.authorAvatar ? (
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {comment.authorName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment or query..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Post Comment
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Formal Update Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {updateNotes.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No milestone update notes recorded yet.
                    </div>
                  ) : (
                    updateNotes.map((note) => {
                      const categoryBadges: Record<string, { bg: string; text: string; label: string }> = {
                        progress: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'Progress Update' },
                        blocker: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Blocker / Waiting' },
                        resolution: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Resolution' },
                        general: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-800', label: 'Note' },
                      };
                      const cat = categoryBadges[note.updateCategory || 'general'];
                      return (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border ${cat.bg} text-xs space-y-1.5`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${cat.text} text-[10px] uppercase tracking-wider`}>
                                {cat.label}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-semibold text-slate-800">{note.authorName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 tabular-nums">
                              {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Update Note Form */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Add Milestone / Blocker Note</span>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as TaskComment['updateCategory'])}
                      className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium"
                    >
                      <option value="progress">🔵 Progress Update</option>
                      <option value="blocker">🔴 Blocker / Waiting Reason</option>
                      <option value="resolution">🟢 Resolution / Completion</option>
                      <option value="general">⚪ General Note</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="e.g. Completed initial API endpoints; waiting on schema review..."
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!commentText.trim()) return;
                        addComment(selectedTask.id, commentText.trim(), true, noteCategory);
                        setCommentText('');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Work Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {taskSessions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No individual work sessions recorded yet. Start the stopwatch above to begin tracking.
                  </div>
                ) : (
                  taskSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-semibold text-slate-800">{session.userName}</div>
                          <div className="text-[11px] text-slate-500">{session.note || 'Work session'}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatTimeSeconds(session.durationSeconds)}
                        </div>
                        <div className="text-[10px] text-slate-400 tabular-nums">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(selectedTask.id);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>

          <button
            onClick={() => setSelectedTask(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

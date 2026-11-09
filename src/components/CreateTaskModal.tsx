import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Plus, Send, Clock, User, Calendar, Tag, ShieldAlert, Flame, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Department, TaskPriority, TaskStatus } from '../types';

export const CreateTaskModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createTask, users, currentUser } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [assigneeId, setAssigneeId] = useState(users[1]?.id || users[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [tagsInput, setTagsInput] = useState('Core');
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createTask(
      {
        title: title.trim(),
        description: description.trim(),
        status: 'new',
        priority,
        assigneeId,
        creatorId: currentUser.id,
        department,
        dueDate,
        estimatedHours: Number(estimatedHours) || 4,
        tags: parsedTags.length > 0 ? parsedTags : ['General'],
      },
      sendWhatsAppAlert
    );

    // Reset and close
    setTitle('');
    setDescription('');
    setIsCreateModalOpen(false);
  };

  const selectedAssignee = users.find((u) => u.id === assigneeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Create & Assign New Task</h3>
              <p className="text-xs text-slate-500">
                Set clear deliverables, time targets, and instant WhatsApp assignment alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth 2.0 PKCE flow for mobile clients"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Provide specifications, acceptance criteria, links, or blocker notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-600 resize-none leading-relaxed"
            />
          </div>

          {/* Department & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Quality & Ops">Quality & Ops</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Prioritization Feature */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Task Priority Level</span>
              <span className="text-[11px] text-slate-500 font-normal">Sets execution order and radar urgency</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'urgent' as TaskPriority, label: 'Urgent', icon: <Flame className="w-3.5 h-3.5 text-rose-600" />, activeClass: 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-500' },
                { id: 'high' as TaskPriority, label: 'High', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />, activeClass: 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500' },
                { id: 'medium' as TaskPriority, label: 'Medium', icon: <ArrowUp className="w-3.5 h-3.5 text-blue-600" />, activeClass: 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500' },
                { id: 'low' as TaskPriority, label: 'Low', icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />, activeClass: 'border-slate-500 bg-slate-100 text-slate-900 ring-1 ring-slate-400' },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? p.activeClass
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Est. Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Backend, Security, Sprint-4"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* WhatsApp Alert Option */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsAppAlert}
                onChange={(e) => setSendWhatsAppAlert(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  Auto-generate WhatsApp Assignment Alert
                </span>
                <p className="text-emerald-800 mt-0.5">
                  Sends formatted assignment details to {selectedAssignee?.name} ({selectedAssignee?.phone}) and logs it in the notification stream.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

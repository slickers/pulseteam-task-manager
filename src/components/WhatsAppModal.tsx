import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  User, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { WhatsAppTemplates, createWhatsAppLink, openWhatsAppChat, recordAndDispatchWhatsApp } from '../services/whatsapp';
import { WhatsAppNotification, Task, User as TeamUser } from '../types';

export const WhatsAppModal: React.FC = () => {
  const { 
    isWhatsAppModalOpen, 
    setIsWhatsAppModalOpen, 
    whatsAppData, 
    users, 
    tasks, 
    currentUser, 
    notifications 
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [templateType, setTemplateType] = useState<WhatsAppNotification['type']>('assignment');
  const [messageBody, setMessageBody] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Hydrate from whatsAppData prop when opened
  useEffect(() => {
    if (!isWhatsAppModalOpen) return;

    if (whatsAppData?.task) {
      setSelectedTaskId(whatsAppData.task.id);
      setSelectedRecipientId(whatsAppData.recipient?.id || whatsAppData.task.assigneeId);
      if (whatsAppData.defaultType) {
        setTemplateType(whatsAppData.defaultType);
      }
    } else {
      // Default to first ongoing or waiting task
      const candidate = tasks.find((t) => t.status === 'waiting_response') || tasks[0];
      if (candidate) {
        setSelectedTaskId(candidate.id);
        setSelectedRecipientId(candidate.assigneeId);
      }
    }
  }, [isWhatsAppModalOpen, whatsAppData, tasks]);

  // Update recipient phone when recipient changes
  const activeRecipient = users.find((u) => u.id === selectedRecipientId);
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (activeRecipient) {
      setCustomPhone(activeRecipient.phone);
    }
  }, [activeRecipient]);

  // Generate template text whenever task, recipient, or template type changes
  useEffect(() => {
    if (whatsAppData?.prefilledMessage) {
      setMessageBody(whatsAppData.prefilledMessage);
      return;
    }

    if (!activeTask || !activeRecipient) return;

    if (templateType === 'assignment') {
      setMessageBody(WhatsAppTemplates.taskAssignment(activeTask, activeRecipient, currentUser));
    } else if (templateType === 'status_change') {
      setMessageBody(WhatsAppTemplates.statusChange(activeTask, activeTask.status, currentUser, activeRecipient));
    } else if (templateType === 'waiting_ping') {
      setMessageBody(WhatsAppTemplates.waitingResponsePing(activeTask, activeRecipient, currentUser));
    } else if (templateType === 'completion') {
      setMessageBody(WhatsAppTemplates.taskCompleted(activeTask, activeRecipient));
    }
  }, [templateType, selectedTaskId, selectedRecipientId, currentUser, activeTask, activeRecipient, whatsAppData]);

  if (!isWhatsAppModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatchDirect = () => {
    const phoneToUse = customPhone.trim() || activeRecipient?.phone || '+6281234567890';
    const recipientNameToUse = activeRecipient?.name || 'Team Member';
    const taskTitleToUse = activeTask?.title || 'Team Task';

    recordAndDispatchWhatsApp({
      taskId: activeTask?.id || 'manual-task',
      taskTitle: taskTitleToUse,
      recipientName: recipientNameToUse,
      recipientPhone: phoneToUse,
      message: messageBody,
      type: templateType,
      openDirectly: true,
    });

    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      setIsWhatsAppModalOpen(false);
    }, 1200);
  };

  const handleLogOnly = () => {
    const phoneToUse = customPhone.trim() || activeRecipient?.phone || '+6281234567890';
    recordAndDispatchWhatsApp({
      taskId: activeTask?.id || 'manual-task',
      taskTitle: activeTask?.title || 'Team Task',
      recipientName: activeRecipient?.name || 'Team Member',
      recipientPhone: phoneToUse,
      message: messageBody,
      type: templateType,
      openDirectly: false,
    });

    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span>WhatsApp Notification Dispatcher</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Direct wa.me
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Notify staff and supervisors directly on their WhatsApp numbers
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-3 shrink-0">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'compose'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Compose Notification
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Dispatch History</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
              {notifications.length}
            </span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'compose' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-6 space-y-3.5">
                
                {/* Template Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notification Template
                  </label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as WhatsAppNotification['type'])}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="assignment">📋 Task Assignment Notice</option>
                    <option value="waiting_ping">⏳ Blocker Escalation (Waiting for Response)</option>
                    <option value="status_change">🔔 Task Status Update</option>
                    <option value="completion">🎉 Task Completed Notice</option>
                    <option value="custom">✍️ Custom Message</option>
                  </select>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Task
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.status.toUpperCase()}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient
                    </label>
                    <select
                      value={selectedRecipientId}
                      onChange={(e) => setSelectedRecipientId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Phone
                    </label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+6281234567890"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Message Body Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Message Content (Supports WhatsApp *bold*, _italics_)
                    </label>
                    <button
                      onClick={handleCopy}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-800 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Realistic WhatsApp Phone Bubble Preview */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>WhatsApp Message Preview</span>
                  <span className="text-[11px] text-slate-400">Recipient sees:</span>
                </div>

                {/* WhatsApp Chat Simulation Container */}
                <div className="flex-1 rounded-xl bg-[#EFEAE2] p-4 flex flex-col justify-between border border-slate-300 min-h-[260px] relative">
                  
                  {/* WhatsApp Chat Header */}
                  <div className="bg-[#075E54] text-white rounded-lg p-2 flex items-center gap-2 mb-3 shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {activeRecipient?.name.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">
                        {activeRecipient?.name || 'PulseTeam Recipient'}
                      </div>
                      <div className="text-[10px] text-emerald-100 truncate font-mono">
                        {customPhone || '+628...'}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="self-end max-w-[92%] bg-[#E7FFDB] rounded-lg p-3 text-xs text-slate-900 shadow-xs border border-[#CDEEB7] relative leading-relaxed whitespace-pre-wrap font-sans">
                    {messageBody}
                    <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-slate-500 tabular-nums">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-500 font-bold">✓✓</span>
                    </div>
                  </div>

                  <div className="mt-3 text-center text-[10px] text-slate-500 bg-white/70 backdrop-blur-xs py-1 rounded-md">
                    🔒 Messages are sent via official WhatsApp Web API (wa.me)
                  </div>
                </div>

                {dispatchedSuccess && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Notification logged and launched in WhatsApp!</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No WhatsApp notifications dispatched yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {notif.recipientName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {notif.recipientPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => openWhatsAppChat(notif.recipientPhone, notif.message)}
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Re-open</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 font-mono whitespace-pre-wrap bg-white p-2 rounded border border-slate-200/60">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        {activeTab === 'compose' && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 gap-3">
            <button
              onClick={handleLogOnly}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Save notification to history without opening WhatsApp client"
            >
              Log to PulseTeam Feed Only
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDispatchDirect}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-200 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in WhatsApp Web/App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

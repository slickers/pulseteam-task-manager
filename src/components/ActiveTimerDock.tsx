import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Play, Pause, Square, ExternalLink, Clock, MessageSquare } from 'lucide-react';
import { formatTimeSeconds } from '../services/whatsapp';

export const ActiveTimerDock: React.FC = () => {
  const {
    tasks,
    activeRunningTaskId,
    activeTimerLiveSeconds,
    pauseTaskTimer,
    setSelectedTask,
    users,
  } = useTasks();

  const [sessionNote, setSessionNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!activeRunningTaskId) return null;

  const runningTask = tasks.find((t) => t.id === activeRunningTaskId);
  if (!runningTask) return null;

  const assignee = users.find((u) => u.id === runningTask.assigneeId);
  const totalSeconds = runningTask.loggedSeconds + activeTimerLiveSeconds;

  const handleStopAndSave = () => {
    pauseTaskTimer(runningTask.id, sessionNote.trim() || undefined);
    setSessionNote('');
    setShowNoteInput(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-lg w-full sm:w-auto shadow-xl">
      <div className="bg-slate-900 text-white rounded-xl border border-slate-700 p-3 sm:p-4 shadow-2xl backdrop-blur-lg">
        <div className="flex items-center justify-between gap-4">
          
          {/* Pulse Indicator & Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Clock className="w-4 h-4 animate-spin [animation-duration:4s]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Timer Active
                </span>
                <span className="text-slate-400 text-xs truncate">·</span>
                <span className="text-slate-300 text-xs truncate max-w-[140px] sm:max-w-[200px]">
                  {assignee?.name || 'Staff'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-100 truncate max-w-[180px] sm:max-w-[240px]">
                {runningTask.title}
              </p>
            </div>
          </div>

          {/* Stopwatch & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="font-mono text-base sm:text-lg font-bold text-white tabular-nums tracking-wider">
                {formatTimeSeconds(totalSeconds)}
              </div>
              <div className="text-[10px] text-slate-400 tabular-nums">
                + {formatTimeSeconds(activeTimerLiveSeconds)} this run
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  showNoteInput ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Add work session note"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedTask(runningTask)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="View task full details"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleStopAndSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                title="Pause timer and log time session"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            </div>
          </div>
        </div>

        {/* Optional quick note input */}
        {showNoteInput && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="What did you work on during this session?..."
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStopAndSave();
              }}
            />
            <button
              onClick={handleStopAndSave}
              className="px-2.5 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Save & Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

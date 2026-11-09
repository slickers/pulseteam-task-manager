import React, { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { 
  CheckSquare, 
  Play, 
  Pause, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Tag, 
  Plus, 
  Filter, 
  Search,
  X,
  RotateCcw,
  Flame,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { formatTimeSeconds, formatHoursDecimal } from '../../services/whatsapp';
import { Task, TaskStatus, TaskPriority, DueDateFilterOption } from '../../types';
import { PRIORITY_WEIGHTS } from '../../context/TaskContext';

export const MyTasksView: React.FC = () => {
  const {
    tasks,
    currentUser,
    users,
    setSelectedTask,
    startTaskTimer,
    pauseTaskTimer,
    activeRunningTaskId,
    activeTimerLiveSeconds,
    updateTaskStatus,
    updateTaskPriority,
    openWhatsAppModal,
    setIsCreateModalOpen,
  } = useTasks();

  // Local filter states for personalized task view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDueDate, setFilterDueDate] = useState<DueDateFilterOption>('all');
  const [sortByPriority, setSortByPriority] = useState<boolean>(true);

  // Find supervisor (SPV) for quick escalation
  const spvUser = users.find((u) => u.role === 'spv') || users[0];

  // Tasks assigned to currently logged in user
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return myTasks
      .filter((task) => {
        // Keyword match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Status match
        if (filterStatus !== 'all' && task.status !== filterStatus) return false;

        // Priority match
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

        // Due date match
        if (filterDueDate !== 'all') {
          if (filterDueDate === 'overdue') {
            if (!(task.dueDate < todayStr && task.status !== 'done')) return false;
          } else if (filterDueDate === 'today') {
            if (task.dueDate !== todayStr) return false;
          } else if (filterDueDate === 'this_week') {
            if (!(task.dueDate >= todayStr && task.dueDate <= nextWeekStr)) return false;
          } else if (filterDueDate === 'upcoming') {
            if (task.dueDate < todayStr) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortByPriority) {
          const diff = (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
          if (diff !== 0) return diff;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [myTasks, searchQuery, filterStatus, filterPriority, filterDueDate, sortByPriority, todayStr, nextWeekStr]);

  const myOngoing = myTasks.filter((t) => t.status === 'ongoing');
  const myWaiting = myTasks.filter((t) => t.status === 'waiting_response');
  const myDone = myTasks.filter((t) => t.status === 'done');
  const totalMyLoggedSeconds = myTasks.reduce((acc, t) => acc + t.loggedSeconds, 0);
  const totalMyLoggedHours = totalMyLoggedSeconds / 3600;

  // Active running task for this user if any
  const runningTask = myTasks.find((t) => t.id === activeRunningTaskId);

  const priorityConfigs: Record<TaskPriority, { label: string; icon: React.ReactNode; bg: string }> = {
    urgent: {
      label: 'Urgent',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600" />,
      bg: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    high: {
      label: 'High',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
      bg: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    medium: {
      label: 'Medium',
      icon: <ArrowUp className="w-3.5 h-3.5 text-blue-600" />,
      bg: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    low: {
      label: 'Low',
      icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
      bg: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  };

  const hasActiveFilters = searchQuery.trim() !== '' || filterStatus !== 'all' || filterPriority !== 'all' || filterDueDate !== 'all';

  const resetMyFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterDueDate('all');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Profile & Focus Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                {currentUser.name}'s Focus Queue
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentUser.roleTitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {myOngoing.length} in progress · {myWaiting.length} waiting for responses · {myDone.length} finished this sprint
            </p>
          </div>
        </div>

        {/* Weekly Time Tracker Meter & SPV Hotline */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <div className="text-xs text-slate-500 font-medium">Logged This Week</div>
            <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {totalMyLoggedHours.toFixed(1)}h <span className="text-xs font-normal text-slate-400">/ {currentUser.weeklyCapacityHours}h</span>
            </div>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${Math.min(100, (totalMyLoggedHours / currentUser.weeklyCapacityHours) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() =>
              openWhatsAppModal({
                recipient: spvUser,
                defaultType: 'custom',
                prefilledMessage: `Hi ${spvUser.name}, quick question regarding my assigned tasks on PulseTeam...`,
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl transition-colors"
            title="Chat directly with your supervisor on WhatsApp"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask SPV</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Stopwatch Card (if this user is currently tracking time) */}
      {runningTask && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Currently Timing Work Session
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${priorityConfigs[runningTask.priority].bg}`}>
                    {runningTask.priority.toUpperCase()}
                  </span>
                </div>
                <h3 
                  onClick={() => setSelectedTask(runningTask)}
                  className="text-base font-bold text-white hover:text-indigo-200 cursor-pointer truncate max-w-md mt-0.5"
                >
                  {runningTask.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-mono text-2xl font-extrabold text-white tabular-nums tracking-wide">
                  {formatTimeSeconds(runningTask.loggedSeconds + activeTimerLiveSeconds)}
                </div>
                <div className="text-[11px] text-slate-300">
                  Target: {runningTask.estimatedHours}h
                </div>
              </div>

              <button
                onClick={() => pauseTaskTimer(runningTask.id)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause & Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Search & Filtering System for My Tasks */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search my tasks by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-7 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Priority Filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filterPriority !== 'all'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="Filter by Priority"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">🔥 Urgent Priority</option>
                <option value="high">⚠️ High Priority</option>
                <option value="medium">⬆️ Medium Priority</option>
                <option value="low">⬇️ Low Priority</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filterStatus !== 'all'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="Filter by Status"
              >
                <option value="all">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="waiting_response">Waiting for Responses</option>
                <option value="new">New</option>
                <option value="done">Done</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Due Date Filter */}
            <div className="relative">
              <select
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value as DueDateFilterOption)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filterDueDate !== 'all'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="Filter by Due Date"
              >
                <option value="all">All Due Dates</option>
                <option value="overdue">⚠️ Overdue</option>
                <option value="today">📅 Due Today</option>
                <option value="this_week">🗓️ Due This Week</option>
                <option value="upcoming">⏳ Upcoming</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Priority Sorting Toggle */}
            <button
              onClick={() => setSortByPriority(!sortByPriority)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                sortByPriority
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle priority sorting (Urgent & High first)"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortByPriority ? 'Priority: Urgent First' : 'Due Date First'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetMyFilters}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Status Count Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'all', label: `All Tasks (${myTasks.length})` },
              { id: 'ongoing', label: `In Progress (${myOngoing.length})` },
              { id: 'waiting_response', label: `Waiting on Responses (${myWaiting.length})` },
              { id: 'done', label: `Done (${myDone.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium shrink-0">
            Matching: <strong className="text-slate-800 font-mono">{filteredTasks.length}</strong>
          </span>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No tasks match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query, priority filter, or status tab.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetMyFilters}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isRunning = activeRunningTaskId === task.id;
            const currentSecs = task.loggedSeconds + (isRunning ? activeTimerLiveSeconds : 0);
            const estSecs = task.estimatedHours * 3600;
            const pct = Math.min(100, Math.round((currentSecs / (estSecs || 1)) * 100));
            const isOverdue = task.dueDate < todayStr && task.status !== 'done';
            const priCfg = priorityConfigs[task.priority];

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between hover:border-slate-300 hover:shadow-xs ${
                  isRunning ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-xs' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top card metadata: Prominent Priority Display & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* Prominent Task Priority Display & Quick Switcher */}
                      <div className="relative inline-flex items-center">
                        <select
                          value={task.priority}
                          onChange={(e) => updateTaskPriority(task.id, e.target.value as TaskPriority)}
                          className={`pl-1.5 pr-5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase border appearance-none cursor-pointer focus:outline-none ${priCfg.bg}`}
                          title="Change Task Priority"
                        >
                          <option value="urgent">🔥 URGENT</option>
                          <option value="high">⚠️ HIGH</option>
                          <option value="medium">⬆️ MEDIUM</option>
                          <option value="low">⬇️ LOW</option>
                        </select>
                        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] opacity-60">▼</span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-800'
                            : task.status === 'ongoing'
                            ? 'bg-blue-50 text-blue-800'
                            : task.status === 'waiting_response'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>

                      <span className="text-slate-400">·</span>

                      {/* Due Date Indicator */}
                      <span className={`font-mono text-[11px] flex items-center gap-1 ${
                        isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>Due {task.dueDate}</span>
                      </span>
                    </div>

                    {/* WhatsApp share */}
                    <button
                      onClick={() =>
                        openWhatsAppModal({
                          task,
                          recipient: spvUser,
                          defaultType: 'status_change',
                        })
                      }
                      className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                      title="Share status update via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Title */}
                  <h3
                    onClick={() => setSelectedTask(task)}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug"
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Waiting reason banner if applicable */}
                  {task.status === 'waiting_response' && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Blocker: </span>
                        <span>"{task.waitingReason || 'Waiting on feedback'}"</span>
                      </div>
                    </div>
                  )}

                  {/* Timer Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isRunning ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
                        <span className="font-mono font-bold text-slate-800 tabular-nums">
                          {formatTimeSeconds(currentSecs)}
                        </span>
                        <span className="text-slate-400 text-[11px]">/ {task.estimatedHours}h est.</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">{pct}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct > 100 ? 'bg-rose-500' : isRunning ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Status Bumper Buttons */}
                  <div className="flex items-center gap-1">
                    {task.status !== 'ongoing' && task.status !== 'done' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'ongoing')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Start Working
                      </button>
                    )}

                    {task.status !== 'waiting_response' && task.status !== 'done' && (
                      <button
                        onClick={() => {
                          const reason = prompt('What is this task waiting for?', task.waitingReason || '');
                          if (reason !== null) {
                            updateTaskStatus(task.id, 'waiting_response', reason);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                      >
                        Mark Blocked
                      </button>
                    )}

                    {task.status !== 'done' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'done')}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>

                  {/* Stopwatch Toggle */}
                  <div>
                    {isRunning ? (
                      <button
                        onClick={() => pauseTaskTimer(task.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-colors"
                      >
                        <Pause className="w-3 h-3 fill-current" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startTaskTimer(task.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Timer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Layers,
  ArrowUpRight,
  Flame,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Filter
} from 'lucide-react';
import { formatHoursDecimal, formatTimeSeconds } from '../../services/whatsapp';
import { TaskFilterBar } from '../TaskFilterBar';
import { TaskPriority } from '../../types';

export const ProductivityDashboard: React.FC = () => {
  const { 
    tasks, 
    filteredTasks, 
    filters, 
    setFilter, 
    activeFilterCount, 
    resetFilters, 
    users, 
    sessions, 
    setSelectedTask, 
    openWhatsAppModal 
  } = useTasks();

  // Metrics computed against active filtered set if filters are active, or all tasks
  const displayTasks = activeFilterCount > 0 ? filteredTasks : tasks;
  const totalTasksCount = displayTasks.length;
  const doneTasks = displayTasks.filter((t) => t.status === 'done');
  const ongoingTasks = displayTasks.filter((t) => t.status === 'ongoing');
  const waitingTasks = displayTasks.filter((t) => t.status === 'waiting_response');
  const newTasks = displayTasks.filter((t) => t.status === 'new');

  const completionRate = totalTasksCount > 0 ? Math.round((doneTasks.length / totalTasksCount) * 100) : 0;
  const totalLoggedSeconds = displayTasks.reduce((acc, t) => acc + t.loggedSeconds, 0);
  const totalEstimatedHours = displayTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalLoggedHours = totalLoggedSeconds / 3600;

  // Priority distribution counts
  const urgentTasks = displayTasks.filter((t) => t.priority === 'urgent');
  const highTasks = displayTasks.filter((t) => t.priority === 'high');
  const mediumTasks = displayTasks.filter((t) => t.priority === 'medium');
  const lowTasks = displayTasks.filter((t) => t.priority === 'low');

  // Workload per team member
  const memberWorkload = users.map((user) => {
    const userTasks = displayTasks.filter((t) => t.assigneeId === user.id);
    const userLoggedSecs = userTasks.reduce((acc, t) => acc + t.loggedSeconds, 0);
    const userEstHours = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    const userDoneCount = userTasks.filter((t) => t.status === 'done').length;
    const utilizationPct = Math.round((userEstHours / (user.weeklyCapacityHours || 40)) * 100);

    return {
      user,
      totalTasks: userTasks.length,
      doneTasks: userDoneCount,
      activeTasks: userTasks.filter((t) => t.status === 'ongoing' || t.status === 'new').length,
      waitingTasks: userTasks.filter((t) => t.status === 'waiting_response').length,
      loggedHours: userLoggedSecs / 3600,
      estimatedHours: userEstHours,
      utilizationPct,
    };
  });

  // Department breakdown
  const departments = ['Engineering', 'Design', 'Marketing', 'Quality & Ops'] as const;
  const deptStats = departments.map((dept) => {
    const deptTasks = displayTasks.filter((t) => t.department === dept);
    const deptLogged = deptTasks.reduce((acc, t) => acc + t.loggedSeconds, 0) / 3600;
    const deptEst = deptTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    return {
      name: dept,
      taskCount: deptTasks.length,
      loggedHours: deptLogged,
      estimatedHours: deptEst,
      doneCount: deptTasks.filter((t) => t.status === 'done').length,
    };
  });

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['Task ID', 'Title', 'Status', 'Priority', 'Department', 'Assignee', 'Est Hours', 'Logged Hours (h)', 'Due Date'];
    const rows = displayTasks.map((t) => {
      const assigneeName = users.find((u) => u.id === t.assigneeId)?.name || 'Unassigned';
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.department,
        `"${assigneeName}"`,
        t.estimatedHours,
        (t.loggedSeconds / 3600).toFixed(2),
        t.dueDate,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulseteam_productivity_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const priorityBadgeClasses: Record<TaskPriority, string> = {
    urgent: 'text-rose-700 bg-rose-50 border-rose-200',
    high: 'text-amber-800 bg-amber-50 border-amber-200',
    medium: 'text-blue-700 bg-blue-50 border-blue-200',
    low: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Sprint Analytics & Workload
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-slate-500 text-xs">Real-time Organization Metrics</span>
            {activeFilterCount > 0 && (
              <>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeFilterCount} Active Filters Applied
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Team Productivity & Workload Distribution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track resource utilization, bottlenecks, and delivery turnaround across the entire team.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Download CSV report of current view"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Easily Accessible Search & Filtering System on Dashboard */}
      <TaskFilterBar />

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Completion Velocity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Completion Velocity</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {completionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{doneTasks.length} of {totalTasksCount} tasks done</span>
            <span className="text-emerald-600 font-semibold">+8% vs baseline</span>
          </div>
        </div>

        {/* Metric 2: Total Hours Tracked */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Total Time Tracked</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-indigo-600 tabular-nums">
            {totalLoggedHours.toFixed(1)}h
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Target: {totalEstimatedHours}h estimated</span>
            <span className="text-slate-400 font-mono text-[11px]">{sessions.length} sessions logged</span>
          </div>
        </div>

        {/* Metric 3: Active Ongoing Pipeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">In Flight / Ongoing</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-blue-600 tabular-nums">
            {ongoingTasks.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Active work</span>
            <span className="text-blue-600 font-medium">{newTasks.length} queued</span>
          </div>
        </div>

        {/* Metric 4: Bottleneck Health */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Waiting for Responses</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-600 tabular-nums">
            {waitingTasks.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Awaiting external input</span>
            <span className="text-amber-700 font-semibold">Flagged for SPV</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Workload Distribution + Status & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Team Member Workload Allocation */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Workload Distribution Across Team</span>
              </h3>
              <p className="text-xs text-slate-500">
                Capacity utilization and assigned tasks per staff member
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              40h weekly baseline
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {memberWorkload.map(({ user, totalTasks, doneTasks, activeTasks, waitingTasks, loggedHours, estimatedHours, utilizationPct }) => (
              <div
                key={user.id}
                className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-[10px] font-normal text-slate-500">({user.department})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {activeTasks} active · {waitingTasks} waiting · {doneTasks} completed
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {loggedHours.toFixed(1)}h logged
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {estimatedHours}h assigned ({utilizationPct}%)
                    </span>
                  </div>
                </div>

                {/* Utilization Gauge */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilizationPct > 85
                        ? 'bg-rose-500'
                        : utilizationPct < 40
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Task Prioritization & Status Distribution */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dedicated Task Priority Breakdown Box with 1-click Filter Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Task Priority Breakdown</span>
              </h3>
              <span className="text-[11px] text-slate-400">Click to filter</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Urgent Card */}
              <button
                onClick={() => setFilter('priority', filters.priority === 'urgent' ? 'all' : 'urgent')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filters.priority === 'urgent'
                    ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Urgent
                  </span>
                  <span className="font-mono font-bold text-rose-900 text-sm">{urgentTasks.length}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalTasksCount > 0 ? Math.round((urgentTasks.length / totalTasksCount) * 100) : 0}% of deliverables
                </div>
              </button>

              {/* High Card */}
              <button
                onClick={() => setFilter('priority', filters.priority === 'high' ? 'all' : 'high')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filters.priority === 'high'
                    ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-1 ring-amber-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    High
                  </span>
                  <span className="font-mono font-bold text-amber-900 text-sm">{highTasks.length}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalTasksCount > 0 ? Math.round((highTasks.length / totalTasksCount) * 100) : 0}% of deliverables
                </div>
              </button>

              {/* Medium Card */}
              <button
                onClick={() => setFilter('priority', filters.priority === 'medium' ? 'all' : 'medium')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filters.priority === 'medium'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                    Medium
                  </span>
                  <span className="font-mono font-bold text-blue-900 text-sm">{mediumTasks.length}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalTasksCount > 0 ? Math.round((mediumTasks.length / totalTasksCount) * 100) : 0}% of deliverables
                </div>
              </button>

              {/* Low Card */}
              <button
                onClick={() => setFilter('priority', filters.priority === 'low' ? 'all' : 'low')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filters.priority === 'low'
                    ? 'border-slate-600 bg-slate-100 shadow-xs ring-1 ring-slate-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                    Low
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{lowTasks.length}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalTasksCount > 0 ? Math.round((lowTasks.length / totalTasksCount) * 100) : 0}% of deliverables
                </div>
              </button>
            </div>
          </div>

          {/* Status Breakdown Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Status Distribution</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Done / Completed</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {doneTasks.length} ({totalTasksCount > 0 ? Math.round((doneTasks.length / totalTasksCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${totalTasksCount > 0 ? (doneTasks.length / totalTasksCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Ongoing / In Progress</span>
                  <span className="font-mono font-bold text-blue-700">
                    {ongoingTasks.length} ({totalTasksCount > 0 ? Math.round((ongoingTasks.length / totalTasksCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${totalTasksCount > 0 ? (ongoingTasks.length / totalTasksCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">Waiting for Responses</span>
                  <span className="font-mono font-bold text-amber-700">
                    {waitingTasks.length} ({totalTasksCount > 0 ? Math.round((waitingTasks.length / totalTasksCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${totalTasksCount > 0 ? (waitingTasks.length / totalTasksCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 font-medium">New / Unstarted</span>
                  <span className="font-mono font-bold text-slate-700">
                    {newTasks.length} ({totalTasksCount > 0 ? Math.round((newTasks.length / totalTasksCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full"
                    style={{ width: `${totalTasksCount > 0 ? (newTasks.length / totalTasksCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Deliverables Drilldown on Dashboard */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Matching Deliverables Drilldown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tasks satisfying current filter criteria. Click any task to inspect details or log time.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-semibold">
            {displayTasks.length} deliverables
          </span>
        </div>

        {displayTasks.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No tasks match the selected filters on the dashboard.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayTasks.slice(0, 6).map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${priorityBadgeClasses[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="font-semibold text-slate-900 truncate">
                      {task.title}
                    </span>
                    <span className="text-slate-400 hidden md:inline">·</span>
                    <span className="text-slate-500 hidden md:inline">{task.department}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-500">
                    <span className="font-mono text-[11px]">Due {task.dueDate}</span>
                    <span className="font-medium text-slate-800">{assignee?.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

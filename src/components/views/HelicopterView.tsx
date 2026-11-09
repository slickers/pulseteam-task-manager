import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { 
  Compass, 
  AlertTriangle, 
  Users, 
  Clock, 
  Send, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  Filter, 
  ChevronRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { formatHoursDecimal, formatTimeSeconds, openWhatsAppChat } from '../../services/whatsapp';
import { Task, User, Department } from '../../types';

export const HelicopterView: React.FC = () => {
  const {
    tasks,
    users,
    currentUser,
    setSelectedTask,
    openWhatsAppModal,
    startTaskTimer,
    pauseTaskTimer,
    activeRunningTaskId,
  } = useTasks();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [workloadSort, setWorkloadSort] = useState<'load' | 'name'>('load');

  // Filter tasks by department if selected
  const filteredTasks = selectedDept === 'All' 
    ? tasks 
    : tasks.filter((t) => t.department === selectedDept);

  // High-level operational metrics
  const totalTasks = filteredTasks.length;
  const ongoingTasks = filteredTasks.filter((t) => t.status === 'ongoing');
  const waitingTasks = filteredTasks.filter((t) => t.status === 'waiting_response');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');
  const newTasks = filteredTasks.filter((t) => t.status === 'new');

  const totalLoggedSeconds = filteredTasks.reduce((acc, t) => acc + t.loggedSeconds, 0);
  const totalEstimatedHours = filteredTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalTeamCapacityHours = users.reduce((acc, u) => acc + u.weeklyCapacityHours, 0);
  const totalLoggedHours = totalLoggedSeconds / 3600;
  const overallLoadPercent = Math.min(100, Math.round((totalEstimatedHours / totalTeamCapacityHours) * 100));

  // Staff workload distribution calculations
  const staffWorkload = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id);
    const activeCount = userTasks.filter((t) => t.status === 'ongoing' || t.status === 'new').length;
    const waitingCount = userTasks.filter((t) => t.status === 'waiting_response').length;
    const doneCount = userTasks.filter((t) => t.status === 'done').length;
    const userLoggedHours = userTasks.reduce((acc, t) => acc + t.loggedSeconds, 0) / 3600;
    const userEstHours = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
    const loadPercentage = Math.round((userEstHours / (user.weeklyCapacityHours || 40)) * 100);

    let loadStatus: 'optimal' | 'available' | 'overloaded' = 'optimal';
    if (loadPercentage > 85) loadStatus = 'overloaded';
    else if (loadPercentage < 40) loadStatus = 'available';

    return {
      user,
      tasks: userTasks,
      activeCount,
      waitingCount,
      doneCount,
      totalCount: userTasks.length,
      loggedHours: userLoggedHours,
      estHours: userEstHours,
      loadPercentage,
      loadStatus,
    };
  });

  if (workloadSort === 'load') {
    staffWorkload.sort((a, b) => b.loadPercentage - a.loadPercentage);
  } else {
    staffWorkload.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }

  // Blocker Radar (Waiting for responses tasks)
  const blockerTasks = tasks.filter((t) => t.status === 'waiting_response');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Helicopter Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Compass className="w-3.5 h-3.5" />
                Supervisor Helicopter Altitude
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-mono">Real-time Command Center</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Organization Workflow & Workload Radar
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              360° operational visibility across staff capacity, active bottlenecks, time tracking, and direct WhatsApp escalations.
            </p>
          </div>

          {/* Quick SPV Action Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openWhatsAppModal()}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Active Tasks</span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {ongoingTasks.length + newTasks.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Across 4 departments
            </span>
          </div>

          <div>
            <span className="text-[11px] text-amber-400 font-medium block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Waiting / Blocked
            </span>
            <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {waitingTasks.length}
            </span>
            <span className="text-[11px] text-amber-200/70 block mt-0.5">
              Requires SPV review
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Time Logged (Week)</span>
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {totalLoggedHours.toFixed(1)}h
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              of {totalEstimatedHours}h targeted
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Org Bandwidth Load</span>
            <span className="font-mono text-2xl font-bold text-indigo-300 tabular-nums">
              {overallLoadPercent}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Team capacity healthy
            </span>
          </div>
        </div>
      </div>

      {/* Bottleneck Escalation Radar (Waiting for responses) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Bottleneck Radar (Tasks Waiting for Responses)
              </h3>
              <p className="text-xs text-slate-500">
                Tasks blocked by clients, external dependencies, or approvals that require manager follow-up
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {blockerTasks.length} Active Blockers
          </span>
        </div>

        {blockerTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-lg">
            🎉 No tasks currently blocked or waiting for response! Workflow is running smoothly.
          </div>
        ) : (
          <div className="space-y-3">
            {blockerTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  className="p-4 bg-amber-50/60 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        task.priority === 'urgent' ? 'text-rose-700 bg-rose-100 border-rose-300' :
                        task.priority === 'high' ? 'text-amber-800 bg-amber-100 border-amber-300' :
                        task.priority === 'medium' ? 'text-blue-700 bg-blue-100 border-blue-300' :
                        'text-slate-600 bg-slate-100 border-slate-200'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="font-semibold text-amber-900 uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                        Blocked
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-medium">{task.department}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono text-[11px]">Due {task.dueDate}</span>
                    </div>

                    <h4 
                      onClick={() => setSelectedTask(task)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
                    >
                      {task.title}
                    </h4>

                    <div className="mt-1 text-xs text-amber-900/90 font-medium flex items-center gap-1.5">
                      <span className="font-semibold">Reason:</span>
                      <span className="italic">"{task.waitingReason || 'Awaiting external feedback'}"</span>
                    </div>
                  </div>

                  {/* Assignee & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    {assignee && (
                      <div className="flex items-center gap-2">
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-8 h-8 rounded-full object-cover border"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {assignee.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-left hidden sm:block">
                          <div className="text-xs font-semibold text-slate-900">{assignee.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{assignee.phone}</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        openWhatsAppModal({
                          task,
                          recipient: assignee,
                          defaultType: 'waiting_ping',
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                      title="Ping on WhatsApp to resolve blocker"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ping on WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Workload Distribution Radar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Team Workload & Capacity Radar</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live capacity breakdown per team member to prevent burnout and balance sprint assignments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by:</span>
            <select
              value={workloadSort}
              onChange={(e) => setWorkloadSort(e.target.value as 'load' | 'name')}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="load">Highest Capacity Load</option>
              <option value="name">Staff Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Grid of Team Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffWorkload.map(({ user, tasks, activeCount, waitingCount, doneCount, loggedHours, estHours, loadPercentage, loadStatus }) => {
            const statusBadgeColors = {
              optimal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              available: 'bg-blue-50 text-blue-800 border-blue-200',
              overloaded: 'bg-rose-50 text-rose-800 border-rose-200',
            };

            const statusText = {
              optimal: 'Balanced Load',
              available: 'Bandwidth Available',
              overloaded: 'Near Capacity Limit',
            };

            return (
              <div
                key={user.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {user.roleTitle}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadgeColors[loadStatus]}`}>
                      {statusText[loadStatus]}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 mb-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Sprint Capacity</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {estHours}h / {user.weeklyCapacityHours}h ({loadPercentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPercentage > 85
                            ? 'bg-rose-500'
                            : loadPercentage < 40
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, loadPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Task counts count */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-lg border border-slate-200/80 mb-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active</span>
                      <span className="font-mono font-bold text-blue-600">{activeCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Waiting</span>
                      <span className="font-mono font-bold text-amber-600">{waitingCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Done</span>
                      <span className="font-mono font-bold text-emerald-600">{doneCount}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    Logged: <strong className="text-slate-800 font-mono">{loggedHours.toFixed(1)}h</strong>
                  </div>

                  <button
                    onClick={() =>
                      openWhatsAppModal({
                        recipient: user,
                        defaultType: 'custom',
                        prefilledMessage: `👋 Hi ${user.name}, checking in on your current sprint workload from the supervisor helicopter view. How are your ongoing tasks progressing?`,
                      })
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Send className="w-3 h-3 text-emerald-600" />
                    <span>Nudge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Status Matrix */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Full Organization Status Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Filter by department to view all deliverables across the 4 stages
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['All', 'Engineering', 'Design', 'Marketing', 'Quality & Ops'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Status Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Column: New */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                New Assignments
              </span>
              <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {newTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {newTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-xs"
                >
                  <p className="font-semibold text-slate-900 line-clamp-2">{t.title}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{users.find((u) => u.id === t.assigneeId)?.name.split(' ')[0]}</span>
                    <span className="font-mono">{t.estimatedHours}h est.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Ongoing */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/80">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                In Progress / Ongoing
              </span>
              <span className="font-mono text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                {ongoingTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {ongoingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-2.5 bg-white rounded-lg border border-blue-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer text-xs"
                >
                  <p className="font-semibold text-slate-900 line-clamp-2">{t.title}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{users.find((u) => u.id === t.assigneeId)?.name.split(' ')[0]}</span>
                    <span className="font-mono font-medium text-blue-700">
                      {formatHoursDecimal(t.loggedSeconds)} / {t.estimatedHours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Waiting */}
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/90">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Waiting for Responses
              </span>
              <span className="font-mono text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                {waitingTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {waitingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-2.5 bg-white rounded-lg border border-amber-300 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer text-xs"
                >
                  <p className="font-semibold text-slate-900 line-clamp-2">{t.title}</p>
                  <p className="text-[10px] text-amber-800 mt-1 italic truncate">
                    ⚠️ {t.waitingReason || 'Awaiting response'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Done */}
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/80">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed / Done
              </span>
              <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {doneTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {doneTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-2.5 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer text-xs opacity-90"
                >
                  <p className="font-medium text-slate-800 line-clamp-2 line-through">{t.title}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{users.find((u) => u.id === t.assigneeId)?.name.split(' ')[0]}</span>
                    <span className="font-mono text-emerald-700">
                      {formatHoursDecimal(t.loggedSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

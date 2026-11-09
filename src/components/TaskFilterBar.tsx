import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Search, 
  X, 
  Filter, 
  RotateCcw, 
  Calendar, 
  User as UserIcon, 
  Flame, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { TaskPriority, TaskStatus, DueDateFilterOption, SortOption } from '../types';

interface TaskFilterBarProps {
  showAssigneeFilter?: boolean;
  showStatusFilter?: boolean;
  showDepartmentFilter?: boolean;
  compact?: boolean;
  customTaskCount?: number;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  showAssigneeFilter = true,
  showStatusFilter = true,
  showDepartmentFilter = true,
  compact = false,
  customTaskCount,
}) => {
  const { filters, setFilter, setFilters, resetFilters, activeFilterCount, filteredTasks, tasks, users } = useTasks();
  const [showCustomDate, setShowCustomDate] = useState(filters.dueDate === 'custom');

  const totalMatching = customTaskCount !== undefined ? customTaskCount : filteredTasks.length;

  const priorityOptions: { value: string; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'all', label: 'All Priorities', icon: null, color: 'text-slate-600' },
    { value: 'urgent', label: 'Urgent', icon: <Flame className="w-3.5 h-3.5 text-rose-600" />, color: 'text-rose-700 font-semibold' },
    { value: 'high', label: 'High Priority', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />, color: 'text-amber-800 font-semibold' },
    { value: 'medium', label: 'Medium Priority', icon: <ArrowUp className="w-3.5 h-3.5 text-blue-600" />, color: 'text-blue-700' },
    { value: 'low', label: 'Low Priority', icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />, color: 'text-slate-600' },
  ];

  const statusOptions: { value: string; label: string; dot: string }[] = [
    { value: 'all', label: 'All Statuses', dot: 'bg-slate-300' },
    { value: 'new', label: 'New', dot: 'bg-slate-400' },
    { value: 'ongoing', label: 'Ongoing', dot: 'bg-blue-500' },
    { value: 'waiting_response', label: 'Waiting for Responses', dot: 'bg-amber-500' },
    { value: 'done', label: 'Done', dot: 'bg-emerald-500' },
  ];

  const dueDateOptions: { value: DueDateFilterOption; label: string; hint?: string }[] = [
    { value: 'all', label: 'All Due Dates' },
    { value: 'overdue', label: '⚠️ Overdue' },
    { value: 'today', label: '📅 Due Today' },
    { value: 'this_week', label: '🗓️ Due This Week' },
    { value: 'upcoming', label: '⏳ Upcoming' },
    { value: 'custom', label: '🎯 Specific Date...' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'priority_desc', label: 'Priority: Highest First' },
    { value: 'due_date_asc', label: 'Due Date: Soonest First' },
    { value: 'title_asc', label: 'Task Title (A-Z)' },
  ];

  const handleDueDateChange = (val: DueDateFilterOption) => {
    if (val === 'custom') {
      setShowCustomDate(true);
      const today = new Date().toISOString().split('T')[0];
      setFilters({ dueDate: 'custom', customDueDate: filters.customDueDate || today });
    } else {
      setShowCustomDate(false);
      setFilter('dueDate', val);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 space-y-3">
      {/* Main Bar: Keyword Search + Quick Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        
        {/* Keyword Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, description, tags, or assignee..."
            value={filters.searchKeyword}
            onChange={(e) => setFilter('searchKeyword', e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
          {filters.searchKeyword && (
            <button
              onClick={() => setFilter('searchKeyword', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Priority Filter */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                filters.priority !== 'all'
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
              }`}
              title="Filter by Priority"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          {showStatusFilter && (
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filters.status !== 'all'
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
                title="Filter by Workflow Status"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Assignee Filter */}
          {showAssigneeFilter && (
            <div className="relative">
              <select
                value={filters.assigneeId}
                onChange={(e) => setFilter('assigneeId', e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filters.assigneeId !== 'all'
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
                title="Filter by Assignee"
              >
                <option value="all">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Due Date Filter */}
          <div className="relative">
            <select
              value={filters.dueDate}
              onChange={(e) => handleDueDateChange(e.target.value as DueDateFilterOption)}
              className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                filters.dueDate !== 'all'
                  ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
              }`}
              title="Filter by Due Date"
            >
              {dueDateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Custom Date Input if 'custom' is selected */}
          {showCustomDate && (
            <input
              type="date"
              value={filters.customDueDate || ''}
              onChange={(e) => setFilter('customDueDate', e.target.value)}
              className="text-xs bg-slate-50 border border-indigo-300 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 focus:outline-none"
            />
          )}

          {/* Department Filter */}
          {showDepartmentFilter && (
            <div className="relative">
              <select
                value={filters.department}
                onChange={(e) => setFilter('department', e.target.value)}
                className={`text-xs pl-2.5 pr-7 py-2 rounded-lg border appearance-none font-medium transition-colors cursor-pointer focus:outline-none focus:border-indigo-600 ${
                  filters.department !== 'all'
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
                title="Filter by Department"
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Quality & Ops">Quality & Ops</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value as SortOption)}
              className="text-xs pl-2.5 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium appearance-none cursor-pointer hover:bg-slate-100/70 focus:outline-none focus:border-indigo-600"
              title="Sort Tasks"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors whitespace-nowrap"
              title="Reset all search queries and active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags & Count Summary Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-slate-600">
            Showing <strong className="text-slate-900 font-mono tabular-nums">{totalMatching}</strong> of{' '}
            <span className="font-mono tabular-nums">{tasks.length}</span> tasks
          </span>

          {/* Priority pill */}
          {filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Priority: <strong className="capitalize">{filters.priority}</strong>
              <button
                onClick={() => setFilter('priority', 'all')}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Status pill */}
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Status: <strong className="capitalize">{filters.status.replace('_', ' ')}</strong>
              <button
                onClick={() => setFilter('status', 'all')}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Assignee pill */}
          {filters.assigneeId !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Assignee:{' '}
              <strong>{users.find((u) => u.id === filters.assigneeId)?.name || 'User'}</strong>
              <button
                onClick={() => setFilter('assigneeId', 'all')}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Due date pill */}
          {filters.dueDate !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Due:{' '}
              <strong className="capitalize">
                {filters.dueDate === 'custom' ? filters.customDueDate : filters.dueDate.replace('_', ' ')}
              </strong>
              <button
                onClick={() => {
                  setFilter('dueDate', 'all');
                  setShowCustomDate(false);
                }}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Department pill */}
          {filters.department !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Dept: <strong>{filters.department}</strong>
              <button
                onClick={() => setFilter('department', 'all')}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Keyword pill */}
          {filters.searchKeyword.trim() && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              Keyword: "<strong>{filters.searchKeyword}</strong>"
              <button
                onClick={() => setFilter('searchKeyword', '')}
                className="hover:text-rose-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Quick clear link if filters active */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-slate-500 hover:text-rose-600 underline font-medium shrink-0"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

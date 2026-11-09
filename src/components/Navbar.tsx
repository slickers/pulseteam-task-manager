import React from 'react';
import { useTasks, AppView } from '../context/TaskContext';
import { 
  Plus, 
  Send, 
  Radio, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Compass, 
  Kanban, 
  CheckSquare, 
  BarChart3,
  Users,
  KeyRound
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    setIsCreateModalOpen,
    openWhatsAppModal,
    setIsUserSwitcherOpen,
    setIsLoginModalOpen,
    activeRunningTaskId,
    notifications,
  } = useTasks();

  const navItems: { id: AppView; label: string; icon: React.ReactNode; spvBadge?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { 
      id: 'helicopter', 
      label: 'Helicopter View', 
      icon: <Compass className="w-4 h-4" />,
      spvBadge: true,
    },
    { id: 'board', label: 'Task Board', icon: <Kanban className="w-4 h-4" /> },
    { id: 'my_tasks', label: 'My Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 transition-transform group-hover:scale-105">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap block">
                  PulseTeam
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean 4 Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.spvBadge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                      SPV
                    </span>
                  )}
                  {item.id === 'my_tasks' && activeRunningTaskId && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & User Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* WhatsApp Quick Hub */}
            <button
              onClick={() => openWhatsAppModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Open WhatsApp Notification Dispatcher"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
              {notifications.length > 0 && (
                <span className="font-mono text-[11px] bg-emerald-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* User Profile / Role & Team Switcher */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsUserSwitcherOpen(true)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-slate-100 border border-slate-200/80 transition-colors text-left"
                title="Manage team members, switch roles, or add members"
              >
                <div className="relative">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      currentUser.role === 'spv' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    {currentUser.role === 'spv' ? (
                      <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                    {currentUser.role === 'spv' ? 'Supervisor / SPV' : currentUser.roleTitle}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 rounded-lg transition-colors"
                title="Log in with email/password or register new account"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Sign In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

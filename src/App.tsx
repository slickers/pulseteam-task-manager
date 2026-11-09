/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { ActiveTimerDock } from './components/ActiveTimerDock';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { LoginModal } from './components/LoginModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { HelicopterView } from './components/views/HelicopterView';
import { MyTasksView } from './components/views/MyTasksView';
import { TaskBoardView } from './components/views/TaskBoardView';
import { ProductivityDashboard } from './components/views/ProductivityDashboard';

const MainLayout: React.FC = () => {
  const { currentView } = useTasks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'dashboard' && <ProductivityDashboard />}
        {currentView === 'helicopter' && <HelicopterView />}
        {currentView === 'board' && <TaskBoardView />}
        {currentView === 'my_tasks' && <MyTasksView />}
      </main>

      {/* Floating Active Timer Dock */}
      <ActiveTimerDock />

      {/* Interactive Modals */}
      <TaskDetailModal />
      <CreateTaskModal />
      <WhatsAppModal />
      <UserSwitcherModal />
      <LoginModal />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 py-6 mt-auto bg-white/70 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-600">
            PulseTeam &middot; Real-time Task Management &amp; Supervisor Command
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Stopwatch Timers</span>
            <span>&middot;</span>
            <span>WhatsApp Notifications</span>
            <span>&middot;</span>
            <span>Helicopter View</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainLayout />
    </TaskProvider>
  );
}

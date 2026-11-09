import React from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Check, ShieldCheck, UserCheck, Phone, Briefcase, Info } from 'lucide-react';
import { User } from '../types';

export const UserSwitcherModal: React.FC = () => {
  const { users, currentUser, setCurrentUser, isUserSwitcherOpen, setIsUserSwitcherOpen } = useTasks();

  if (!isUserSwitcherOpen) return null;

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setIsUserSwitcherOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Switch Active Team Member</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a profile to experience role-based views (Manager/SPV vs Staff)
            </p>
          </div>
          <button
            onClick={() => setIsUserSwitcherOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Explanation Note */}
        <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Supervisor (SPV) Role:</span> Unlocks Helicopter View, Organization Workload Radar, Bottleneck Escalations, and Reassignment.
            <div className="mt-1">
              <span className="font-semibold">Staff Member Role:</span> Focuses on "My Tasks" queue, stopwatch timer tracking, and WhatsApp blocker reports.
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {users.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
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
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        user.role === 'spv' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {user.name}
                      </span>
                      {user.role === 'spv' ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>SPV / Manager</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Staff</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="truncate">{user.roleTitle}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-[11px] text-slate-600 flex items-center gap-1 shrink-0">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 hover:text-indigo-600">
                      Switch
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active user: <strong className="text-slate-800">{currentUser.name}</strong></span>
          <button
            onClick={() => setIsUserSwitcherOpen(false)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  X, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  Briefcase, 
  Info, 
  UserPlus, 
  Trash2, 
  Users, 
  LogIn, 
  LogOut, 
  AlertTriangle,
  Database,
  Building,
  Clock,
  Mail,
  KeyRound
} from 'lucide-react';
import { User, UserRole, Department } from '../types';

export const UserSwitcherModal: React.FC = () => {
  const { 
    users, 
    currentUser, 
    setCurrentUser, 
    isUserSwitcherOpen, 
    setIsUserSwitcherOpen,
    addUser,
    removeUser,
    setIsLoginModalOpen,
    logout
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'switch' | 'manage' | 'add'>('switch');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Add Member Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('staff');
  const [roleTitle, setRoleTitle] = useState('Frontend Developer');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [phone, setPhone] = useState('+62812');
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(40);

  if (!isUserSwitcherOpen) return null;

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setSuccessMessage(`Switched active profile to ${user.name}`);
    setTimeout(() => {
      setSuccessMessage('');
      setIsUserSwitcherOpen(false);
    }, 400);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Name and Email are required.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
      setErrorMessage('A team member with this email address already exists.');
      return;
    }

    const newUser = addUser({
      name: name.trim(),
      email: email.trim(),
      password: password.trim() || 'password123',
      role,
      roleTitle: roleTitle.trim() || (role === 'spv' ? 'Team Lead' : 'Staff Member'),
      department,
      phone: phone.trim() || '+62810000000',
      weeklyCapacityHours: Number(weeklyCapacityHours) || 40,
      avatar: '',
    });

    setSuccessMessage(`Successfully added ${newUser.name} to the team!`);
    // Reset form
    setName('');
    setEmail('');
    setPassword('password123');
    setPhone('+62812');
    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('manage');
    }, 1200);
  };

  const handleRemoveUser = (userId: string) => {
    setErrorMessage('');
    const result = removeUser(userId);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to remove user.');
    } else {
      setDeleteConfirmId(null);
      setSuccessMessage('Team member removed and active tasks safely reassigned.');
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  const handleOpenLoginModal = () => {
    setIsUserSwitcherOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsUserSwitcherOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Team &amp; User Management</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch profiles, add or remove team members, and manage access roles
            </p>
          </div>
          <button
            onClick={() => setIsUserSwitcherOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl my-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('switch');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'manage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Team ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Member</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium shrink-0 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          
          {/* TAB 1: SWITCH PROFILE */}
          {activeTab === 'switch' && (
            <div>
              {/* Role Explanation Note */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex gap-2.5 mb-3">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Supervisor (SPV) Role:</span> Unlocks Helicopter View, Organization Workload Radar, Bottleneck Escalations, and Reassignment.
                  <div className="mt-1">
                    <span className="font-semibold">Staff Member Role:</span> Focuses on "My Tasks" queue, stopwatch timer tracking, and WhatsApp blocker reports.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
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
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center">
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
            </div>
          )}

          {/* TAB 2: MANAGE TEAM (LIST & REMOVE) */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Total Active Members: <strong className="text-slate-800">{users.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New Member</span>
                </button>
              </div>

              <div className="space-y-2">
                {users.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const isConfirmingDelete = deleteConfirmId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                              {user.name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 truncate">
                                {user.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                user.role === 'spv'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {user.role === 'spv' ? 'Supervisor' : 'Staff'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                              <span className="text-slate-600 font-medium">{user.roleTitle}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">{user.department}</span>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono text-slate-600">{user.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-lg border border-rose-200 animate-in fade-in">
                              <span className="text-[11px] font-semibold text-rose-800 px-1">
                                Confirm?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.id)}
                                className="px-2 py-1 bg-rose-600 text-white text-[11px] font-medium rounded hover:bg-rose-700 transition-colors"
                              >
                                Yes, Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-1 text-slate-600 text-[11px] font-medium hover:bg-slate-200 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setErrorMessage('');
                                setDeleteConfirmId(user.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title={`Remove ${user.name} from team`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detail strip */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {user.phone}
                        </span>
                        <span>Capacity: <strong className="font-mono text-slate-700">{user.weeklyCapacityHours}h</strong>/week</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safe Guard explanation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold block mb-0.5">Automated Task Reassignment:</strong>
                When a team member is removed, their active and backlog tasks are automatically reassigned to the Primary Supervisor to avoid orphaned work.
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW TEAM MEMBER */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jordan.lee@pulseteam.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+6281234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Permission
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    <option value="staff">Staff Member (My Tasks &amp; Timers)</option>
                    <option value="spv">Supervisor / Manager (Full Radar &amp; Assignment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Specialist"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

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
                    Weekly Capacity (Hours)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={weeklyCapacityHours}
                    onChange={(e) => setWeeklyCapacityHours(Number(e.target.value) || 40)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Team Member</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Database & Architecture Note */}
        <div className="mt-3 pt-3 border-t border-slate-100 shrink-0">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold text-slate-800">Storage Architecture: </span>
              Active users and tasks are persistently saved in your browser storage with instant multi-tab BroadcastChannel sync. To share data across different laptops or phones, a cloud database (like Firebase Firestore) can be provisioned.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenLoginModal}
              className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Full Login Screen</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            onClick={() => setIsUserSwitcherOpen(false)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

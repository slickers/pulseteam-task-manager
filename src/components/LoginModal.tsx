import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Briefcase, 
  Check, 
  AlertCircle,
  Database
} from 'lucide-react';
import { Department, UserRole } from '../types';

export const LoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    login, 
    addUser, 
    users, 
    currentUser 
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('staff');
  const [regRoleTitle, setRegRoleTitle] = useState('Frontend Engineer');
  const [regDepartment, setRegDepartment] = useState<Department>('Engineering');
  const [regPhone, setRegPhone] = useState('+6281');
  const [regCapacity, setRegCapacity] = useState(40);
  const [regSuccess, setRegSuccess] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = login(email, password);
    if (success) {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setLoginError('Invalid email or password. You can also click any Quick Demo Login profile below.');
    }
  };

  const handleQuickDemoLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    login(userEmail, 'password123');
    setLoginSuccess(true);
    setTimeout(() => {
      setLoginSuccess(false);
      setIsLoginModalOpen(false);
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      alert('A team member with this email already exists.');
      return;
    }

    const newUser = addUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim() || 'password123',
      role: regRole,
      roleTitle: regRoleTitle.trim(),
      department: regDepartment,
      phone: regPhone.trim(),
      weeklyCapacityHours: Number(regCapacity) || 40,
      avatar: '',
    });

    // Auto log in as the newly created user
    login(newUser.email, newUser.password);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsLoginModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                PulseTeam Authentication &amp; Access
              </h3>
              <p className="text-xs text-slate-500">
                Log into your account or register a new team member
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Add New Member */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl my-4 shrink-0">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Account</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setLoginError('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add / Register Member</span>
          </button>
        </div>

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            
            {loginSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Logged in successfully! Redirecting...</span>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.jenkins@pulseteam.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password (default: password123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Sign In
              </button>
            </form>

            {/* Quick Demo Login Affordance */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                1-Click Quick Demo Sign In
              </span>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Click any team member below to instantly log in as them:
              </p>

              <div className="space-y-1.5">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(user.email)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left text-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      user.role === 'spv'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {user.role === 'spv' ? 'SPV / Manager' : 'Staff'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Register New User / Add Team Member */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Team member registered and logged in!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Chen"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. michael.c@pulseteam.internal"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
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
                  placeholder="default: password123"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
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
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Role & Role Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="staff">Staff Member (Focus on My Tasks & Timers)</option>
                  <option value="spv">Supervisor / Manager (Helicopter View & Radar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={regRoleTitle}
                  onChange={(e) => setRegRoleTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Department & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value as Department)}
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
                  min="10"
                  max="60"
                  value={regCapacity}
                  onChange={(e) => setRegCapacity(Number(e.target.value) || 40)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register & Log In Member</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

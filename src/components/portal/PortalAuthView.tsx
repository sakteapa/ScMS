/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - Parent & Student Secure Authentication Portal
 * Powered by Firebase Authentication (SDK v10.8.0)
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  School,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { FirestoreStudent, SchoolClass } from '../../types';
import { INITIAL_USERS } from '../../data/seedUsers';
import { authenticateUser, quickLoginUser, AuthSession } from '../../lib/authService';

interface PortalAuthViewProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  onLoginSuccess: (session: AuthSession) => void;
  onExitToAdmin?: () => void;
}

export const PortalAuthView: React.FC<PortalAuthViewProps> = ({
  students,
  classes,
  onLoginSuccess,
  onExitToAdmin,
}) => {
  const [authMode, setAuthMode] = useState<'parent' | 'student'>('parent');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class_10_a');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter seed users for quick 1-click test logins
  const parentSeedUsers = INITIAL_USERS.filter((u) => u.role === 'Parent');
  const studentSeedUsers = INITIAL_USERS.filter((u) => u.role === 'Student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage(
        authMode === 'parent'
          ? 'Please enter your registered Email or Mobile Number.'
          : 'Please enter your Student Email or Roll Number.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authenticateUser(identifier, password, students);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(
          result.error || 'Authentication failed. Please check your credentials.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (userAccount: (typeof INITIAL_USERS)[0]) => {
    const session = quickLoginUser(userAccount);
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Portal Shield Brand Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-gray-850 to-gray-900 border-b border-gray-800 text-center relative z-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3 shadow-inner">
              <School className="w-8 h-8" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono border border-emerald-500/30 mb-2">
              Firebase Auth v10.8.0 • Secured
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mizoram School System (zoxs-sms)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Nu leh Pa leh Zirlaite Tana Official Portal • Aizawl District
            </p>

            {/* Mode Switcher Tabs: Parent vs Student */}
            <div className="grid grid-cols-2 gap-2 mt-6 p-1.5 bg-gray-950 rounded-2xl border border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('parent');
                  setIdentifier('');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  authMode === 'parent'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parent / Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('student');
                  setIdentifier('');
                  setErrorMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  authMode === 'student'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student (Zirlai)</span>
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  {authMode === 'parent'
                    ? 'Parent Email or Registered Mobile Number'
                    : 'Student Email or Roll Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    {authMode === 'parent' ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      authMode === 'parent'
                        ? 'e.g. zoramthangi.parent@gmail.com or 9862345678'
                        : 'e.g. muanpuia.ralte@student.zoxs-sms.edu.in or Roll 1'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {authMode === 'student' && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Class & Stream
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream ? `(${cls.stream})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    Security Password
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Default demo: Password@123
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying with Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to {authMode === 'parent' ? 'Parent' : 'Student'} Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Profiles */}
            <div className="pt-5 border-t border-gray-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] uppercase tracking-wider font-mono text-gray-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick 1-Click Demo Logins
                </span>
                <span className="text-[10px] text-gray-500 font-mono">No Typing Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {authMode === 'parent' ? (
                  parentSeedUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className="p-2.5 bg-gray-950 hover:bg-indigo-950/40 border border-gray-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                          {user.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Ward: {user.studentName} ({user.assignedClassName})
                      </div>
                    </button>
                  ))
                ) : (
                  studentSeedUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className="p-2.5 bg-gray-950 hover:bg-indigo-950/40 border border-gray-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                          {user.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {user.assignedClassName} • {user.email}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Back to Admin option if opened by staff */}
            {onExitToAdmin && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onExitToAdmin}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 font-medium"
                >
                  <span>Switch to Admin / Staff Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-gray-950/80 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Mizoram Board of School Education (MBSE)</span>
            <span>Ref: zoxs-sms/portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

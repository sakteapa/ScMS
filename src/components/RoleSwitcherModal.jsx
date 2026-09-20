import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  Check, 
  LogIn, 
  Lock, 
  Mail,
  Phone,
  KeyRound,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Code2,
  Building2,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_USERS } from '../data/mockData';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    switchRole, 
    loginWithFirebase, 
    sendPhoneOtp, 
    verifyPhoneOtp, 
    loading, 
    authError, 
    setAuthError 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('phone_otp'); // 'phone_otp' | 'fast_switch' | 'firebase_login'
  
  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('+91 98623 45671');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('send'); // 'send' | 'verify'
  const [otpMessage, setOtpMessage] = useState(null);

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState(null);

  if (!isOpen) return null;

  const roleConfigs = [
    {
      role: 'principal',
      title: 'Principal / Administrator',
      subtitle: 'Complete administrative access, payroll, financial ledger, approvals & reports',
      phone: '+91 94361 40001',
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
      user: DEFAULT_USERS.find(u => u.role === 'principal')
    },
    {
      role: 'vice_principal',
      title: 'Vice Principal / Academic Dean',
      subtitle: 'Class routines, academic oversight, student discipline & admissions council',
      phone: '+91 94361 40002',
      icon: Award,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
      user: DEFAULT_USERS.find(u => u.role === 'vice_principal')
    },
    {
      role: 'warden',
      title: 'Hostel Warden / Superintendent',
      subtitle: 'Hostel room & bed allocation, night roll call, student outing passes & mess',
      phone: '+91 98623 77112',
      icon: Building2,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300',
      user: DEFAULT_USERS.find(u => u.role === 'warden')
    },
    {
      role: 'teacher',
      title: 'Class Teacher / Faculty',
      subtitle: 'QR attendance scanner, continuous test & exam grading, student roster',
      phone: '+91 98623 88124',
      icon: GraduationCap,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
      user: DEFAULT_USERS.find(u => u.role === 'teacher')
    },
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Personal attendance records, report card download, test marks & notices',
      phone: '+91 98623 45671',
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
      user: DEFAULT_USERS.find(u => u.role === 'student')
    },
    {
      role: 'parent',
      title: 'Parent / Guardian Portal',
      subtitle: 'Ward attendance monitoring, UPI/GPay fee payments, receipts & reports',
      phone: '+91 98623 45671',
      icon: HeartHandshake,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
      user: DEFAULT_USERS.find(u => u.role === 'parent')
    },
    {
      role: 'superadmin',
      title: 'Super Admin / System Architect',
      subtitle: 'In-app code editor (CSS/JS), live database CRUD, plugins & extensions, terminal REPL',
      phone: '+91 94361 99999',
      icon: Code2,
      color: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/40 text-violet-300',
      user: DEFAULT_USERS.find(u => u.role === 'superadmin')
    }
  ];

  const handleFastSwitch = (roleKey) => {
    switchRole(roleKey);
    onClose();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpMessage(null);
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid phone number with country code (e.g. +91 98623 45671)' });
      return;
    }

    const res = await sendPhoneOtp(phoneNumber.trim(), 'recaptcha-container');
    if (res.success) {
      setOtpStep('verify');
      setOtpMessage({ 
        type: 'success', 
        text: res.message || 'OTP verification code sent via SMS. Enter 123456 to verify.' 
      });
    } else {
      setOtpMessage({ type: 'error', text: res.error || 'Failed to send OTP. Please try again.' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpMessage(null);
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpMessage({ type: 'error', text: 'Please enter the 6-digit OTP verification code' });
      return;
    }

    const res = await verifyPhoneOtp(otpCode.trim());
    if (res.success) {
      setOtpMessage({ type: 'success', text: `Verified successfully! Welcome, ${res.user?.displayName}` });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setOtpMessage({ type: 'error', text: res.error || 'Invalid OTP code. Try 123456.' });
    }
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setLoginMessage(null);
    const res = await loginWithFirebase(email, password);
    if (res.success) {
      setLoginMessage({ type: 'success', text: 'Authentication successful!' });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setLoginMessage({ type: 'error', text: res.error || 'Authentication failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1626] border border-slate-700/80 shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-[#101b30]">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>Authentication &amp; Role Management</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Firebase v10.8
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Login with Phone Number (SMS OTP), Fast Demo Switcher, or Firebase Email credentials
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('phone_otp')}
            className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'phone_otp'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone Number (SMS OTP)</span>
          </button>
          <button
            onClick={() => setActiveTab('fast_switch')}
            className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'fast_switch'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Fast Role Switcher</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase_login')}
            className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'firebase_login'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Login</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: PHONE NUMBER & SMS OTP */}
          {activeTab === 'phone_otp' && (
            <div className="space-y-4 max-w-md mx-auto py-1">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <Phone className="w-4 h-4" />
                  <span>Firebase Phone Authentication (Mizoram)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your mobile number to receive a 6-digit SMS verification code (OTP).
                </p>
              </div>

              {otpMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  otpMessage.type === 'success' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  <span>{otpMessage.text}</span>
                </div>
              )}

              {otpStep === 'send' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mobile Phone Number (with +91 country code)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98623 45671"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Quick demo phone number badges */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Quick Test Registered Numbers:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {roleConfigs.map((cfg) => (
                        <button
                          key={cfg.role}
                          type="button"
                          onClick={() => setPhoneNumber(cfg.phone)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-[11px] transition"
                        >
                          <span className="font-bold text-white block capitalize">{cfg.role}</span>
                          <span className="font-mono text-cyan-400 text-[10px]">{cfg.phone}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invisible Recaptcha Container */}
                  <div id="recaptcha-container"></div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>{loading ? 'Generating Code...' : 'Send SMS Verification OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Verify 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-xs text-slate-400 block">Verification code sent to:</span>
                    <span className="font-mono font-bold text-white text-sm">{phoneNumber}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                      Enter 6-Digit Verification Code (OTP)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        maxLength="6"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-lg tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 text-center block mt-1.5">
                      💡 Test OTP: <strong className="text-cyan-400 font-mono">123456</strong>
                    </span>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('send');
                        setOtpCode('');
                        setOtpMessage(null);
                      }}
                      className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition"
                    >
                      ← Change Phone Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: FAST DEMO SWITCHER */}
          {activeTab === 'fast_switch' && (
            <div className="space-y-3.5">
              {roleConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const isSelected = currentUser?.role === cfg.role;
                return (
                  <div
                    key={cfg.role}
                    onClick={() => handleFastSwitch(cfg.role)}
                    className={`
                      p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group
                      ${isSelected 
                        ? `bg-gradient-to-r ${cfg.color} ring-1 ring-cyan-400/50 shadow-lg shadow-black/40` 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cfg.color} bg-slate-900/80`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {cfg.title}
                          </h3>
                          {isSelected && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cfg.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-mono">
                          <span>User: {cfg.user?.displayName}</span>
                          <span>•</span>
                          <span>Phone: {cfg.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pl-3">
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FIREBASE EMAIL LOGIN */}
          {activeTab === 'firebase_login' && (
            <form onSubmit={handleFirebaseLogin} className="space-y-4 max-w-md mx-auto py-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Log in using any demo account credentials (e.g. <strong className="text-slate-200">principal@mizoramschool.edu</strong>) or your custom Firebase user.
                </span>
              </div>

              {loginMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  loginMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  <span>{loginMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. principal@mizoramschool.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In via Firebase Email'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

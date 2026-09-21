import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  Award, 
  LogIn, 
  Lock, 
  Mail, 
  Phone, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Globe, 
  School
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { DEFAULT_USERS } from '../data/mockData';

export default function LoginView({ onLoginSuccess, onViewWebsite }) {
  const { 
    loginWithFirebase, 
    loginWithRole, 
    loginAsUser, 
    sendPhoneOtp, 
    verifyPhoneOtp, 
    loading, 
    authError, 
    setAuthError 
  } = useAuth();
  const { systemConfig, activeSchoolInfo } = useSchool();

  const [activeTab, setActiveTab] = useState('fast_switch'); // 'fast_switch' | 'email_login' | 'phone_otp'
  
  // Email Login State
  const [email, setEmail] = useState('principal@mizoramschool.edu');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('+91 94361 40001');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('send'); // 'send' | 'verify'
  const [otpMessage, setOtpMessage] = useState(null);

  const roleCards = [
    {
      role: 'principal',
      title: 'Principal / Headmaster',
      subtitle: 'Full institution control, fee collections, staff duties & MBSE compliance',
      user: DEFAULT_USERS.find(u => u.role === 'principal'),
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300 hover:border-amber-400',
      badge: 'Principal',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: ShieldCheck
    },
    {
      role: 'vice_principal',
      title: 'Vice Principal / Dean',
      subtitle: 'Timetables, academic monitoring, student discipline & admissions',
      user: DEFAULT_USERS.find(u => u.role === 'vice_principal'),
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300 hover:border-blue-400',
      badge: 'Vice Principal',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Award
    },
    {
      role: 'teacher',
      title: 'Class Teacher / Faculty',
      subtitle: 'QR attendance scanner, continuous test entries & term grading',
      user: DEFAULT_USERS.find(u => u.role === 'teacher'),
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300 hover:border-cyan-400',
      badge: 'Faculty',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: GraduationCap
    },
    {
      role: 'warden',
      title: 'Hostel Warden / Superintendent',
      subtitle: 'Hostel rooms, night roll calls, outing gate passes & dining mess',
      user: DEFAULT_USERS.find(u => u.role === 'warden'),
      color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300 hover:border-purple-400',
      badge: 'Warden',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: Building2
    },
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Personal attendance, exam marks, fee receipts, routine & leave requests',
      user: DEFAULT_USERS.find(u => u.role === 'student'),
      color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
      badge: 'Student',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: UserCheck
    },
    {
      role: 'parent',
      title: 'Parent & Guardian Portal',
      subtitle: 'Ward attendance alerts, academic progress report cards & online fees',
      user: DEFAULT_USERS.find(u => u.role === 'parent'),
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300 hover:border-rose-400',
      badge: 'Parent',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: HeartHandshake
    },
    {
      role: 'superadmin',
      title: 'Super Admin / IT Architect',
      subtitle: 'Platform architecture, in-app developer studio & system integrations',
      user: DEFAULT_USERS.find(u => u.role === 'superadmin'),
      color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-300 hover:border-violet-400',
      badge: 'Developer',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      icon: Sparkles
    }
  ];

  const handleFastRoleLogin = (user) => {
    if (!user) return;
    if (loginAsUser) {
      const logged = loginAsUser(user);
      if (onLoginSuccess) onLoginSuccess(logged);
    } else if (loginWithRole) {
      const logged = loginWithRole(user.role);
      if (onLoginSuccess) onLoginSuccess(logged);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginMessage(null);
    if (!email.trim()) {
      setLoginMessage({ type: 'error', text: 'Khawngaihin email address ziak rawh.' });
      return;
    }
    const res = await loginWithFirebase(email.trim(), password);
    if (res.success) {
      setLoginMessage({ type: 'success', text: 'I in-login fel ta e! ✓' });
      setTimeout(() => {
        const matched = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (onLoginSuccess) onLoginSuccess(matched || { role: 'principal' });
      }, 400);
    } else {
      setLoginMessage({ type: 'error', text: res.error || 'Login a tlawlh. Check your email/password.' });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpMessage(null);
    if (!phoneNumber.trim()) {
      setOtpMessage({ type: 'error', text: 'Phone number ziak rawh.' });
      return;
    }
    const res = await sendPhoneOtp(phoneNumber.trim());
    if (res.success) {
      setOtpStep('verify');
      setOtpMessage({ 
        type: 'success', 
        text: res.isDemo 
          ? 'Demo SMS code: 123456 (a hnuai ah hian type rawh le)' 
          : 'OTP SMS phone-ah thawn a ni e!' 
      });
      setOtpCode('123456');
    } else {
      setOtpMessage({ type: 'error', text: res.error || 'OTP thawn theih a ni lo.' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpMessage(null);
    if (!otpCode || otpCode.length < 6) {
      setOtpMessage({ type: 'error', text: 'Digit 6 OTP code ziak rawh (Demo: 123456).' });
      return;
    }
    const res = await verifyPhoneOtp(otpCode.trim());
    if (res.success) {
      setOtpMessage({ type: 'success', text: 'OTP verify fel ta e! ✓' });
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.user || { role: 'parent' });
      }, 400);
    } else {
      setOtpMessage({ type: 'error', text: res.error || 'OTP dik lo. 123456 hmang rawh.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/25 ring-2 ring-white/20 mb-1">
            <School className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <span>{systemConfig?.schoolName || activeSchoolInfo?.name || 'One Heart Academy (OHA)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>MBSE Affiliated</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              Mizoram School ERP Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Principal, Faculty, Student leh Guardian te tan a bika buatsaih School Management System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0b111e]/90 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-bold max-w-lg mx-auto">
            <button
              onClick={() => {
                setActiveTab('fast_switch');
                setLoginMessage(null);
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'fast_switch'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Fast Role Login</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('email_login');
                setLoginMessage(null);
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'email_login'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email & Password</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('phone_otp');
                setOtpMessage(null);
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'phone_otp'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone SMS OTP</span>
            </button>
          </div>

          {/* TAB 1: FAST ROLE SELECTOR (1-Click Instant Login) */}
          {activeTab === 'fast_switch' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">
                  Select your role account to sign in instantly with verified credentials:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 pt-1">
                {roleCards.map((rc) => {
                  const Icon = rc.icon;
                  const u = rc.user;
                  return (
                    <div
                      key={rc.role}
                      onClick={() => handleFastRoleLogin(u)}
                      className={`p-4 rounded-2xl bg-slate-900/60 border ${rc.color} transition cursor-pointer group flex items-start gap-3.5 hover:shadow-lg hover:scale-[1.01]`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u?.displayName || rc.title}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-cyan-400/50 transition"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center">
                          <Icon className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                            {rc.title}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${rc.badgeColor}`}>
                            {rc.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                          {u?.displayName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {rc.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0 self-center">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-white text-slate-400 flex items-center justify-center transition">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD LOGIN */}
          {activeTab === 'email_login' && (
            <div className="max-w-md mx-auto space-y-5">
              {/* Quick Fill Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Quick demo fill credentials:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {DEFAULT_USERS.map((u) => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => {
                        setEmail(u.email);
                        setPassword('123456');
                        setLoginMessage(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                        email === u.email
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address / Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. principal@mizoramschool.edu"
                      required
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Default demo password for test accounts is <span className="font-mono text-cyan-400">123456</span>
                  </p>
                </div>

                {/* Error / Success Feedback */}
                {(loginMessage || authError) && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    (loginMessage?.type === 'success')
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginMessage?.text || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PHONE SMS OTP */}
          {activeTab === 'phone_otp' && (
            <div className="max-w-md mx-auto space-y-5">
              <p className="text-xs text-slate-400 text-center">
                Mizoram School parents and teachers can authenticate using their registered mobile phone number.
              </p>

              {otpStep === 'send' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98623 45671"
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports instant automated demo SMS verification code (123456).
                    </p>
                  </div>

                  {otpMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      otpMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpMessage.text}</span>
                    </div>
                  )}

                  <div id="recaptcha-container" />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{loading ? 'Sending SMS Code...' : 'Send SMS OTP Code'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">Enter 6-Digit SMS OTP</span>
                      <button
                        type="button"
                        onClick={() => setOtpStep('send')}
                        className="text-cyan-400 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                      />
                    </div>
                  </div>

                  {otpMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      otpMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpMessage.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{loading ? 'Verifying Code...' : 'Verify OTP & Enter Portal'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-2">
          <button
            onClick={onViewWebsite}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition py-2 px-4 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>← Return to School Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}

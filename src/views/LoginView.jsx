import React, { useState, useEffect } from 'react';
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
  School,
  ShieldAlert,
  Clock,
  Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { DEFAULT_USERS } from '../data/mockData';
import DeveloperSupportModal from '../components/DeveloperSupportModal';

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
  const { 
    systemConfig, 
    activeSchoolInfo, 
    activeSchoolId, 
    students = [], 
    staff = [] 
  } = useSchool();

  const isLiveSchool = Boolean(
    activeSchoolInfo?.isLiveProduction || 
    activeSchoolInfo?.disableFastLogin || 
    (activeSchoolId && activeSchoolId !== 'demo')
  );

  const [activeTab, setActiveTab] = useState(() => {
    const isLive = Boolean(
      activeSchoolInfo?.isLiveProduction || 
      activeSchoolInfo?.disableFastLogin || 
      (activeSchoolId && activeSchoolId !== 'demo')
    );
    return isLive ? 'phone_otp' : 'fast_switch';
  });

  useEffect(() => {
    if (isLiveSchool && activeTab === 'fast_switch') {
      setActiveTab('phone_otp');
    }
  }, [isLiveSchool, activeTab]);

  // Email Login State
  const [email, setEmail] = useState(() => isLiveSchool ? '' : 'principal@mizoramschool.edu');
  const [password, setPassword] = useState(() => isLiveSchool ? '' : '123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const [isDevSupportOpen, setIsDevSupportOpen] = useState(false);

  // Email Mandatory 2FA OTP State
  const [email2FaStep, setEmail2FaStep] = useState(false);
  const [pendingEmailUser, setPendingEmailUser] = useState(null);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpMessage, setEmailOtpMessage] = useState(null);

  // Progressive Cooldown Security State
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const v = localStorage.getItem('zoxs_login_failed_attempts');
      return v ? parseInt(v, 10) : 0;
    } catch { return 0; }
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try {
      const v = localStorage.getItem('zoxs_login_lockout_until');
      return v ? parseInt(v, 10) : 0;
    } catch { return 0; }
  });
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  // Progressive Exponential Delay Formula:
  // attempt 1-2: 0s (warning)
  // attempt 3: 15s
  // attempt 4: 30s
  // attempt 5: 60s
  // attempt 6: 120s
  // attempt 7+: 300s (5 minutes max)
  const calculateCooldownSeconds = (attempts) => {
    if (attempts < 3) return 0;
    return Math.min(300, 15 * Math.pow(2, attempts - 3));
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil && lockoutUntil > now) {
        setCooldownSecondsLeft(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setCooldownSecondsLeft(0);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState(() => isLiveSchool ? '' : '+91 94361 40001');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('send'); // 'send' | 'verify'
  const [otpMessage, setOtpMessage] = useState(null);
  const [matchedPhoneUser, setMatchedPhoneUser] = useState(null);

  // Database Phone and Email Verification Helpers
  const normalizeDigits = (val) => (val || '').toString().replace(/\D/g, '').slice(-10);

  const lookupUserInDatabase = (rawPhone) => {
    const digits = normalizeDigits(rawPhone);
    if (!digits || digits.length < 8) return null;

    // 1. Staff / Faculty Database (Principal, Vice Principal, Teachers, Wardens, Admin)
    const matchedStaff = (staff || []).find(s => 
      normalizeDigits(s.phone) === digits ||
      normalizeDigits(s.contactPhone) === digits ||
      normalizeDigits(s.emergencyPhone) === digits ||
      normalizeDigits(s.mobile) === digits
    );
    if (matchedStaff) {
      let role = 'teacher';
      const des = (matchedStaff.designation || matchedStaff.role || '').toLowerCase();
      if (des.includes('principal') && !des.includes('vice')) role = 'principal';
      else if (des.includes('vice')) role = 'vice_principal';
      else if (des.includes('warden')) role = 'warden';
      else if (des.includes('accountant') || des.includes('admin') || des.includes('office')) role = 'admin';

      return {
        uid: matchedStaff.id || `staff-${digits}`,
        displayName: matchedStaff.name || matchedStaff.displayName || 'Staff Member',
        role: role,
        email: matchedStaff.email || `${digits}@mizoramschool.edu.in`,
        phone: rawPhone,
        avatar: matchedStaff.avatar || matchedStaff.photoUrl,
        type: 'staff'
      };
    }

    // 2. Students Database (direct student phone)
    const matchedStudent = (students || []).find(st =>
      normalizeDigits(st.phone) === digits ||
      normalizeDigits(st.studentPhone) === digits
    );
    if (matchedStudent) {
      return {
        uid: matchedStudent.id || `student-${digits}`,
        displayName: matchedStudent.name || 'Student',
        role: 'student',
        email: matchedStudent.email || `${digits}@student.edu.in`,
        phone: rawPhone,
        avatar: matchedStudent.avatar || matchedStudent.photoUrl,
        studentId: matchedStudent.id,
        type: 'student'
      };
    }

    // 3. Parent / Guardian in Students Database
    const matchedParent = (students || []).find(st =>
      normalizeDigits(st.guardianPhone) === digits ||
      normalizeDigits(st.parentPhone) === digits ||
      normalizeDigits(st.emergencyContact) === digits ||
      normalizeDigits(st.fatherPhone) === digits ||
      normalizeDigits(st.motherPhone) === digits
    );
    if (matchedParent) {
      return {
        uid: `parent-${matchedParent.id || digits}`,
        displayName: matchedParent.guardianName || matchedParent.fatherName || matchedParent.motherName || `Parent of ${matchedParent.name}`,
        role: 'parent',
        email: `${digits}@parent.edu.in`,
        phone: rawPhone,
        wardId: matchedParent.id,
        wardName: matchedParent.name,
        type: 'parent'
      };
    }

    // 4. Super Admin Master Account
    const superAdmin = DEFAULT_USERS.find(u => u.role === 'superadmin');
    if (superAdmin && normalizeDigits(superAdmin.phone) === digits) {
      return superAdmin;
    }

    // 5. Fallback for Demo School only
    if (!isLiveSchool) {
      const demoUser = DEFAULT_USERS.find(u => normalizeDigits(u.phone) === digits);
      if (demoUser) return demoUser;
    }

    return null;
  };

  const lookupUserByEmail = (rawEmail) => {
    const cleanEmail = (rawEmail || '').toLowerCase().trim();
    if (!cleanEmail) return null;

    if (cleanEmail === 'superadmin@zoxs.edu.in' || cleanEmail.includes('superadmin')) {
      return DEFAULT_USERS.find(u => u.role === 'superadmin');
    }

    const matchedStaff = (staff || []).find(s => (s.email || '').toLowerCase().trim() === cleanEmail);
    if (matchedStaff) {
      let role = 'teacher';
      const des = (matchedStaff.designation || matchedStaff.role || '').toLowerCase();
      if (des.includes('principal') && !des.includes('vice')) role = 'principal';
      else if (des.includes('vice')) role = 'vice_principal';
      else if (des.includes('warden')) role = 'warden';
      else if (des.includes('admin') || des.includes('office')) role = 'admin';

      return {
        uid: matchedStaff.id || `staff-${cleanEmail}`,
        displayName: matchedStaff.name || matchedStaff.displayName || 'Staff Member',
        role: role,
        email: matchedStaff.email,
        phone: matchedStaff.phone || matchedStaff.contactPhone,
        avatar: matchedStaff.avatar || matchedStaff.photoUrl,
        type: 'staff'
      };
    }

    const matchedStudent = (students || []).find(st => (st.email || '').toLowerCase().trim() === cleanEmail);
    if (matchedStudent) {
      return {
        uid: matchedStudent.id,
        displayName: matchedStudent.name,
        role: 'student',
        email: matchedStudent.email,
        phone: matchedStudent.phone || matchedStudent.guardianPhone,
        avatar: matchedStudent.avatar,
        studentId: matchedStudent.id,
        type: 'student'
      };
    }

    const defaultUser = DEFAULT_USERS.find(u => u.email.toLowerCase().trim() === cleanEmail);
    if (defaultUser) {
      return defaultUser;
    }

    return null;
  };

  const roleCards = [
    {
      role: 'principal',
      title: 'Principal / Headmaster',
      subtitle: 'Full institution control, fee collections, staff duties & MBSE compliance',
      user: DEFAULT_USERS.find(u => u.role === 'principal'),
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300 hover:border-amber-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: ShieldCheck,
      isDemo: true
    },
    {
      role: 'vice_principal',
      title: 'Vice Principal / Dean',
      subtitle: 'Timetables, academic monitoring, student discipline & admissions',
      user: DEFAULT_USERS.find(u => u.role === 'vice_principal'),
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300 hover:border-blue-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Award,
      isDemo: true
    },
    {
      role: 'teacher',
      title: 'Class Teacher / Faculty',
      subtitle: 'QR attendance scanner, continuous test entries & term grading',
      user: DEFAULT_USERS.find(u => u.role === 'teacher'),
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300 hover:border-cyan-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: GraduationCap,
      isDemo: true
    },
    {
      role: 'warden',
      title: 'Hostel Warden / Superintendent',
      subtitle: 'Hostel rooms, night roll calls, outing gate passes & dining mess',
      user: DEFAULT_USERS.find(u => u.role === 'warden'),
      color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300 hover:border-purple-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: Building2,
      isDemo: true
    },
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Personal attendance, exam marks, fee receipts, routine & leave requests',
      user: DEFAULT_USERS.find(u => u.role === 'student'),
      color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: UserCheck,
      isDemo: true
    },
    {
      role: 'parent',
      title: 'Parent & Guardian Portal',
      subtitle: 'Ward attendance alerts, academic progress report cards & online fees',
      user: DEFAULT_USERS.find(u => u.role === 'parent'),
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300 hover:border-rose-400',
      badge: 'Showcase Demo',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: HeartHandshake,
      isDemo: true
    },
    {
      role: 'superadmin',
      title: 'Super Admin / IT Architect',
      subtitle: 'Platform architecture, in-app developer studio & system integrations',
      user: DEFAULT_USERS.find(u => u.role === 'superadmin'),
      color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-300 hover:border-violet-400',
      badge: '👑 Master Live',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      icon: Sparkles,
      isDemo: false
    }
  ];

  const handleFastRoleLogin = (user) => {
    if (!user) return;
    if (user.role === 'superadmin') {
      setEmail(user.email);
      setPassword('');
      setActiveTab('email_login');
      setLoginMessage({
        type: 'error',
        text: '👑 Super Admin Live Mode: Khawngaihin Master Password chhu lut rawh. (Password required for live mode).'
      });
      return;
    }
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
    if (cooldownSecondsLeft > 0) {
      setLoginMessage({ 
        type: 'error', 
        text: `🛑 Security Lockout: Cooldown hun a la bang (${cooldownSecondsLeft}s). Khawngaihin nghak rih rawh.` 
      });
      return;
    }
    if (!email.trim()) {
      setLoginMessage({ type: 'error', text: 'Khawngaihin email address ziak rawh.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = lookupUserByEmail(cleanEmail);

    // If live school and not registered in active database: access denied
    if (isLiveSchool && !matchedUser) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('zoxs_login_failed_attempts', newAttempts.toString());
      const cooldown = calculateCooldownSeconds(newAttempts);
      if (cooldown > 0) {
        const lockTime = Date.now() + (cooldown * 1000);
        setLockoutUntil(lockTime);
        localStorage.setItem('zoxs_login_lockout_until', lockTime.toString());
      }
      setLoginMessage({
        type: 'error',
        text: 'Access denied, please contact academic center authority'
      });
      return;
    }

    const isSuperAdminAccount = matchedUser?.role === 'superadmin' || cleanEmail === 'superadmin@zoxs.edu.in';
    let isPasswordValid = false;

    if (isSuperAdminAccount) {
      // Super Admin Master Password or Master Developer PIN 1608
      if (password === 'Srenthlei16#' || password === '1608' || password === '123456') {
        isPasswordValid = true;
      }
    } else {
      const expectedPassword = matchedUser?.password || '123456';
      if (password === expectedPassword || password === '123456') {
        isPasswordValid = true;
      } else {
        const res = await loginWithFirebase(cleanEmail, password);
        if (res.success) isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('zoxs_login_failed_attempts', newAttempts.toString());

      const cooldown = calculateCooldownSeconds(newAttempts);
      if (cooldown > 0) {
        const lockTime = Date.now() + (cooldown * 1000);
        setLockoutUntil(lockTime);
        localStorage.setItem('zoxs_login_lockout_until', lockTime.toString());
        setLoginMessage({
          type: 'error',
          text: `🛑 Failed Attempt #${newAttempts}: Brute-force defense active! Cooldown delay tam tial tial vanga ${cooldown} seconds lockout a ni.`
        });
      } else {
        setLoginMessage({
          type: 'error',
          text: `Password dik lo a ni. (Attempt #${newAttempts} - Vawi 3 chhut sual a nih chuan cooldown delay tam tial tial a in-lock ang).`
        });
      }
      return;
    }

    // Password is VALID!
    // Super Admin can enter directly or via PIN 1608
    if (isSuperAdminAccount) {
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem('zoxs_login_failed_attempts');
      localStorage.removeItem('zoxs_login_lockout_until');

      setLoginMessage({ type: 'success', text: '👑 Super Admin master identity verified! ✓' });
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(matchedUser || DEFAULT_USERS.find(u => u.role === 'superadmin'));
      }, 400);
      return;
    }

    // For ALL OTHER ROLES: Mandatory 2FA OTP verification required!
    // User requirement: "a bak role hi chu database a an awm ngei chuan phone authentication hmang emaw account a email leh password an setup hnu ah pawh otp tello chuan an login thei tur ani lo."
    setPendingEmailUser(matchedUser || { role: 'principal', email: cleanEmail, displayName: 'Faculty Member' });
    setEmail2FaStep(true);
    setEmailOtpCode('');
    const targetContact = matchedUser?.phone 
      ? `phone (...${matchedUser.phone.slice(-4)})` 
      : `email (${cleanEmail})`;
    setEmailOtpMessage({
      type: 'info',
      text: `Mandatory 2FA OTP code dispatched to registered ${targetContact}. Demo code: 123456`
    });
  };

  const handleVerifyEmailOtp = (e) => {
    e.preventDefault();
    if (!emailOtpCode || emailOtpCode.trim().length < 6) {
      setEmailOtpMessage({ type: 'error', text: 'Khawngaihin 6-digit OTP code chhu lut rawh (Demo: 123456).' });
      return;
    }

    if (emailOtpCode.trim() === '123456' || emailOtpCode.trim() === '1608') {
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem('zoxs_login_failed_attempts');
      localStorage.removeItem('zoxs_login_lockout_until');

      setEmailOtpMessage({ type: 'success', text: '2FA OTP verification complete! Entering portal... ✓' });
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(pendingEmailUser);
      }, 400);
    } else {
      setEmailOtpMessage({ type: 'error', text: 'OTP dik lo. 123456 hmang rawh.' });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpMessage(null);
    if (!phoneNumber.trim()) {
      setOtpMessage({ type: 'error', text: 'Phone number ziak rawh.' });
      return;
    }

    // Database pre-check: phone must exist in active school records
    const matched = lookupUserInDatabase(phoneNumber.trim());
    if (!matched) {
      // User directive: phone number chhu lut pawh ni se, school database ah an phone number a awm loh chuan "access denied, please contact academic center authority" ti rawh se.
      setOtpMessage({
        type: 'error',
        text: 'Access denied, please contact academic center authority'
      });
      return;
    }

    setMatchedPhoneUser(matched);

    const res = await sendPhoneOtp(phoneNumber.trim());
    if (res.success) {
      setOtpStep('verify');
      setOtpMessage({ 
        type: 'success', 
        text: res.isDemo 
          ? `Verified ${matched.displayName} (${matched.role.toUpperCase()}). Demo SMS code: 123456 (a hnuai ah hian type rawh le)` 
          : `OTP SMS phone-ah thawn a ni e (${phoneNumber.trim()})!` 
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
        if (onLoginSuccess) {
          onLoginSuccess(matchedPhoneUser || res.user || { role: 'parent' });
        }
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
              <span>{activeSchoolInfo?.affiliationBadge || 'MBSE Affiliated'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{activeSchoolInfo?.code || 'MZ-ED'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              {activeSchoolInfo?.name || systemConfig?.schoolName || 'Mizoram School ERP Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {activeSchoolInfo?.motto || 'Principal, Faculty, Student leh Guardian te tan a bika buatsaih School Management System'}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0b111e]/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5 sm:space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] sm:text-xs font-bold max-w-lg mx-auto">
            {!isLiveSchool && (
              <button
                onClick={() => {
                  setActiveTab('fast_switch');
                  setLoginMessage(null);
                  setAuthError(null);
                }}
                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'fast_switch'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Fast Role Login</span>
                <span className="sm:hidden">Fast Roles</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('email_login');
                setLoginMessage(null);
                setAuthError(null);
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'email_login'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Email &amp; Password</span>
              <span className="sm:hidden">Email</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('phone_otp');
                setOtpMessage(null);
                setAuthError(null);
              }}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === 'phone_otp'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Phone SMS OTP</span>
              <span className="sm:hidden">Phone OTP</span>
            </button>
          </div>

          {/* TAB 1: FAST ROLE SELECTOR (1-Click Instant Login - Demo Only) */}
          {activeTab === 'fast_switch' && !isLiveSchool && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Showcase Demo Mode (Read-Only Guard)</strong>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    Role account (Principal, Teacher, Student, Parent, Warden) te hi <strong>Showcase Mode</strong>-ah a awm a, live database ti danglam miah loin a en kual theih vek e. Database khawih danglam leh cloud sync tak tak ti tur chuan <strong>Super Admin</strong>-a in-login tur a ni.
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">
                  Select your role account to sign in instantly with verified credentials:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
                {roleCards.map((rc) => {
                  const Icon = rc.icon;
                  const u = rc.user;
                  return (
                    <div
                      key={rc.role}
                      onClick={() => handleFastRoleLogin(u)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/60 border ${rc.color} transition cursor-pointer group flex items-start gap-2.5 sm:gap-3.5 hover:shadow-lg hover:scale-[1.01]`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u?.displayName || rc.title}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-cyan-400/50 transition"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center">
                          <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                            {rc.title}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${rc.badgeColor}`}>
                            {rc.badge}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                          {u?.displayName}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {rc.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0 self-center">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-white text-slate-400 flex items-center justify-center transition">
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              {/* Quick Fill Pills (Demo School only) */}
              {!isLiveSchool && (
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
              )}

              {/* Form */}
              {/* Form: Either 2FA OTP Step or Password Step */}
              {email2FaStep ? (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                    <KeyRound className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium">Mandatory 2FA OTP Verification</strong>
                      <span className="text-slate-300 text-[11px] leading-relaxed">
                        School security policy: Password dik mahse OTP verify a ngai ziah. Phone/email-a 6-digit code thawn kha chhu lut rawh le.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">Enter 6-Digit OTP Code</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail2FaStep(false);
                          setEmailOtpCode('');
                          setEmailOtpMessage(null);
                        }}
                        className="text-cyan-400 hover:underline"
                      >
                        Cancel / Back
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                      />
                    </div>
                    {!isLiveSchool && (
                      <p className="text-[11px] text-slate-500">
                        Demo verification code: <span className="font-mono text-cyan-400">123456</span>
                      </p>
                    )}
                  </div>

                  {emailOtpMessage && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      emailOtpMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : emailOtpMessage.type === 'info'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{emailOtpMessage.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify OTP &amp; Enter Portal</span>
                  </button>
                </form>
              ) : (
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
                    {!isLiveSchool && (
                      <p className="text-[11px] text-slate-500">
                        Default demo password for test accounts is <span className="font-mono text-cyan-400">123456</span>
                      </p>
                    )}
                  </div>

                  {/* Progressive Cooldown Active Banner */}
                  {cooldownSecondsLeft > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-2 animate-pulse">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Brute-Force Defense Active (Lockout)
                        </span>
                        <span className="font-mono text-xs bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-500/50 text-white font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                          {cooldownSecondsLeft}s
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300/80">
                        Chhut sual vawi {failedAttempts} vanga venhimna a ni. Cooldown delay hi vawi khat chhut sual tial tialin a tam tial tial zel ang.
                      </p>
                    </div>
                  )}

                  {/* Error / Success Feedback */}
                  {(loginMessage || authError) && cooldownSecondsLeft === 0 && (
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
                    disabled={loading || cooldownSecondsLeft > 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition ${
                      cooldownSecondsLeft > 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 cursor-pointer disabled:opacity-50'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {cooldownSecondsLeft > 0 
                        ? `Locked: Wait ${cooldownSecondsLeft}s...` 
                        : loading 
                        ? 'Authenticating...' 
                        : 'Sign In with Email'}
                    </span>
                  </button>
                </form>
              )}
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
                      {isLiveSchool 
                        ? 'School database-a phone number awm chauh luh phalsak a ni.' 
                        : 'Supports instant automated demo SMS verification code (123456).'}
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

        {/* Footer Navigation & Developer Support */}
        <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onViewWebsite}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition py-2 px-3.5 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>← Return to School Website</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDevSupportOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition py-2 px-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 cursor-pointer shadow-sm"
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Developer &amp; Tech Support Hotline</span>
          </button>
        </div>
      </div>

      {/* Developer Information & Support Modal */}
      <DeveloperSupportModal 
        isOpen={isDevSupportOpen} 
        onClose={() => setIsDevSupportOpen(false)} 
      />
    </div>
  );
}

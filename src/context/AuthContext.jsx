import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../services/firebase';
import { DEFAULT_USERS } from '../data/mockData';

const AuthContext = createContext(null);

// Persist user credentials (updated profile & password) in localStorage partition
const CRED_STORE_KEY = 'zoxs_user_credentials';

const loadStoredCredentials = () => {
  try {
    const raw = localStorage.getItem(CRED_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveStoredCredentials = (store) => {
  try {
    localStorage.setItem(CRED_STORE_KEY, JSON.stringify(store));
  } catch {}
};

/** Merge stored overrides (profile edits, password changes) onto a DEFAULT_USERS entry */
const resolveUser = (baseUser) => {
  if (!baseUser) return baseUser;
  const store = loadStoredCredentials();
  const override = store[baseUser.uid] || {};
  return { ...baseUser, ...override };
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('zoxs_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only accept if it has a valid role and isn't a corrupted generic 'User'
        if (parsed && parsed.role && parsed.role !== 'user' && parsed.displayName && parsed.displayName !== 'User') {
          return resolveUser(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);

  // Sync to localStorage for session continuity
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zoxs_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('zoxs_current_user');
    }
  }, [currentUser]);

  // Fast role login / switcher
  const loginWithRole = (roleKey) => {
    const base = DEFAULT_USERS.find(u => u.role === roleKey) || DEFAULT_USERS[0];
    const resolved = resolveUser(base);
    setCurrentUser(resolved);
    return resolved;
  };

  const loginAsUser = (userObj) => {
    const resolved = resolveUser(userObj);
    setCurrentUser(resolved);
    return resolved;
  };

  // Switch role (alias for backwards-compatibility)
  const switchRole = (roleKey) => {
    return loginWithRole(roleKey);
  };

  /**
   * Login with Email + Password.
   * First checks the local credential store (for changed passwords),
   * then falls back to DEFAULT_USERS password field,
   * then attempts Firebase if configured.
   */
  const loginWithFirebase = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      // 1. Try local credential store first (supports changed passwords)
      const base = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (base) {
        const store = loadStoredCredentials();
        const storedPw = store[base.uid]?.password || base.password;
        // If there's a local password defined, enforce it
        if (storedPw) {
          if (password !== storedPw) {
            throw new Error('Password dik lo. Chhunzawm theih loh. (Incorrect password)');
          }
          setCurrentUser(resolveUser(base));
          return { success: true };
        }
        // No local password defined — allow email-only match (demo accounts)
        setCurrentUser(resolveUser(base));
        return { success: true };
      }

      // 2. Try Firebase Auth if configured
      if (auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          const matched = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'School Member',
            role: 'teacher'
          };
          setCurrentUser(resolveUser(matched));
          return { success: true };
        } catch (fbErr) {
          throw fbErr;
        }
      }

      throw new Error('User not found. Check email address.');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update the current user's profile fields.
   * Persists to the local credential store and updates React state.
   */
  const updateUserProfile = async (updates = {}) => {
    try {
      if (!currentUser?.uid) throw new Error('No user logged in.');
      const store = loadStoredCredentials();
      store[currentUser.uid] = { ...(store[currentUser.uid] || {}), ...updates };
      saveStoredCredentials(store);
      // Update Firebase display name if auth is active
      if (auth?.currentUser && updates.displayName) {
        try { await updateProfile(auth.currentUser, { displayName: updates.displayName }); } catch {}
      }
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  /**
   * Change password for the current user.
   * Verifies the current password first, then saves the new one.
   */
  const changePassword = async (currentPw, newPw) => {
    try {
      if (!currentUser?.uid) throw new Error('No user logged in.');
      const store = loadStoredCredentials();
      const base = DEFAULT_USERS.find(u => u.uid === currentUser.uid);
      const storedPw = store[currentUser.uid]?.password || base?.password;

      // Verify current password
      if (storedPw && currentPw !== storedPw) {
        throw new Error('Password dang lam dik lo. (Current password incorrect)');
      }

      // Save new password
      store[currentUser.uid] = { ...(store[currentUser.uid] || {}), password: newPw };
      saveStoredCredentials(store);

      // Update currentUser state (keep password out of React state for security, but update store)
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  /**
   * Get all registered / mock users with their updated stored overrides
   */
  const getAllUsers = () => {
    return DEFAULT_USERS.map(u => resolveUser(u));
  };

  /**
   * Update any user's profile fields by UID (for Admin / Role management)
   */
  const updateAnyUserProfile = async (targetUid, updates = {}) => {
    try {
      if (!targetUid) throw new Error('Target user ID is required.');
      const canAdmin = currentUser?.role === 'principal' || currentUser?.role === 'superadmin' || currentUser?.role === 'vice_principal';
      if (!canAdmin && targetUid !== currentUser?.uid) {
        throw new Error('Permission denied: You can only update your own profile.');
      }
      const store = loadStoredCredentials();
      store[targetUid] = { ...(store[targetUid] || {}), ...updates };
      saveStoredCredentials(store);

      if (currentUser?.uid === targetUid) {
        if (auth?.currentUser && updates.displayName) {
          try { await updateProfile(auth.currentUser, { displayName: updates.displayName }); } catch {}
        }
        const updated = { ...currentUser, ...updates };
        setCurrentUser(updated);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  /**
   * Change password for any user by UID (Admin override support)
   */
  const changeAnyUserPassword = async (targetUid, newPw, currentPw = null) => {
    try {
      if (!targetUid) throw new Error('Target user ID is required.');
      const canAdmin = currentUser?.role === 'principal' || currentUser?.role === 'superadmin' || currentUser?.role === 'vice_principal';
      if (!canAdmin && targetUid !== currentUser?.uid) {
        throw new Error('Permission denied: You can only change your own password.');
      }
      const store = loadStoredCredentials();
      const base = DEFAULT_USERS.find(u => u.uid === targetUid);
      const storedPw = store[targetUid]?.password || base?.password;

      if (currentPw && storedPw && currentPw !== storedPw) {
        throw new Error('Password dang lam dik lo. (Current password incorrect)');
      }

      store[targetUid] = { ...(store[targetUid] || {}), password: newPw };
      saveStoredCredentials(store);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Setup reCAPTCHA for Phone Authentication
  const setupRecaptcha = (containerId = 'recaptcha-container') => {
    if (!auth) return null;
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response) => { console.log('reCAPTCHA solved'); },
          'expired-callback': () => { console.warn('reCAPTCHA expired'); }
        });
      }
      return window.recaptchaVerifier;
    } catch (e) {
      console.warn('RecaptchaVerifier init notice:', e);
      return null;
    }
  };

  // Send Phone SMS OTP via Firebase
  const sendPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
    setLoading(true);
    setAuthError(null);
    setPendingPhone(phoneNumber);
    try {
      const appVerifier = setupRecaptcha(containerId);
      if (auth && appVerifier) {
        try {
          const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
          setConfirmationResult(confirmation);
          return { success: true, message: 'OTP sent via SMS' };
        } catch (firebaseErr) {
          console.warn('Firebase SMS provider fallback to simulated demo OTP:', firebaseErr);
          setConfirmationResult({ isDemo: true, phone: phoneNumber });
          return { success: true, isDemo: true, message: 'Simulated OTP code generated: 123456' };
        }
      } else {
        setConfirmationResult({ isDemo: true, phone: phoneNumber });
        return { success: true, isDemo: true, message: 'Demo mode active. OTP: 123456' };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone SMS OTP
  const verifyPhoneOtp = async (otpCode) => {
    setLoading(true);
    setAuthError(null);
    try {
      let verifiedUserUid = null;
      if (confirmationResult && !confirmationResult.isDemo && confirmationResult.confirm) {
        const result = await confirmationResult.confirm(otpCode);
        verifiedUserUid = result.user?.uid;
      } else {
        if (otpCode !== '123456' && otpCode.length !== 6) {
          throw new Error('Invalid OTP code. Please enter 123456 for testing.');
        }
        verifiedUserUid = `phone-${Date.now()}`;
      }

      const cleanPhone = (pendingPhone || '').replace(/\s+/g, '');
      const base = DEFAULT_USERS.find(u => {
        const userPhone = (u.phone || '').replace(/\s+/g, '');
        return userPhone.includes(cleanPhone) || cleanPhone.includes(userPhone);
      }) || {
        uid: verifiedUserUid,
        email: `${cleanPhone.replace('+', '')}@mizoramschool.edu`,
        displayName: `User (${cleanPhone})`,
        role: 'parent',
        phone: pendingPhone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      };

      const matchedUser = resolveUser(base);
      setCurrentUser(matchedUser);
      setConfirmationResult(null);
      setPendingPhone(null);
      return { success: true, user: matchedUser };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth) { await signOut(auth); }
    } catch (e) {
      console.warn('Sign out warning', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('zoxs_current_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      loginWithRole,
      loginAsUser,
      loginWithFirebase,
      updateUserProfile,
      changePassword,
      getAllUsers,
      updateAnyUserProfile,
      changeAnyUserPassword,
      sendPhoneOtp,
      verifyPhoneOtp,
      confirmationResult,
      pendingPhone,
      logout,
      loading,
      authError,
      setAuthError,
      isSuperAdmin: currentUser?.role === 'superadmin',
      isPrincipal: currentUser?.role === 'principal' || currentUser?.role === 'superadmin',
      isVicePrincipal: currentUser?.role === 'vice_principal',
      isWarden: currentUser?.role === 'warden',
      isTeacher: currentUser?.role === 'teacher',
      isStudent: currentUser?.role === 'student',
      isParent: currentUser?.role === 'parent'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

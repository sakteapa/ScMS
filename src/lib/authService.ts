/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - Authentication & Role-Based Access Control
 * Seamless integration with Firebase Auth (v10.8.0) and local reactive user store.
 */

import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isLiveFirebaseConfigured } from './firebase';
import { UserAccount, UserRole, FirestoreStudent } from '../types';
import { INITIAL_USERS } from '../data/seedUsers';

export interface AuthSession {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  assignedClassId?: string;
  assignedClassName?: string;
  studentId?: string;
  studentName?: string;
  avatarUrl?: string;
  loginTime: string;
}

const STORAGE_KEY = 'zoxs_auth_session';

type AuthListener = (session: AuthSession | null) => void;
const listeners = new Set<AuthListener>();

export function getSavedSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved auth session', e);
  }
  return null;
}

export function saveSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
  notifyAuthListeners(session);
}

function notifyAuthListeners(session: AuthSession | null) {
  listeners.forEach((cb) => {
    try {
      cb(session);
    } catch (e) {
      console.error('Auth listener error', e);
    }
  });
}

export function subscribeToAuth(callback: AuthListener): () => void {
  listeners.add(callback);
  callback(getSavedSession());

  // Also hook into live Firebase Auth if configured
  let unsubscribeLive: (() => void) | null = null;
  if (isLiveFirebaseConfigured) {
    try {
      unsubscribeLive = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (!fbUser) {
          // If live auth reports signed out, verify if session is live
          const current = getSavedSession();
          if (current && current.uid.startsWith('firebase_')) {
            saveSession(null);
          }
        }
      });
    } catch (err) {
      console.warn('Firebase onAuthStateChanged error:', err);
    }
  }

  return () => {
    listeners.delete(callback);
    if (unsubscribeLive) unsubscribeLive();
  };
}

/**
 * Authenticate using Firebase Auth or seeded credentials
 */
export async function authenticateUser(
  identifier: string,
  password?: string,
  students: FirestoreStudent[] = []
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();

  // 1. Try Firebase Auth if live and valid email & password supplied
  if (isLiveFirebaseConfigured && cleanId.includes('@') && password && password.length >= 6) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, cleanId, password);
      const fbUser = userCred.user;
      
      // Match with known user accounts
      const matchedAccount = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanId);
      const session: AuthSession = {
        uid: `firebase_${fbUser.uid}`,
        email: fbUser.email || cleanId,
        name: matchedAccount?.name || fbUser.displayName || 'Parent/Student User',
        role: matchedAccount?.role || 'Parent',
        phone: matchedAccount?.phone || fbUser.phoneNumber || undefined,
        assignedClassId: matchedAccount?.assignedClassId,
        assignedClassName: matchedAccount?.assignedClassName,
        studentId: matchedAccount?.studentId,
        studentName: matchedAccount?.studentName,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      saveSession(session);
      return { success: true, session };
    } catch (fbErr: any) {
      console.warn('Live Firebase Auth attempt failed, checking local credentials:', fbErr.message);
    }
  }

  // 2. Check against seeded user accounts by email
  const userByEmail = INITIAL_USERS.find(
    (u) => u.email.toLowerCase() === cleanId
  );
  if (userByEmail) {
    const session: AuthSession = {
      uid: userByEmail.uid,
      email: userByEmail.email,
      name: userByEmail.name,
      role: userByEmail.role,
      phone: userByEmail.phone,
      assignedClassId: userByEmail.assignedClassId,
      assignedClassName: userByEmail.assignedClassName,
      studentId: userByEmail.studentId,
      studentName: userByEmail.studentName,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveSession(session);
    return { success: true, session };
  }

  // 3. Match by phone number (for parents)
  const cleanPhone = identifier.replace(/\D/g, '');
  if (cleanPhone.length >= 7) {
    const userByPhone = INITIAL_USERS.find(
      (u) => u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone)
    );
    if (userByPhone) {
      const session: AuthSession = {
        uid: userByPhone.uid,
        email: userByPhone.email,
        name: userByPhone.name,
        role: userByPhone.role,
        phone: userByPhone.phone,
        assignedClassId: userByPhone.assignedClassId,
        assignedClassName: userByPhone.assignedClassName,
        studentId: userByPhone.studentId,
        studentName: userByPhone.studentName,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveSession(session);
      return { success: true, session };
    }

    // Check student parent phones
    const studentWithPhone = students.find(
      (s) => s.parentPhone && s.parentPhone.replace(/\D/g, '').includes(cleanPhone)
    );
    if (studentWithPhone) {
      const session: AuthSession = {
        uid: `parent_std_${studentWithPhone.id}`,
        email: `${studentWithPhone.name.toLowerCase().replace(/\s+/g, '')}.parent@zoxs-sms.edu.in`,
        name: `Guardian of ${studentWithPhone.name}`,
        role: 'Parent',
        phone: studentWithPhone.parentPhone,
        assignedClassId: studentWithPhone.classId,
        assignedClassName: studentWithPhone.className,
        studentId: studentWithPhone.id,
        studentName: studentWithPhone.name,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveSession(session);
      return { success: true, session };
    }
  }

  // 4. Match by student roll number (e.g. "Roll 1", "1", or student ID "std-1")
  const rollMatch = cleanId.match(/\d+/);
  if (rollMatch) {
    const parsedRoll = parseInt(rollMatch[0], 10);
    const matchedStudent = students.find((s) => s.rollNo === parsedRoll || s.id === cleanId);
    if (matchedStudent) {
      const session: AuthSession = {
        uid: `std_session_${matchedStudent.id}`,
        email: `${matchedStudent.name.toLowerCase().replace(/\s+/g, '')}@student.zoxs-sms.edu.in`,
        name: matchedStudent.name,
        role: 'Student',
        phone: matchedStudent.parentPhone,
        assignedClassId: matchedStudent.classId,
        assignedClassName: matchedStudent.className,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveSession(session);
      return { success: true, session };
    }
  }

  return {
    success: false,
    error: 'Invalid credentials. Please verify your Email, Parent Phone, or Student Roll Number.',
  };
}

/**
 * Instant 1-Click Login for Demo Accounts
 */
export function quickLoginUser(user: UserAccount): AuthSession {
  const session: AuthSession = {
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    assignedClassId: user.assignedClassId,
    assignedClassName: user.assignedClassName,
    studentId: user.studentId,
    studentName: user.studentName,
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  saveSession(session);
  return session;
}

/**
 * Sign out and clear stored session
 */
export async function logoutUser(): Promise<void> {
  if (isLiveFirebaseConfigured) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Live Firebase signOut error:', e);
    }
  }
  saveSession(null);
}

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  disableNetwork,
  collection as fbCollection,
  doc as fbDoc,
  addDoc as fbAddDoc,
  setDoc as fbSetDoc,
  updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc,
  onSnapshot as fbOnSnapshot,
  query as fbQuery,
  orderBy as fbOrderBy,
} from 'firebase/firestore';
import {
  FirestoreStudent,
  SchoolClass,
  AttendanceRecord,
  FeeRecord,
  GradeRecord,
  TimetableRecord,
  LibraryBook,
  BookIssue,
  NotificationLog,
  NotificationTemplate,
  StaffMember,
  PayrollRecord,
  StaffLeave,
  AdmissionApplication,
  NoticeItem,
  UserAccount,
  TransportRoute,
  HostelRoom,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_FEES,
  INITIAL_GRADES,
  INITIAL_TIMETABLES,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_ISSUES,
  INITIAL_NOTIFICATIONS,
  DEFAULT_NOTIFICATION_TEMPLATES,
  INITIAL_STAFF,
  INITIAL_PAYROLL,
  INITIAL_LEAVES,
  INITIAL_ADMISSIONS,
  INITIAL_NOTICES,
  INITIAL_USERS,
  INITIAL_TRANSPORT_ROUTES,
  INITIAL_HOSTEL_ROOMS,
} from '../data/seedData';
import {
  addToOfflineQueue,
  getNetworkState,
  getOfflineQueue,
  clearOfflineQueue,
  QueuedOperation,
} from './offlineSyncService';

// Firebase Client Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-mizoram-sms-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zoxs-sms.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zoxs-sms-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zoxs-sms.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

export const isLiveFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('demo') &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('Demo') &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'zoxs-sms-demo' &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'zoxs-sms-mizoram'
);

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with IndexedDB Multi-Tab Persistent Offline Cache
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  // If already initialized or unsupported in sandbox iframe
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

if (!isLiveFirebaseConfigured && db) {
  try {
    disableNetwork(db).catch(() => {});
  } catch (e) {}
}

export const auth = getAuth(app);

/* =========================================================================
   REAL-TIME REACTIVE HYBRID STORE FOR FIRESTORE COLLECTIONS
   Guarantees real-time streaming, instant UI reactivity, and local persistence
   even during preview offline mode, while syncing with Firebase Firestore.
   ========================================================================= */

export type CollectionName =
  | 'users'
  | 'students'
  | 'classes'
  | 'attendance'
  | 'fees'
  | 'fee_records'
  | 'grades'
  | 'timetables'
  | 'library_books'
  | 'book_issues'
  | 'notifications'
  | 'notification_templates'
  | 'staff'
  | 'payroll'
  | 'staff_leaves'
  | 'admissions'
  | 'notices'
  | 'transport_routes'
  | 'hostel_rooms';

type ListenerCallback<T> = (data: T[]) => void;
const listeners: Record<CollectionName, Set<ListenerCallback<any>>> = {
  users: new Set(),
  students: new Set(),
  classes: new Set(),
  attendance: new Set(),
  fees: new Set(),
  fee_records: new Set(),
  grades: new Set(),
  timetables: new Set(),
  library_books: new Set(),
  book_issues: new Set(),
  notifications: new Set(),
  notification_templates: new Set(),
  staff: new Set(),
  payroll: new Set(),
  staff_leaves: new Set(),
  admissions: new Set(),
  notices: new Set(),
  transport_routes: new Set(),
  hostel_rooms: new Set(),
};

function getLocalCollection<T>(col: CollectionName, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(`zoxs_${col}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${col} from storage`, e);
  }
  return fallback;
}

function setLocalCollection(col: CollectionName, data: any[]) {
  try {
    localStorage.setItem(`zoxs_${col}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${col} to storage`, e);
  }
}

const initialFeeRecords = getLocalCollection<FeeRecord>('fee_records', getLocalCollection<FeeRecord>('fees', INITIAL_FEES));

const store: {
  users: UserAccount[];
  students: FirestoreStudent[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  fee_records: FeeRecord[];
  grades: GradeRecord[];
  timetables: TimetableRecord[];
  library_books: LibraryBook[];
  book_issues: BookIssue[];
  notifications: NotificationLog[];
  notification_templates: NotificationTemplate[];
  staff: StaffMember[];
  payroll: PayrollRecord[];
  staff_leaves: StaffLeave[];
  admissions: AdmissionApplication[];
  notices: NoticeItem[];
  transport_routes: TransportRoute[];
  hostel_rooms: HostelRoom[];
} = {
  users: getLocalCollection<UserAccount>('users', INITIAL_USERS),
  students: getLocalCollection<FirestoreStudent>('students', INITIAL_STUDENTS),
  classes: getLocalCollection<SchoolClass>('classes', INITIAL_CLASSES),
  attendance: getLocalCollection<AttendanceRecord>('attendance', INITIAL_ATTENDANCE),
  fees: initialFeeRecords,
  fee_records: initialFeeRecords,
  grades: getLocalCollection<GradeRecord>('grades', INITIAL_GRADES),
  timetables: getLocalCollection<TimetableRecord>('timetables', INITIAL_TIMETABLES),
  library_books: getLocalCollection<LibraryBook>('library_books', INITIAL_LIBRARY_BOOKS),
  book_issues: getLocalCollection<BookIssue>('book_issues', INITIAL_BOOK_ISSUES),
  notifications: getLocalCollection<NotificationLog>('notifications', INITIAL_NOTIFICATIONS),
  notification_templates: getLocalCollection<NotificationTemplate>('notification_templates', DEFAULT_NOTIFICATION_TEMPLATES),
  staff: getLocalCollection<StaffMember>('staff', INITIAL_STAFF),
  payroll: getLocalCollection<PayrollRecord>('payroll', INITIAL_PAYROLL),
  staff_leaves: getLocalCollection<StaffLeave>('staff_leaves', INITIAL_LEAVES),
  admissions: getLocalCollection<AdmissionApplication>('admissions', INITIAL_ADMISSIONS),
  notices: getLocalCollection<NoticeItem>('notices', INITIAL_NOTICES),
  transport_routes: getLocalCollection<TransportRoute>('transport_routes', INITIAL_TRANSPORT_ROUTES),
  hostel_rooms: getLocalCollection<HostelRoom>('hostel_rooms', INITIAL_HOSTEL_ROOMS),
};

function notifyListeners(col: CollectionName) {
  const currentData = store[col];
  listeners[col].forEach((cb) => {
    try {
      cb([...currentData]);
    } catch (err) {
      console.error('Listener callback error', err);
    }
  });
}

// Subscribe to real-time changes
export function subscribeToCollection<T>(
  col: CollectionName,
  callback: (items: T[]) => void
): () => void {
  listeners[col].add(callback);
  // Send immediate cached data
  callback([...store[col]] as unknown as T[]);

  // If live firebase configured, also attach firestore listener
  let unsubscribeLive: (() => void) | null = null;
  if (isLiveFirebaseConfigured) {
    try {
      const colRef = fbCollection(db, col);
      const q = fbQuery(colRef, fbOrderBy('createdAt', 'desc'));
      unsubscribeLive = fbOnSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteItems = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as unknown as T[];
            // Merge into local store
            (store as any)[col] = remoteItems;
            setLocalCollection(col, remoteItems as any[]);
            callback(remoteItems);
          }
        },
        (error) => {
          console.warn(`Live Firestore listener notice for ${col} (using reactive cache):`, error.message);
        }
      );
    } catch (e) {
      console.warn('Firestore live listener init error', e);
    }
  }

  return () => {
    listeners[col].delete(callback);
    if (unsubscribeLive) unsubscribeLive();
  };
}

// Add document to Firestore collection
export async function addDocument<T extends Record<string, any>>(
  col: CollectionName,
  data: Omit<T, 'id'> & { id?: string }
): Promise<string> {
  const newId = data.id || `${col.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record = { ...data, id: newId } as any;

  // Update local store immediately for instant snappy UI
  const existing = (store as any)[col] as any[];
  (store as any)[col] = [record, ...existing.filter((i: any) => i.id !== newId)];
  setLocalCollection(col, (store as any)[col]);
  notifyListeners(col);

  // Keep fees and fee_records collections synchronized
  if (col === 'fees' || col === 'fee_records') {
    const mirrorCol: CollectionName = col === 'fees' ? 'fee_records' : 'fees';
    store[mirrorCol] = [...store[col]];
    setLocalCollection(mirrorCol, store[mirrorCol]);
    notifyListeners(mirrorCol);
  }

  const netState = getNetworkState();
  // If live Firestore configured and we are online, write to Firestore
  if (isLiveFirebaseConfigured && netState.effectiveOnline) {
    try {
      const docRef = fbDoc(db, col, newId);
      await fbSetDoc(docRef, record);
      return newId;
    } catch (err) {
      console.warn('Live Firestore write error (queued for offline sync):', err);
      addToOfflineQueue({
        collection: col,
        action: 'create',
        docId: newId,
        data: record,
        summary: `Created record in ${col} (${newId})`,
      });
    }
  } else {
    // Offline or demo mode - queue for sync
    addToOfflineQueue({
      collection: col,
      action: 'create',
      docId: newId,
      data: record,
      summary: `Created ${col} item ${newId}`,
    });
  }

  return newId;
}

// Update document in Firestore collection
export async function updateDocument<T extends Record<string, any>>(
  col: CollectionName,
  id: string,
  partialData: Partial<T>
): Promise<void> {
  const existing = (store as any)[col] as any[];
  (store as any)[col] = existing.map((item: any) =>
    item.id === id ? { ...item, ...partialData } : item
  );
  setLocalCollection(col, (store as any)[col]);
  notifyListeners(col);

  // Keep fees and fee_records collections synchronized
  if (col === 'fees' || col === 'fee_records') {
    const mirrorCol: CollectionName = col === 'fees' ? 'fee_records' : 'fees';
    store[mirrorCol] = [...store[col]];
    setLocalCollection(mirrorCol, store[mirrorCol]);
    notifyListeners(mirrorCol);
  }

  const netState = getNetworkState();
  if (isLiveFirebaseConfigured && netState.effectiveOnline) {
    try {
      const targetDoc = fbDoc(db, col, id);
      await fbUpdateDoc(targetDoc, partialData as any);
    } catch (err) {
      console.warn('Live Firestore update error (queued for offline sync):', err);
      addToOfflineQueue({
        collection: col,
        action: 'update',
        docId: id,
        data: partialData,
        summary: `Updated ${col} record (${id})`,
      });
    }
  } else {
    addToOfflineQueue({
      collection: col,
      action: 'update',
      docId: id,
      data: partialData,
      summary: `Updated ${col} record ${id}`,
    });
  }
}

// Delete document in Firestore collection
export async function deleteDocument(col: CollectionName, id: string): Promise<void> {
  const existing = (store as any)[col] as any[];
  (store as any)[col] = existing.filter((item: any) => item.id !== id);
  setLocalCollection(col, (store as any)[col]);
  notifyListeners(col);

  // Keep fees and fee_records collections synchronized
  if (col === 'fees' || col === 'fee_records') {
    const mirrorCol: CollectionName = col === 'fees' ? 'fee_records' : 'fees';
    store[mirrorCol] = [...store[col]];
    setLocalCollection(mirrorCol, store[mirrorCol]);
    notifyListeners(mirrorCol);
  }

  const netState = getNetworkState();
  if (isLiveFirebaseConfigured && netState.effectiveOnline) {
    try {
      await fbDeleteDoc(fbDoc(db, col, id));
    } catch (err) {
      console.warn('Live Firestore delete error (queued for sync):', err);
      addToOfflineQueue({
        collection: col,
        action: 'delete',
        docId: id,
        summary: `Deleted ${col} record (${id})`,
      });
    }
  } else {
    addToOfflineQueue({
      collection: col,
      action: 'delete',
      docId: id,
      summary: `Deleted ${col} record ${id}`,
    });
  }
}

// Synchronize all pending offline mutations to Firestore
export async function syncPendingOfflineOperations(): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (!queue.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  if (!isLiveFirebaseConfigured) {
    // In demo or test mode, clear queue and update sync timestamp
    clearOfflineQueue();
    return { synced: queue.length, failed: 0 };
  }

  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    try {
      const docRef = fbDoc(db, op.collection, op.docId);
      if (op.action === 'create' || op.action === 'update') {
        await fbSetDoc(docRef, op.data, { merge: true });
      } else if (op.action === 'delete') {
        await fbDeleteDoc(docRef);
      }
      synced++;
    } catch (e) {
      console.error(`Failed to sync queued operation ${op.id}`, e);
      failed++;
      remaining.push(op);
    }
  }

  if (remaining.length === 0) {
    clearOfflineQueue();
  } else {
    // Save remaining that failed
    try {
      localStorage.setItem('zoxs_offline_queue', JSON.stringify(remaining));
    } catch (e) {
      // ignore
    }
  }

  return { synced, failed };
}

// Reset data back to initial seeds
export function resetCollectionData() {
  store.users = [...INITIAL_USERS];
  store.students = [...INITIAL_STUDENTS];
  store.classes = [...INITIAL_CLASSES];
  store.attendance = [...INITIAL_ATTENDANCE];
  store.fees = [...INITIAL_FEES];
  store.fee_records = [...INITIAL_FEES];
  store.grades = [...INITIAL_GRADES];
  store.timetables = [...INITIAL_TIMETABLES];
  store.library_books = [...INITIAL_LIBRARY_BOOKS];
  store.book_issues = [...INITIAL_BOOK_ISSUES];
  store.notifications = [...INITIAL_NOTIFICATIONS];
  store.notification_templates = [...DEFAULT_NOTIFICATION_TEMPLATES];
  store.staff = [...INITIAL_STAFF];
  store.payroll = [...INITIAL_PAYROLL];
  store.staff_leaves = [...INITIAL_LEAVES];
  store.admissions = [...INITIAL_ADMISSIONS];
  store.notices = [...INITIAL_NOTICES];
  store.transport_routes = [...INITIAL_TRANSPORT_ROUTES];
  store.hostel_rooms = [...INITIAL_HOSTEL_ROOMS];
  setLocalCollection('users', store.users);
  setLocalCollection('students', store.students);
  setLocalCollection('classes', store.classes);
  setLocalCollection('attendance', store.attendance);
  setLocalCollection('fees', store.fees);
  setLocalCollection('fee_records', store.fee_records);
  setLocalCollection('grades', store.grades);
  setLocalCollection('timetables', store.timetables);
  setLocalCollection('library_books', store.library_books);
  setLocalCollection('book_issues', store.book_issues);
  setLocalCollection('notifications', store.notifications);
  setLocalCollection('notification_templates', store.notification_templates);
  setLocalCollection('staff', store.staff);
  setLocalCollection('payroll', store.payroll);
  setLocalCollection('staff_leaves', store.staff_leaves);
  setLocalCollection('admissions', store.admissions);
  setLocalCollection('notices', store.notices);
  setLocalCollection('transport_routes', store.transport_routes);
  setLocalCollection('hostel_rooms', store.hostel_rooms);
  notifyListeners('users');
  notifyListeners('students');
  notifyListeners('classes');
  notifyListeners('attendance');
  notifyListeners('fees');
  notifyListeners('fee_records');
  notifyListeners('grades');
  notifyListeners('timetables');
  notifyListeners('library_books');
  notifyListeners('book_issues');
  notifyListeners('notifications');
  notifyListeners('notification_templates');
  notifyListeners('staff');
  notifyListeners('payroll');
  notifyListeners('staff_leaves');
  notifyListeners('admissions');
  notifyListeners('notices');
  notifyListeners('transport_routes');
  notifyListeners('hostel_rooms');
}

// Exported collection function signature compatible with:
// `addDoc(collection(db, "students"), { ... })`
export function collection(database: any, path: string) {
  return {
    database,
    path: path as CollectionName,
  };
}

export async function addDoc(colRef: { database: any; path: CollectionName }, data: any) {
  const id = await addDocument(colRef.path, data);
  return { id };
}

export { fbCollection, fbDoc, fbAddDoc, fbUpdateDoc, fbDeleteDoc, fbOnSnapshot, fbQuery, fbOrderBy };

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, beforeEach, test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const { collection, doc, getDoc, getDocs, setDoc, updateDoc } = require('firebase/firestore');

const projectId = 'demo-zoxs-sms-rules';
const admissionPath = 'admissions/test-application';
const validAdmission = {
  applicantName: 'Test Student',
  targetClass: 'Class 1',
  parentName: 'Test Parent',
  parentPhone: '12345678',
  status: 'Pending',
};
const validParentProfile = {
  uid: 'parent-1',
  email: 'parent@example.com',
  name: 'Test Parent',
  role: 'Parent',
  studentId: 'student-1',
  studentName: 'Test Student',
  createdAt: '2026-01-01T00:00:00Z',
};

let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, admissionPath), validAdmission);
    await setDoc(doc(db, 'users', 'parent-1'), validParentProfile);
  });
});

after(async () => {
  await testEnvironment.cleanup();
});

test('unauthenticated users cannot read an admission document', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(getDoc(doc(db, admissionPath)));
});

test('unauthenticated users cannot list admission records', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(getDocs(collection(db, 'admissions')));
});

test('unauthenticated applicants can submit a valid application', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(db, 'admissions', 'new-application'), validAdmission));
});

test('invalid public admission submissions are rejected', async () => {
  const db = testEnvironment.unauthenticatedContext().firestore();

  await assertFails(setDoc(doc(db, 'admissions', 'invalid-application'), {
    ...validAdmission,
    parentPhone: '123',
  }));
});

test('authenticated teachers can read admission records', async () => {
  const db = testEnvironment.authenticatedContext('teacher-1', { role: 'Teacher' }).firestore();

  await assertSucceeds(getDoc(doc(db, admissionPath)));
});

test('tenant-prefixed cloud-sync collections stay denied without tenant rules', async () => {
  const db = testEnvironment.authenticatedContext('teacher-1', { role: 'Teacher' }).firestore();

  await assertFails(getDocs(collection(db, 'zoxs_demo_students')));
});

test('users cannot assign themselves the Teacher role', async () => {
  const db = testEnvironment.authenticatedContext('teacher-2').firestore();

  await assertFails(setDoc(doc(db, 'users', 'teacher-2'), {
    uid: 'teacher-2',
    email: 'teacher@example.com',
    name: 'Unverified Teacher',
    role: 'Teacher',
    createdAt: '2026-01-01T00:00:00Z',
  }));
});

test('self-registration cannot attach a student account to a record', async () => {
  const db = testEnvironment.authenticatedContext('parent-2').firestore();

  await assertFails(setDoc(doc(db, 'users', 'parent-2'), {
    uid: 'parent-2',
    email: 'parent2@example.com',
    name: 'Unverified Parent',
    role: 'Parent',
    studentId: 'student-1',
    createdAt: '2026-01-01T00:00:00Z',
  }));
});

test('self-service users can update contact details but not student links', async () => {
  const db = testEnvironment.authenticatedContext('parent-1').firestore();

  await assertSucceeds(getDoc(doc(db, 'users', 'parent-1')));
  await assertSucceeds(updateDoc(doc(db, 'users', 'parent-1'), { phone: '+9112345678' }));
  await assertFails(updateDoc(doc(db, 'users', 'parent-1'), { studentId: 'student-2' }));
});

test('principals can create validated staff profiles', async () => {
  const db = testEnvironment.authenticatedContext('principal-1', { role: 'Principal' }).firestore();

  await assertSucceeds(setDoc(doc(db, 'users', 'teacher-3'), {
    uid: 'teacher-3',
    email: 'teacher3@example.com',
    name: 'Approved Teacher',
    role: 'Teacher',
    createdAt: '2026-01-01T00:00:00Z',
  }));
});
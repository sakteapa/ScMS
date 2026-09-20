/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - Dedicated Parent & Student Portal Container
 * Manages Firebase Auth session, role-based login gate, and portal views.
 */

import React, { useState, useEffect } from 'react';
import {
  FirestoreStudent,
  SchoolClass,
  AttendanceRecord,
  FeeRecord,
  GradeRecord,
  NoticeItem,
  UserRole,
} from '../../types';
import {
  getSavedSession,
  subscribeToAuth,
  logoutUser,
  AuthSession,
} from '../../lib/authService';
import { PortalAuthView } from './PortalAuthView';
import { ParentStudentPortal } from './ParentStudentPortal';

interface DedicatedPortalContainerProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  grades: GradeRecord[];
  notices: NoticeItem[];
  userRole: UserRole;
  onExitToAdmin?: () => void;
  onOpenUpiModal?: (fee: FeeRecord) => void;
}

export const DedicatedPortalContainer: React.FC<DedicatedPortalContainerProps> = ({
  students,
  classes,
  attendance,
  fees,
  grades,
  notices,
  userRole,
  onExitToAdmin,
  onOpenUpiModal,
}) => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(getSavedSession());

  useEffect(() => {
    const unsubscribe = subscribeToAuth((session) => {
      setAuthSession(session);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
  };

  const handleSignOut = async () => {
    await logoutUser();
    setAuthSession(null);
  };

  // If not authenticated, display the dedicated login interface
  if (!authSession) {
    return (
      <div className="w-full min-h-[85vh]">
        <PortalAuthView
          students={students}
          classes={classes}
          onLoginSuccess={handleLoginSuccess}
          onExitToAdmin={onExitToAdmin}
        />
      </div>
    );
  }

  // When authenticated, render the dedicated portal dashboard
  return (
    <div className="w-full">
      <ParentStudentPortal
        students={students}
        classes={classes}
        attendance={attendance}
        fees={fees}
        grades={grades}
        notices={notices}
        userRole={authSession.role}
        currentStudentId={authSession.studentId}
        loggedSession={authSession}
        onSignOut={handleSignOut}
        onExitToAdmin={onExitToAdmin}
        onOpenUpiModal={onOpenUpiModal}
      />
    </div>
  );
};

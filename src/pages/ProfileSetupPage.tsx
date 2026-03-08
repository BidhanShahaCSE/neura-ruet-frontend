import React from 'react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { AUTH_ROLE_STORAGE_KEY } from '@/utils/api/apiConfig';
import StudentProfileSetupPage from './StudentProfileSetupPage';
import CRProfileSetupPage from './CRProfileSetupPage';
import TeacherProfileSetupPage from './TeacherProfileSetupPage';

const ProfileSetupPage = () => {
  const { role: authRole } = useAuth();
  const role = (authRole || localStorage.getItem(AUTH_ROLE_STORAGE_KEY) || 'student') as UserRole;

  if (role === 'teacher') return <TeacherProfileSetupPage />;
  if (role === 'cr') return <CRProfileSetupPage />;
  return <StudentProfileSetupPage />;
};

export default ProfileSetupPage;

import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useUser } from '@/context/UserContext';
import AdminDashboard from './Dashboard/AdminDashboard';
import SupervisorDashboard from './Dashboard/SupervisorDashboard';
import StudentDashboard from './Dashboard/StudentDashboard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();

  useEffect(() => {
    if (!userRole) {
      navigate('/login');
    }
  }, [userRole]);

  if (!userRole) return null; // Block UI rendering if userRole is null

  return (
    <Layout>
      {userRole === "admin" && <AdminDashboard />}
      {userRole === "supervisor" && <SupervisorDashboard />}
      {userRole === "student" && <StudentDashboard />}
    </Layout>
  );
};

export default Index;

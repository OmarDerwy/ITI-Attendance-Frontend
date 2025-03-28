
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useUser } from '@/context/UserContext';
import AdminDashboard from './Dashboard/AdminDashboard';
import SupervisorDashboard from './Dashboard/SupervisorDashboard';
import StudentDashboard from './Dashboard/StudentDashboard';

const Index = () => {
  const { userRole } = useUser();

  return (
    <Layout>
      {userRole === "admin" && <AdminDashboard />}
      {userRole === "supervisor" && <SupervisorDashboard />}
      {userRole === "student" && <StudentDashboard />}
    </Layout>
  );
};

export default Index;

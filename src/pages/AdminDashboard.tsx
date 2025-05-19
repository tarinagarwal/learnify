import React from 'react';
import MonitoringDashboard from '../components/MonitoringDashboard';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth('admin');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <MonitoringDashboard />
    </div>
  );
};

export default AdminDashboard;

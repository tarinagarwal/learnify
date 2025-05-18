import React from 'react';
import MonitoringDashboard from '../components/MonitoringDashboard';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <MonitoringDashboard />
    </div>
  );
};

export default AdminDashboard;

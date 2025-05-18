import React, { useEffect, useState } from 'react';
import { monitoringService } from '../services/monitoringService';

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(monitoringService.getMetrics());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Service Health Dashboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Feature</th>
            <th className="border p-2">Provider</th>
            <th className="border p-2">Duration (ms)</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Error</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
            <tr key={index} className={metric.success ? 'bg-green-100' : 'bg-red-100'}>
              <td className="border p-2">{metric.feature}</td>
              <td className="border p-2">{metric.provider}</td>
              <td className="border p-2">{metric.duration}</td>
              <td className="border p-2">{metric.success ? 'Success' : 'Failed'}</td>
              <td className="border p-2">{metric.error || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonitoringDashboard;

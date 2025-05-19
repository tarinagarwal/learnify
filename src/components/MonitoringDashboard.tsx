import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AIMetric {
  id: number;
  feature: string;
  provider: string;
  duration: number;
  success: boolean;
  error?: string;
  created_at: string;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('ai_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Error fetching metrics:', error);
      } else {
        setMetrics(data || []);
      }
    };
    fetchMetrics();

    const channel = supabase
      .channel('ai-metrics-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_metrics' },
        (payload) => {
          setMetrics((prev) => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          {metrics.map((metric) => (
            <tr
              key={metric.id}
              className={metric.success ? 'bg-green-100' : 'bg-red-100'}
            >
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

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Activity, CheckCircle, XCircle, Clock, Zap, AlertTriangle, Sparkles } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
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

  // Calculate stats
  const successRate = metrics.length > 0 ? (metrics.filter(m => m.success).length / metrics.length) * 100 : 0;
  const averageDuration = metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length : 0;
  const recentFailures = metrics.filter(m => !m.success).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
              <Activity className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">Loading AI Service Metrics...</p>
            <p className="text-sm text-muted-foreground mt-2">Fetching real-time health data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px hsl(var(--primary) / 0.3)`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 backdrop-blur-sm rounded-full mb-4">
              <Activity className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
              AI Service Health Dashboard
            </h2>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring and performance metrics for AI services
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-card-foreground">{successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-3xl font-bold text-card-foreground">{averageDuration.toFixed(0)}ms</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-full">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Failures</p>
                <p className="text-3xl font-bold text-card-foreground">{recentFailures}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-card/30">
            <h3 className="text-lg font-medium text-card-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Metrics
            </h3>
          </div>
          
          {metrics.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-card-foreground">No metrics available</h3>
              <p className="text-muted-foreground mt-2">
                AI service metrics will appear here once data starts flowing
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Feature</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Provider</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Duration</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Error</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-card-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr
                      key={metric.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${
                        metric.success 
                          ? 'bg-green-500/5 hover:bg-green-500/10' 
                          : 'bg-red-500/5 hover:bg-red-500/10'
                      }`}
                    >
                      <td className="py-4 px-6 text-foreground font-medium">{metric.feature}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">
                          {metric.provider}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-foreground">
                        <span className={`inline-flex items-center gap-1 ${
                          metric.duration < 1000 ? 'text-green-600' : 
                          metric.duration < 3000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {metric.duration}ms
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          metric.success 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {metric.success ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {metric.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground max-w-xs">
                        {metric.error ? (
                          <div className="group relative">
                            <span className="cursor-help text-red-600 truncate block">
                              {metric.error.length > 30 ? `${metric.error.substring(0, 30)}...` : metric.error}
                            </span>
                            {metric.error.length > 30 && (
                              <div className="absolute hidden group-hover:block z-10 bg-card border border-border rounded-lg p-3 shadow-xl max-w-sm -top-2 left-0 text-card-foreground text-xs">
                                {metric.error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(metric.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MonitoringDashboard;

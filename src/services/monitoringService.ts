import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AIMetrics {
  feature: string;
  provider: string;
  duration: number;
  success: boolean;
  error?: string;
}

export class MonitoringService {
  async logMetric(metric: AIMetrics) {
    const { error } = await supabase.from('ai_metrics').insert([metric]);
    if (error) {
      logger.error('Failed to log metric to Supabase', { error });
    } else {
      logger.info(`Metric logged for ${metric.feature}`, metric);
    }
  }

  async getMetrics(): Promise<AIMetrics[]> {
    const { data, error } = await supabase
      .from('ai_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      logger.error('Failed to fetch metrics', { error });
      return [];
    }
    return data || [];
  }
}

export const monitoringService = new MonitoringService();

import { logger } from '../utils/logger';

interface AIMetrics {
  feature: string;
  provider: string;
  duration: number;
  success: boolean;
  error?: string;
}

export class MonitoringService {
  private metrics: AIMetrics[] = [];

  logMetric(metric: AIMetrics) {
    this.metrics.push(metric);
    logger.info(`Metric logged for ${metric.feature}`, metric);
  }

  getMetrics(): AIMetrics[] {
    return this.metrics;
  }
}

export const monitoringService = new MonitoringService();

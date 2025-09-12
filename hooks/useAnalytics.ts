import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
  data: any[];
  timestamp: string;
  role: string;
  type: string;
}

interface UseAnalyticsOptions {
  type: string;
  timeframe?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useAnalytics({
  type,
  timeframe = '7d',
  refreshInterval = 30000, // 30 seconds
  enabled = true
}: UseAnalyticsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        timeframe
      });

      const response = await fetch(`/api/analytics?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyticsData = await response.json();
      setData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [type, timeframe, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, enabled]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

// Specialized hooks for different analytics types
export function useIncidentTrends(timeframe?: string) {
  return useAnalytics({ type: 'incident-trends', timeframe });
}

export function useResponseTimeData() {
  return useAnalytics({ type: 'response-time' });
}

export function useIncidentTypeData() {
  return useAnalytics({ type: 'incident-types' });
}

export function useSafetyTrends(timeframe?: string) {
  return useAnalytics({ type: 'safety-trends', timeframe });
}

export function useVisitTrends() {
  return useAnalytics({ type: 'visit-trends' });
}

export function usePlaceTypeData() {
  return useAnalytics({ type: 'place-types' });
}

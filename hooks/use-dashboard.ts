import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api-services';
import { mapApiError } from '@/lib/api-client';

interface DashboardOverview {
  users: number;
  members: number;
  classes: number;
  pendingEmpowerments: number;
  pendingRequests: number;
  pendingEvents: number;
}

export function useDashboard(period: string = 'all') {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, statsRes] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getStats(period),
      ]);

      setOverview(overviewRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(mapApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { overview, stats, loading, error, refetch: fetchData };
}


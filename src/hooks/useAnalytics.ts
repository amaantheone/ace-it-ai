import useSWR from "swr";
import { useSession } from "next-auth/react";

interface WeeklyDataItem {
  day: string;
  sessions: number;
  mindmaps: number;
  flashcards: number;
  quizzes: number;
}

interface DistributionDataItem {
  name: string;
  value: number;
  color: string;
}

interface SummaryStatItem {
  title: string;
  value: string;
  change: string;
  icon: string;
  gradient: string;
  changeType: string;
}

export interface AnalyticsData {
  weeklyData: WeeklyDataItem[];
  distributionData: DistributionDataItem[];
  summaryStats: SummaryStatItem[];
}

const fetcher = async (url: string): Promise<AnalyticsData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return response.json();
};

export function useAnalytics() {
  const { data: session } = useSession();

  // Only fetch if user is authenticated
  const shouldFetch = !!session?.user?.email;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/dashboard/analytics" : null,
    fetcher,
    {
      // Cache for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
      // Revalidate on focus
      revalidateOnFocus: true,
      // Revalidate on reconnect
      revalidateOnReconnect: true,
      // Keep previous data while fetching new data
      keepPreviousData: true,
      // Retry on error
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

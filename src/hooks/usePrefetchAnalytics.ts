import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { mutate } from "swr";

// Prefetch analytics data for faster dashboard loading
export function usePrefetchAnalytics() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      // Prefetch analytics data in the background
      mutate("/api/dashboard/analytics");
    }
  }, [session]);
}

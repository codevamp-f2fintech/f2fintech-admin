import { useState } from "react";
import useSWR, { mutate } from "swr";

import { fetcher, creator } from "@/apis/apiClient";
import { TicketHistory } from "@/types/tickethistory";

/**
 * Hook for fetching ticket histories with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @returns An object containing the fetched activities, loading state, error state and refetch function.
 */
export const useGetTicketHistory = (
  initialData: TicketHistory,
  pathKey: string
) => {
  const { data: swrData, error } = useSWR<TicketHistory>(pathKey, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0,
    revalidateOnFocus: false,
  });

  // Manually re-trigger re-fetch
  const refetch = async () => {
    return await mutate(pathKey);
  };
  return { value: swrData || [], swrLoading: !error && !swrData, error, refetch };
};

/**
 * Hook for creating new ticket history.
 *
 * @param pathKey - The API path key used to create a new ticket.
 * @returns An object containing the loading state, error state, and the createTicket function.
 */
export const useCreateTicketHistory = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTicketHistory = async (data: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creator(pathKey, data);
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, createTicketHistory };
};

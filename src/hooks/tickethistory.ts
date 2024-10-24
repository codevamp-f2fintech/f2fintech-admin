import { useState } from "react";
import useSWR, { mutate } from "swr";

import { fetcher, creator, modifier } from "@/apis/apiClient";
import { TicketHistory } from "../types/tickethistory";

/**
 * Hook for fetching tickets with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @returns An object containing the fetched activities, loading state, error state and refetch function.
 */
export const useGetTicketHistory = (
  initialData: TicketHistory[],
  pathKey: string
) => {
  const { data: swrData, error } = useSWR<TicketHistory[]>(pathKey, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0, // 1-hour refresh if initialData exists
    revalidateOnFocus: false, // Disable revalidation on window focus
  });

  // Manually re-trigger re-fetch
  const refetch = async () => {
    await mutate(pathKey);
  };

  return { value: swrData || [], swrLoading: !error && !swrData, error, refetch };
};

/**
 * Hook for creating a new ticket.
 *
 * @param pathKey - The API path key used to create a new ticket.
 * @returns An object containing the created ticket, loading state, error state, and the createTicket function.
 */
export const useCreateTicketHistory = (pathKey: string, p0?: {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdHistory, setCreatedHistory] = useState<TicketHistory | null>(
    null
  );

  const createTicketHistory = async (data: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creator(pathKey, data);
      setCreatedHistory(response);
      console.log("Ticket history hook:", response);
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { createdHistory, loading, error, createTicketHistory };
};

/**
 * Hook for modifying an existing ticket.
 *
 * @param pathKey - The API path key used to modify a ticket.
 * @returns An object containing the updated ticket, loading state, error state, and the modifyTicket function.
 */
export const useModifyTicketHistory = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [modifiedTicketHistory, setModifiedTicketHistory] = useState<TicketHistory | null>(
    null
  );

  const modifyTicketHistory = async (
    ticketId: number,
    updatedTicketData: Partial<TicketHistory>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const apiPath = `${pathKey}/${ticketId}`;

      const ticket = await modifier<TicketHistory, Partial<TicketHistory>>(
        apiPath,
        updatedTicketData
      );
      setModifiedTicketHistory(ticket);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { modifiedTicketHistory, loading, error, modifyTicketHistory };
};

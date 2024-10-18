import { useState } from "react";
import useSWR from "swr";

import { fetcher, creator, modifier } from "@/apis/apiClient";
import { Ticket } from "@/types/ticket";

/**
 * Hook for fetching tickets with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @param page - Current page number for pagination.
 * @param pageSize - Size of each page for pagination.
 * @returns An object containing the fetched tickets, loading state, and error state.
 */
export const useGetTickets = (initialData: Ticket[], pathKey: string) => {
  const { data: swrData, error } = useSWR<Ticket[]>(pathKey, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0, // 1-hour refresh if initialData exists
    revalidateOnFocus: false, // Disable revalidation on window focus
  });

  return { value: swrData || [], swrLoading: !error && !swrData, error };
};

/**
 * Hook for creating a new ticket.
 *
 * @param pathKey - The API path key used to create a new ticket.
 * @returns An object containing the created ticket, loading state, error state, and the createTicket function.
 */
export const useCreateTicket = (pathKey: string, p0?: {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const createTicket = async (data: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creator(pathKey, data);
      setCreatedTicket(response);
      console.log("Ticket created hook:", response);
      return response;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createdTicket, loading, error, createTicket };
};

/**
 * Hook for modifying an existing ticket.
 *
 * @param pathKey - The API path key used to modify a ticket.
 * @returns An object containing the updated ticket, loading state, error state, and the modifyTicket function.
 */
export const useModifyTicket = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [modifiedTicket, setModifiedTicket] = useState<Ticket | null>(null);

  const modifyTicket = async (ticketId: number, updatedTicketData: Partial<Ticket>) => {
    setLoading(true);
    setError(null);
    try {
      // Construct the full API path using pathkey and ticketId
      const apiPath = `${pathKey}/${ticketId}`;
      const ticket = await modifier<Ticket, Partial<Ticket>>(apiPath, updatedTicketData);
      setModifiedTicket(ticket);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { modifiedTicket, loading, error, modifyTicket };
};

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Ticket } from "@/types/ticket";
import { fetcher, creator, modifier } from "@/apis/apiClient";

/**
 * Hook for fetching tickets with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @param page - Current page number for pagination.
 * @param pageSize - Size of each page for pagination.
 * @returns An object containing the fetched tickets, loading state, and error state.
 */
export const useGetTickets = (
  initialData: Ticket[],
  pathKey: string,
  page: number,
  pageSize: number
) => {
  const { data: swrData, error } = useSWR<Ticket[]>(
    `${pathKey}?page=${page}&size=${pageSize}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0, // 1-hour refresh if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    }
  );

  return { data: swrData || [], swrLoading: !error && !swrData, error };
};

/**
 * Hook for creating a new ticket.
 *
 * @param pathKey - The API path key used to create a new ticket.
 * @returns An object containing the created ticket, loading state, error state, and the createTicket function.
 */
export const useCreateTicket = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const createTicket = async (ticketData: {
    customer_application_id: number;
    user_id: number;
    forwarded_to: number;
    status: string;
    due_date: Date;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(pathKey, ticketData);
      setCreatedTicket(response.data);
      console.log("Ticket created:", response.data);
    } catch (err) {
      setError(err as Error);
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
  const [updatedTicket, setUpdatedTicket] = useState<Ticket | null>(null);

  const modifyTicket = async (updatedTicketData: Ticket) => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await modifier<Ticket, Ticket>(pathKey, updatedTicketData);
      setUpdatedTicket(ticket);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { updatedTicket, loading, error, modifyTicket };
};

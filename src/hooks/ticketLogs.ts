import { useState } from "react";
import useSWR, { mutate } from "swr";

import { fetcher, creator } from "@/apis/apiClient";
import { TicketLogs } from "../types/ticketLogs";

/**
 * Hook for fetching ticket logs with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @returns An object containing the fetched activities, loading state, error state and refetch function.
 */
export const useGetTicketLogs = (
    initialData: TicketLogs,
    pathKey: string
) => {
    const { data: swrData, error } = useSWR<TicketLogs>(pathKey, fetcher, {
        fallbackData: initialData,
        refreshInterval: initialData ? 3600000 : 0,
        revalidateOnFocus: false,
    });

    // Manually re-trigger re-fetch
    const refetch = async () => {
        await mutate(pathKey);
    };
    return { value: swrData || [], swrLoading: !error && !swrData, error, refetch };
};

/**
 * Hook for creating new ticket log.
 *
 * @param pathKey - The API path key used to create a new ticket.
 * @returns An object containing loading state, error state, and the createTicket function.
 */
export const useCreateTicketLog = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createTicketLog = async (data: object) => {
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
    return { loading, error, createTicketLog };
};

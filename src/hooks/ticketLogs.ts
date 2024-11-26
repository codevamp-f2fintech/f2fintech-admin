import { useState } from "react";
import useSWR, { mutate } from "swr";

import { fetcher, creator, modifier } from "@/apis/apiClient";
import { TicketLogs } from "../types/ticketLogs";

/**
 * Hook for fetching tickets with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket data.
 * @returns An object containing the fetched activities, loading state, error state and refetch function.
 */
export const useGetTicketLogs = (
    initialData: TicketLogs[],
    pathKey: string
) => {
    const { data: swrData, error } = useSWR<TicketLogs[]>(pathKey, fetcher, {
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
export const useCreateTicketLog = (pathKey: string, p0?: {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdLog, setCreatedLog] = useState<TicketLogs | null>(
        null
    );

    const createTicketLog = async (data: object) => {
        setLoading(true);
        setError(null);
        try {
            const response = await creator(pathKey, data);
            setCreatedLog(response);
            console.log("Ticket history hook:", response);
            return response;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { createdLog, loading, error, createTicketLog };
};

/**
 * Hook for modifying an existing ticket.
 *
 * @param pathKey - The API path key used to modify a ticket.
 * @returns An object containing the updated ticket, loading state, error state, and the modifyTicket function.
 */
export const useModifyTicketLog = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [modifiedTicketLog, setModifiedTicketLog] = useState<TicketLogs | null>(
        null
    );

    const modifyTicketLog = async (
        ticketId: number,
        updatedTicketData: Partial<TicketLogs>
    ) => {
        setLoading(true);
        setError(null);
        try {
            const apiPath = `${pathKey}/${ticketId}`;

            const ticket = await modifier<TicketLogs, Partial<TicketLogs>>(
                apiPath,
                updatedTicketData
            );
            setModifiedTicketLog(ticket);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { modifiedTicketLog, loading, error, modifyTicketLog };
};

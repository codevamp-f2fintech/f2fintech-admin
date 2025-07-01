import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, creator, deleter } from "@/apis/apiClient";
import { TicketVoiceNote, TicketVoiceNoteData } from "@/types/ticketVoiceNote";

/**
 * Hook for fetching ticket voice notes.
 * 
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket voice note data.
 * @returns An object containing the fetched voice notes, loading state, error state and refetch function.
 */
export const useGetTicketVoiceNotes = (initialData: TicketVoiceNote, pathKey: string) => {
    const { data: swrData, error } = useSWR<TicketVoiceNote>(pathKey, fetcher, {
        fallbackData: initialData,
        refreshInterval: initialData ? 3600000 : 0,
        revalidateOnFocus: false,
    });

    const refetch = async () => {
        await mutate(pathKey);
    };
    return { value: swrData || [], swrLoading: !error && !swrData, error, refetch };
};

/**
 * Hook for creating a new ticket voice note.
 *
 * @param pathKey - The API path key used to create a new ticket voice note.
 * @returns An object containing the loading state, error state, and the createTicketVoiceNote function.
 */
export const useCreateTicketVoiceNote = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createTicketVoiceNote = async (data: object) => {
        setLoading(true);
        setError(null);
        try {
            const response = await creator<TicketVoiceNoteData, Partial<TicketVoiceNoteData>>(pathKey, data);
            return response;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createTicketVoiceNote };
};

/**
 * Hook for deleting a ticket voice note.
 *
 * @param pathKey - The API path key used to delete a ticket voice note.
 * @returns An object containing the delete function, loading state, and error state.
 */
export const useDeleteTicketVoiceNote = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteTicketVoiceNote = async (voiceNoteId: number) => {
        setLoading(true);
        setError(null);
        try {
            const apiPath = `${pathKey}/${voiceNoteId}`;
            await deleter(apiPath);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, deleteTicketVoiceNote };
};

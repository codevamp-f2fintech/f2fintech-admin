import { useState } from "react";
import useSWR from "swr";
import { fetcher, creator, modifier, deleter } from "@/apis/apiClient";
import { TicketActivities } from "@/types/ticketActivities";

/**
 * Hook for fetching ticket activities.
 * 
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch ticket activities data.
 * @returns An object containing the fetched activities, loading state, and error state.
 */
export const useGetTicketActivities = (initialData: TicketActivities[], pathKey: string) => {
  const { data: swrData, error } = useSWR<TicketActivities[]>(pathKey, fetcher, {
    fallbackData: initialData,
    refreshInterval: initialData ? 3600000 : 0, // 1-hour refresh if initialData exists
    revalidateOnFocus: false, // Disable revalidation on window focus
  });

  return { value: swrData || [], swrLoading: !error && !swrData, error };
};

/**
 * Hook for creating a new ticket activity.
 *
 * @param pathKey - The API path key used to create a new ticket activity.
 * @returns An object containing the created activity, loading state, error state, and the createTicketActivity function.
 */
export const useCreateTicketActivity = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdActivity, setCreatedActivity] = useState<TicketActivities | null>(null);

  const createTicketActivity = async (data: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creator(pathKey, data);
      setCreatedActivity(response);
      console.log(response, 'api res')
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { createdActivity, loading, error, createTicketActivity };
};

/**
 * Hook for modifying an existing ticket activity.
 *
 * @param pathKey - The API path key used to modify a ticket activity.
 * @param refreshInterval - Optional refresh interval for re-fetching activities.
 * @returns An object containing the updated activity, loading state, error state, and the modifyTicketActivity function.
 */
export const useModifyTicketActivity = (pathKey: string, refreshInterval: number = 0) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [modifiedActivity, setModifiedActivity] = useState<TicketActivities | null>(null);

  // Modify the function to accept both `ticket_id` and `activity_id`
  const modifyTicketActivity = async (
    ticketId: number, // Add ticketId parameter
    activityId: number,
    updatedActivityData: Partial<TicketActivities>
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Construct the API path using both ticket_id and activity_id
      const apiPath = `${pathKey}/${ticketId}/${activityId}`;

      // Send the request to update the activity
      const activity = await modifier<TicketActivities, Partial<TicketActivities>>(apiPath, updatedActivityData);

      // Update the state with the modified activity
      setModifiedActivity(activity);

      // Return the modified activity so the calling function can use it
      return activity;
    } catch (err) {
      // Set the error state if the request fails
      setError(err as Error);
    } finally {
      // Set loading to false after the request is complete
      setLoading(false);
    }
  };

  // Return the modified activity, loading, and error states along with the modify function
  return { modifiedActivity, loading, error, modifyTicketActivity };
};

/**
 * Hook for deleting a ticket activity.
 *
 * @param pathKey - The API path key used to delete a ticket activity.
 * @returns An object containing the delete function, loading state, and error state.
 */
export const useDeleteTicketActivity = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTicketActivity = async (activityId: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiPath = `${pathKey}/${activityId}`;
      await deleter(apiPath);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteTicketActivity };
};

import { useState } from 'react';
import useSWR from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { User } from '@/types/user';

/**
 * Hook for fetching users with SWR (stale-while-revalidate) strategy.
 * 
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch user data.
 * @returns An object containing the fetched users, loading state, and error state.
 */
export const useGetUsers = (initialData: User[], pathKey: string) => {
    const { data: swrData, error } = useSWR<User[]>(pathKey, fetcher, {
        fallbackData: initialData,
        refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
        revalidateOnFocus: false,                  // Disable revalidation on window focus
    });

    return { data: swrData || [], swrLoading: !error && !swrData, error };
};

/**
 * Hook for creating a new user.
 * 
 * @param pathKey - The API path key used to create a new user.
 * @returns An object containing the created user, loading state, error state, and the createUser function.
 */
export const useCreateUser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [createdUser, setCreatedUser] = useState<User | null>(null);

    const createUser = async (newUserData: User) => {
        setLoading(true);
        setError(null);

        try {
            const user = await creator<User, User>(pathKey, newUserData);
            setCreatedUser(user);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { createdUser, loading, error, createUser };
};

/**
 * Hook for modifying an existing user.
 * 
 * @param pathKey - The API path key used to modify a user.
 * @returns An object containing the updated user, loading state, error state, and the modifyUser function.
 */
export const useModifyUser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [updatedUser, setUpdatedUser] = useState<User | null>(null);

    const modifyUser = async (updatedUserData: User) => {
        setLoading(true);
        setError(null);

        try {
            const user = await modifier<User, User>(pathKey, updatedUserData);
            setUpdatedUser(user);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { updatedUser, loading, error, modifyUser };
};

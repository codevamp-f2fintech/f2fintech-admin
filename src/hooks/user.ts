import { useState } from 'react';
import useSWR, { mutate } from 'swr';

import { creator, fetcher, modifier } from '@/apis/apiClient';
import { User, UserData } from '@/types/user';

/**
 * Hook for fetching users with SWR.
 * Pure client-side, no SSR initialData complexity.
 */
export const useGetUsers = (
    pathKey: string,
    page: number = 1,
    limit: number = 10,
    status: string = 'active',
    search: string = '',
) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const fullPath = `${pathKey}?page=${page}&limit=${limit}&status=${status}${searchParam}`;

    const { data: swrData, error, isValidating, isLoading } = useSWR<User | null>(
        fullPath,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000,
        });

    const refetch = async () => {
        return await mutate(fullPath);
    };

    return {
        value: swrData || {
            data: {
                results: [],
                count: 0,
                pages: 0,
            }
        },
        swrLoading: isLoading || isValidating || (!swrData && !error),
        error,
        refetch,
    };
};

/**
 * Hook for creating a new user.
 */
export const useCreateUser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createUser = async (newUserData: UserData) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await creator<UserData, UserData>(pathKey, newUserData);
            return resp;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, createUser };
};

/**
 * Hook for modifying an existing user.
 */
export const useModifyUser = (pathKey: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modifyUser = async (updatedUserData: Partial<UserData>) => {
        setLoading(true);
        setError(null);
        try {
            const user = await modifier<UserData, Partial<UserData>>(pathKey, updatedUserData);
            return user;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, modifyUser };
};

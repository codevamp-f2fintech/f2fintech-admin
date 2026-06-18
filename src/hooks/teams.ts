import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/apis/apiClient';

/**
 * Hook for fetching all team assignments with SWR.
 */
export const useGetAllAssignments = (role: string = 'sales') => {
  const fullPath = `teams/all?role=${encodeURIComponent(role)}`;

  const { data: swrData, error, isValidating, isLoading } = useSWR<any>(
    fullPath,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  const refetch = async () => {
    return await mutate(fullPath);
  };

  return {
    value: swrData || { data: [] },
    swrLoading: isLoading || isValidating || (!swrData && !error),
    error,
    refetch,
  };
};

/**
 * Hook for fetching team members of a supervisor.
 */
export const useGetSupervisorTeam = (supervisorId: number | null, level?: 'l1' | 'l2', role: string = 'sales') => {
  const fullPath = supervisorId 
    ? `teams/supervisor/${supervisorId}?role=${encodeURIComponent(role)}${level ? `&level=${level}` : ''}`
    : null;

  const { data: swrData, error, isValidating, isLoading } = useSWR<any>(
    fullPath,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const refetch = async () => {
    if (fullPath) return await mutate(fullPath);
  };

  return {
    value: swrData || { data: [] },
    swrLoading: isLoading || isValidating || (fullPath && !swrData && !error),
    error,
    refetch,
  };
};

/**
 * Hook for fetching supervisors of a member.
 */
export const useGetMemberSupervisors = (memberId: number | null, role: string = 'sales') => {
  const fullPath = memberId 
    ? `teams/member/${memberId}?role=${encodeURIComponent(role)}`
    : null;

  const { data: swrData, error, isValidating, isLoading } = useSWR<any>(
    fullPath,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const refetch = async () => {
    if (fullPath) return await mutate(fullPath);
  };

  return {
    value: swrData || { data: {} },
    swrLoading: isLoading || isValidating || (fullPath && !swrData && !error),
    error,
    refetch,
  };
};

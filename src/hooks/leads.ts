import useSWR from 'swr';
import { LeadsAPI } from '@/apis/LeadsAPI';

export const useGetLeads = (initialData: any, key: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await LeadsAPI.getAllLeads();
      return response.data;
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  return {
    leads: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
};

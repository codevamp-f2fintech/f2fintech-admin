import useSWR, { mutate } from "swr";
import { fetcher } from "@/apis/apiClient";

export const useGetLeads = (page: number = 1, limit: number = 10, key: string = "get-all-leads") => {
  const fullPath = `${key}?page=${page}&limit=${limit}`;
  const { data: swrData, error, isValidating } = useSWR<any>(fullPath, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000
  });

  const refetch = async () => {
    return await mutate(fullPath);
  };

  return {
    leadsData: swrData?.data || { results: [], count: 0, pages: 0 },
    isLoading: !error && !swrData && isValidating,
    isError: error,
    refetch,
  };
};

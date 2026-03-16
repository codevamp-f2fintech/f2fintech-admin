import useSWR from "swr";
import { QueriesAPI } from "@/apis/QueriesAPI";

export const useGetQueries = (initialData: any = [], key: string = "get-all-queries") => {
  const { data, error, mutate, isLoading } = useSWR(
    key,
    async () => {
      const response = await QueriesAPI.getQueries();
      return response.data || [];
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  return {
    queries: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
};

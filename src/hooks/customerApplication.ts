import { useState } from "react";
import useSWR, { mutate } from "swr";

import { creator, fetcher, modifier } from "@/apis/apiClient";
import { CustomerApplication, CustomerApplicationData } from "@/types/customerApplication";

/**
 * Hook for fetching customerApplications with SWR (stale-while-revalidate) strategy.
 *
 * @param pathKey - The API path key used by SWR to fetch customer data.
 * @param page - The page number for pagination.
 * @param limit - The limit for pagination.
 * @returns An object containing the fetched customerApplications, loading state, and error state.
 */
export const useGetCustomerApplications = (
  pathKey: string,
  page: number = 1,
  limit: number = 6,
) => {
  const url = `${pathKey}?page=${page}&limit=${limit}`;
  const {
    data: swrData,
    error,
    isValidating,
  } = useSWR<{
    statusCode: number;
    message: string;
    data: CustomerApplication;
  }>(
    url,
    fetcher,
    {
      refreshInterval: 3600000,
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  const refetch = async () => {
    await mutate(url);
  };

  return {
    value: swrData?.data || {
      results: [],
      count: 0,
      pages: 0
    },
    swrLoading: !error && !swrData && isValidating,
    error,
    refetch,
  };
};

/**
 * Hook for creating a new customer.
 *
 * @param pathKey - The API path key used to create a new customer.
 * @returns An object containing the created customer, loading state, error state, and the createCustomer function.
 */
export const useCreateCustomerApplication = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCustomerApplication = async (ticketData: {
    applicationId: number;
    userId: number;
    status: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creator(pathKey, ticketData);
      return response;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createCustomerApplication };
};

/**
 * Hook for modifying an existing customer.
 *
 * @param pathKey - The API path key used to modify a customer.
 * @returns An object containing the updated customer, loading state, error state, and the modifyCustomer function.
 */
export const useModifyCustomerApplication = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const modifyCustomerApplication = async (
    id: number,
    updatedCustomerApplicationData: Partial<CustomerApplicationData>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const apiPath = `${pathKey}/${id}`;

      const customerApplication = await modifier<CustomerApplicationData, Partial<CustomerApplicationData>>(
        apiPath,
        updatedCustomerApplicationData
      );
      return customerApplication;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, modifyCustomerApplication };
};

import { useState } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";

import { fetcher, modifier } from "@/apis/apiClient";
import { Customer, CustomerData } from "@/types/customer";

/**
 * Hook for fetching customers with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch customer data.
 * @param page - The page number for pagination.
 * @param limit - The limit for pagination.
 * @param shouldFetch - Determines whether the hook should fetch data.
 * @returns An object containing the fetched customers, loading state, and error state.
 */
export const useGetCustomers = (
  initialData: Customer | null,
  pathKey: string,
  page: number = 1,
  limit: number = 6,
  shouldFetch: boolean = true // Add shouldFetch to control fetching
) => {
  console.log("calling api", page);
  const {
    data: swrData,
    error,
    isValidating,
  } = useSWR<Customer | null>(
    shouldFetch ? `${pathKey}?page=${page}&limit=${limit}` : null, // Use null to pause fetching
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 0, // 1 hour refresh if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    }
  );

  // Manually re-trigger re-fetch
  const refetch = async () => {
    console.log("refetching>>>", page);
    if (shouldFetch) {
      await mutate(`${pathKey}?page=${page}&limit=${limit}`);
    }
  };

  return {
    value: swrData || {
      results: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
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
export const useCreateCustomer = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdCustomer, setCreatedCustomer] = useState<CustomerData | null>(
    null
  );

  const createCustomer = async (ticketData: {
    applicationId: number;
    userId: number;
    status: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(pathKey, ticketData);
      setCreatedCustomer(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { createdCustomer, loading, error, createCustomer };
};

/**
 * Hook for modifying an existing customer.
 *
 * @param pathKey - The API path key used to modify a customer.
 * @returns An object containing the updated customer, loading state, error state, and the modifyCustomer function.
 */
export const useModifyCustomer = (pathKey: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedCustomer, setUpdatedCustomer] = useState<CustomerData | null>(
    null
  );

  const modifyCustomer = async (
    id: number,
    updatedCustomerData: Partial<CustomerData>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const apiPath = `${pathKey}/${id}`;

      const customer = await modifier<CustomerData, Partial<CustomerData>>(
        apiPath,
        updatedCustomerData
      );
      setUpdatedCustomer(customer);
      return customer;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { updatedCustomer, loading, error, modifyCustomer };
};

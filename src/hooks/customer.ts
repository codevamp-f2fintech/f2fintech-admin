import { useState } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { creator, fetcher, modifier } from "@/apis/apiClient";
import { Customer } from "@/types/customer"; // Assuming CustomerData is defined in the types
/**
 * Hook for fetching customers with SWR (stale-while-revalidate) strategy.
 *
 * @param initialData - The initial data to be used before SWR fetches fresh data.
 * @param pathKey - The API path key used by SWR to fetch customer data.
 * @param page
 * @param pageSize
 * @returns An object containing the fetched customers, loading state, and error state.
 */
export const useGetCustomers = (
  initialData: Customer[],
  pathKey: string,
  page: number = 1,
  pageSize: number = 6
) => {
  const { data: swrData, error } = useSWR<Customer[]>(
    `${pathKey}?page=${page}&size=${pageSize}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    }
  );
  // Manually re-trigger re-fetch
  const refetch = async () => {
    await mutate(`${pathKey}?page=${page}&size=${pageSize}`);
  };

  return { data: swrData || [], swrLoading: !error && !swrData, error, refetch };
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
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);

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
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(null);

  const modifyCustomer = async (id: number, updatedCustomerData: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    try {
      const apiPath = `${pathKey}/${id}`;

      const customer = await modifier<Customer, Partial<Customer>>(
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

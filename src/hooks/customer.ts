import { useState } from "react";
import useSWR from "swr";
import { creator, fetcher, modifier } from "@/apis/apiClient";
import { CustomerData } from "@/types/customer"; // Assuming CustomerData is defined in the types
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
  initialData: CustomerData[],
  pathKey: string,
  page: number,
  pageSize: number
) => {
  const { data: swrData, error } = useSWR<CustomerData[]>(
    `${pathKey}?page=${page}&size=${pageSize}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: initialData ? 3600000 : 0, // 1 hour refresh if initialData exists
      revalidateOnFocus: false, // Disable revalidation on window focus
    }
  );
  return { data: swrData || [], swrLoading: !error && !swrData, error };
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
  const createCustomer = async (newCustomerData: CustomerData) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await creator<CustomerData, CustomerData>(
        pathKey,
        newCustomerData
      );
      setCreatedCustomer(customer);
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
  const modifyCustomer = async (updatedCustomerData: CustomerData) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await modifier<CustomerData, CustomerData>(
        pathKey,
        updatedCustomerData
      );
      setUpdatedCustomer(customer);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { updatedCustomer, loading, error, modifyCustomer };
};

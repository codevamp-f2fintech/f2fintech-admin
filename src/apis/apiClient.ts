import { axiosInstance } from "./config/axiosConfig";

/**
 * Utility to inject token and companyId into headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem( "token" );
  const companyId = localStorage.getItem( "companyId" );

  return {
    "Content-Type": "application/json",
    ...( token && { "x-access-token": token } ),
    ...( companyId && { "x-company-id": companyId } ),
  };
};

/**
 * Fetches data using GET request
 */
export const fetcher = async <T> ( url: string ): Promise<T> => {
  const res = await axiosInstance.get<T>( url, {
    headers: getAuthHeaders(),
  } );

  if ( !res.data )
  {
    throw new Error( "No data found" );
  }
  return res.data;
};

/**
 * Creates data using POST request
 */
export const creator = async <T, D> ( url: string, data: D ): Promise<T> => {
  const res = await axiosInstance.post<T>( url, data, {
    headers: getAuthHeaders(),
  } );

  if ( !res.data )
  {
    throw new Error( "Failed to create data" );
  }
  return res.data;
};

/**
 * Updates data using PATCH request
 */
export const modifier = async <T, D> ( url: string, data: D ): Promise<T> => {
  const res = await axiosInstance.patch<T>( url, data, {
    headers: getAuthHeaders(),
  } );

  if ( !res.data )
  {
    throw new Error( "Failed to modify data" );
  }
  return res.data;
};

/**
 * Deletes data using DELETE request
 */
export const deleter = async <T> ( url: string ): Promise<T> => {
  const res = await axiosInstance.delete<T>( url, {
    headers: getAuthHeaders(),
  } );

  if ( !res.data )
  {
    throw new Error( "Failed to delete data" );
  }
  return res.data;
};

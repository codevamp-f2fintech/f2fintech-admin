import { Utility } from "@/utils";
import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

/**
 * Creates a custom Axios instance with predefined configurations.
 */
export const axiosInstance: AxiosInstance = axios.create( {
  baseURL: `${ process.env.NEXT_PUBLIC_API_URL }`,
  withCredentials: true,
  validateStatus: ( status ) => ( status >= 200 && status < 300 ) || status == 404,
  timeout: 40000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8",
  },
} );

/**
 * Custom error handler for Axios.
 */
const errorHandler = ( error: AxiosError ): Promise<never> => {
  const statusCode = error.response?.status;

  if ( statusCode && statusCode !== 401 )
  {
    throw error;
  }

  return Promise.reject( error );
};

// Response interceptor
axiosInstance.interceptors.response.use(
  ( response: AxiosResponse ) => response,
  ( error: AxiosError ) => errorHandler( error )
);

// Request interceptor (Token + CompanyId)
axiosInstance.interceptors.request.use(
  ( config ) => {
    const { getCookies } = Utility();
    const cookieStore = getCookies() as {
      token?: string;
      companyId?: string;
      userRole?: string;
      [ key: string ]: any;
    };

    const token = cookieStore.token;
    const companyId = cookieStore.companyId;
    const userRole = cookieStore.userRole;

    // Add token to request header
    if ( token )
    {
      config.headers[ "x-access-token" ] = token;
      config.headers[ "userrole" ] = userRole;
    }

    // Add companyId to every request as query param
    if ( companyId && userRole !== "super admin" )
    {
      config.headers[ "CompanyId" ] = companyId;
    } else if ( userRole === "super admin" )
    {
      console.log( '- companyId exists?', !!companyId );
      console.log( '- userRole is super admin?', userRole === 'super admin' );
    }

    return config;
  },
  ( error ) => Promise.reject( error )
);

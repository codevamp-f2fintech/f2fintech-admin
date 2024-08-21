import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

/**
 * Creates a custom Axios instance with predefined configurations.
 * This instance is configured with a base URL for the API, a request timeout,
 * and default headers that will be applied to every request made using this instance.
 * 
 * @constant
 * @type {AxiosInstance}
 */
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: `https://jsonplaceholder.typicode.com/`,
    timeout: 40000,
    headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json; charset=utf-8'
    }
});

/**
 * Custom error handler for the Axios instance.
 * This function intercepts all errors returned from the API requests made using the axiosInstance.
 * It checks the status code of the error and logs it if it's not a 401 (Unauthorized) error.
 * The error is then re-thrown for further handling.
 *
 * @param {AxiosError} error - The error object returned by Axios.
 * @returns {Promise<never>} - A rejected promise containing the error.
 * @throws {AxiosError} - Throws the error if it's not a 401 error.
 */
const errorHandler = (error: AxiosError): Promise<never> => {
    const statusCode = error.response?.status;

    // logging only errors that are not 401
    if (statusCode && statusCode !== 401) {
        throw error;
    };

    return Promise.reject(error);
};

// Registering the custom error handler to the 'axiosInstance' so that errorHandler function is called automatically.
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => errorHandler(error)
);

import { axiosInstance } from "./config/axiosConfig";

/**
 * Fetches data from the provided URL using a GET request.
 *
 * @template T - The expected type of the response data.
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Promise<T>} - A promise that resolves to the fetched data.
 * @throws {Error} - If the response does not contain data.
 */
export const fetcher = async <T>(url: string): Promise<T> => {
    const res = await axiosInstance.get<T>(url);
    if (!res.data) {
        throw new Error('No data found');
    }
    return res.data;
};

/**
 * Creates data at the provided URL using a POST request.
 *
 * @template T - The type of the response data.
 * @template D - The type of the data to be sent in the request body.
 * @param {string} url - The API endpoint to send data to.
 * @param {D} data - The data to be sent.
 * @returns {Promise<T>} - A promise that resolves to the created data.
 * @throws {Error} - If the response does not contain data.
 */
export const creator = async <T, D>(url: string, data: D): Promise<T> => {
    const res = await axiosInstance.post<T>(url, data);
    if (!res.data) {
        throw new Error('Failed to create data');
    }
    return res.data;
};

/**
 * Modifies data at the provided URL using a PUT request.
 *
 * @template T - The type of the response data.
 * @template D - The type of the data to be sent in the request body.
 * @param {string} url - The API endpoint to send data to.
 * @param {D} data - The data to be updated.
 * @returns {Promise<T>} - A promise that resolves to the updated data.
 * @throws {Error} - If the response does not contain data.
 */
export const modifier = async <T, D>(url: string, data: D): Promise<T> => {
    const res = await axiosInstance.put<T>(url, data);
    if (!res.data) {
        throw new Error('Failed to modify data');
    }
    return res.data;
};

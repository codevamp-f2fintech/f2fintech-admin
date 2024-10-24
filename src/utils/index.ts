import { AlertColor } from "@mui/material/Alert";
import { jwtDecode } from "jwt-decode";

import { User } from "@/types/user";
import { setToast } from "@/redux/features/toastSlice";
import { cookies } from "next/headers";

export const Utility = () => {
  /**
   * Fetches data from a given API endpoint.
   * @param {string} url - The base URL of the API endpoint.
   * @param {number} page - The page number to fetch.
   * @param {number} size - The number of items to fetch per page.
   * @returns {Promise<User[]>} - A promise that resolves to an array of `User` objects.
   * @throws {Error} - Throws an error if the network request fails or if the response is not ok.
   */
  const fetchData = async (
    url: string,
    page: number,
    size: number
  ): Promise<User[]> => {
    const response = await fetch(`${url}?_page=${page}&_limit=${size}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  };

  /**
   * Utility to store value in sessionStorage.
   * @param {string} key - The key to set in sessionStorage.
   * @param {any} value - The value to store.
   */
  const setSessionStorage = (key: string, value: any): void => {
    if (typeof window !== "undefined") {
      // Check if window is available (client-side)
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  };

  /**
   * Utility to get value from sessionStorage.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any | null} - The retrieved value or null if not found.
   */
  const getSessionStorage = (key: string): any | null => {
    if (typeof window !== "undefined") {
      // Ensure we're on the client-side
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : null;
    }
    return null; // Return null if window is not available (server-side)
  };

  /**
   * Get the value associated with a key from local storage.
   * @param {string} key - The key for which to retrieve the value from local storage.
   * @returns {any | null} - The value associated with the key, or null if the key is not found.
   */
  const getLocalStorage = (key: string): any | null => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : null;
    }
    return null;
  };

  /**
   * Removes a key-value pair from local storage.
   * @param {string} key - The key to be removed from local storage.
   * @returns {void}
   */
  const remLocalStorage = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {}
  };

  /**
   * Sets a key-value pair in local storage.
   * @param {string} key - The key to be set in local storage.
   * @param {any} value - The value associated with the key.
   * @returns {void}
   */
  const setLocalStorage = (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {}
  };

  /**
   * Displays a toast alert, sets its severity and message, and optionally navigates to a specified path after a delay.
   *
   * @param {function} dispatch - The Redux dispatch function.
   * @param {boolean} display - Whether to display the toast alert.
   * @param {string} severity - The severity level of the toast alert (e.g., 'success', 'info', 'warning', 'error').
   * @param {string} msg - The message to be displayed in the toast alert.
   * @param {function|null} navigateTo - The navigation function to be called after the delay.
   * @param {string|null} [path] - The optional path to navigate to after hiding the toast alert.
   * @returns {void} This function does not return any value.
   */

  const toastAndNavigate = (
    dispatch: Function,
    display: boolean,
    severity: AlertColor,
    msg: string,
    navigateTo: Function | null = null,
    path: string | null = null,
    reload = false
  ): void => {
    dispatch(
      setToast({
        toastAlert: display,
        toastSeverity: severity,
        toastMessage: msg,
      })
    );
    setTimeout(() => {
      dispatch(
        setToast({
          toastAlert: !display,
          toastSeverity: "info",
          toastMessage: "",
        })
      );
      if (path && navigateTo) {
        navigateTo(path);
      }
      if (reload) {
        location.reload();
      }
    }, 2500);
  };

  /**
   * Get cookies from document.cookie and return them as an object.
   * @returns {Object} An object representing the cookies.
   */
  const getCookies = (): object => {
    const cookieString = document.cookie; // Get cookies as a string
    const cookiesArray = cookieString.split("; "); // Split into an array
    const cookies: Record<string, string> = {};

    // Convert array into a key-value pair object
    cookiesArray.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      cookies[key] = decodeURIComponent(value);
    });

    return cookies;
  };

  /**
   * Set a cookie with an optional expiration time (default 7 days).
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   */
  const setCookie = (name: string, value: string): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/;`;
  };

  /**
   * Decode the JWT token stored in cookies.
   * @returns {any | null} - Decoded token payload, or null if token not found or invalid.
   */
  const decodedToken = (token = null): any | null => {
    if (!token) {
      const cookies = getCookies();
      token = cookies.token;
    }

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken;
      } catch (error) {
        console.log("Error decoding token:", error);
        return null;
      }
    } else {
      console.log("No token found in cookies");
      return null;
    }
  };

  return {
    decodedToken,
    fetchData,
    getSessionStorage,
    setSessionStorage,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
    toastAndNavigate,
    getCookies,
    setCookie,
  };
};

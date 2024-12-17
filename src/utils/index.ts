import { AlertColor } from "@mui/material/Alert";
import { jwtDecode } from "jwt-decode";

import { User } from "@/types/user";
import { setToast } from "@/redux/features/toastSlice";

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
   * Function to capitalize 1st letter of a string
   * @param str - The string whose 1st letter is to be capitalized
   * @returns
   */
  const capitalizeFirstLetter = (str: string) => {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
  };

  // Function to calculate the number of days ago
  const calculateDaysAgo = (date: string) => {
    const today = new Date();
    const addedDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   *
   * @param timeSpent
   * @returns
   */
  const parseTimeSpent = (timeSpent: string): number => {
    const timeRegex = /^(\d+)([hdm])$/;
    const match = timeSpent.match(timeRegex);

    if (!match) return 0; // Return 0 if the format is invalid

    const [, value, unit] = match;
    const numericValue = parseInt(value, 10);

    switch (unit) {
      case "h": // hours
        return numericValue;
      case "d": // days (assuming 1 day = 8 working hours)
        return numericValue * 8;
      case "m": // minutes (convert to hours)
        return numericValue / 60;
      default:
        return 0;
    }
  };

  // Function to convert hours back into 'Xd Yh' format
  const convertHoursToDaysAndHours = (totalHours: number): string => {
    const totalMinutes = Math.round(totalHours * 60); // Convert total hours to total minutes
    const days = Math.floor(totalMinutes / (8 * 60)); // 1 day = 8 hours = 480 minutes
    const remainingMinutesAfterDays = totalMinutes % (8 * 60); // Remaining minutes after accounting for days
    const hours = Math.floor(remainingMinutesAfterDays / 60); // Convert remaining minutes to hours
    const minutes = remainingMinutesAfterDays % 60; // Get remaining minutes

    let formattedTime = "";

    if (days > 0) {
      formattedTime += `${days}d`;
    }
    if (hours > 0 || days === 0) {
      // Show hours if there are any, or if there are no days
      formattedTime += `${days > 0 ? " " : ""}${hours}h`;
    }
    if (minutes > 0) {
      formattedTime += `${days > 0 || hours > 0 ? " " : ""}${minutes}m`; // Add space if days or hours exist
    }
    return formattedTime || "0h";
  };

  const formatTenure = (tenure: number) => {
    if (tenure <= 60) {
      return `${tenure} months`;
    } else {
      const years = (tenure / 12).toFixed(1); // convert to years with one decimal place if needed
      return `${years} years`;
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date"; // Check if date is valid
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Function to format the amount in INR
  const formatAmount = (amount) => {
    return `₹ ${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amount)}`;
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
    } catch (err) { }
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
    } catch (err) { }
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
    if (typeof document === "undefined") {
      return {};
    }
    const cookieString = document?.cookie; // Get cookies as a string
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
    // Prioritize server-side provided token
    if (typeof document === "undefined") {
      if (token) {
        try {
          return jwtDecode(token);
        } catch (error) {
          console.log("Error decoding token (server-side):", error);
          return null;
        }
      }
      return {}; // No token provided server-side
    }
    // Client-side handling
    if (!token) {
      const cookies = getCookies();
      token = cookies?.token;
    }
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.log("Error decoding token (client-side):", error);
        return null;
      }
    }
    console.log("No token found in cookies");
    return null;
  };

  return {
    capitalizeFirstLetter,
    calculateDaysAgo,
    convertHoursToDaysAndHours,
    decodedToken,
    fetchData,
    formatTenure,
    formatDate,
    formatAmount,
    getSessionStorage,
    setSessionStorage,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
    parseTimeSpent,
    toastAndNavigate,
    getCookies,
    setCookie,
  };
};

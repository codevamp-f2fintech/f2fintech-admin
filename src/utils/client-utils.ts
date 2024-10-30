"use client";

export const Utility = () => {
  /**
   * Get cookies from document.cookie and return them as an object.
   * @returns {Object} An object representing the cookies.
   */
  const getCookies = (): object => {
    if (typeof document === "undefined") {
      // Return an empty object if `document` is not available
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

  return {
    getCookies,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
  };
};

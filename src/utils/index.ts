import { User } from "@/types/user";
import { Toast } from "@/types/toast";
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
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  };

  /**
   * Get the value associated with a key from local storage.
   * @param {string} key - The key for which to retrieve the value from local storage.
   * @returns {any | null} - The value associated with the key, or null if the key is not found.
   */
  const getLocalStorage = (key: string): any | null => {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null && storedValue !== "undefined") {
      try {
        return JSON.parse(storedValue);
      } catch (err) {
        console.error(`Error parsing ${key} from localStorage:`, err);
      }
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
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
    }
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
    } catch (err) {
      console.error(`Error setting ${key} in localStorage:`, err);
    }
  };

  /**
   * Displays a toast alert, sets its severity and message, and optionally navigates to a specified path after a delay.
   *
   * @param {function} dispatch - The Redux dispatch function.
   * @param {boolean} display - Whether to display the toast alert.
   * @param {string} severity - The severity level of the toast alert (e.g., 'success', 'info', 'warning', 'error').
   * @param {string} msg - The message to be displayed in the toast alert.
   * @param {function} navigateTo - The navigation function to be called after the delay.
   * @param {string|null} [path] - The optional path to navigate to after hiding the toast alert.
   * @returns {void} This function does not return any value.
   */

  const toastAndNavigate = (
    dispatch,
    display,
    severity,
    msg,
    navigateTo,
    path = null,
    reload = false
  ) => {
    dispatch(
      setToast({
        toastAlert: display,
        toastSeverity: severity,
        toastMessage: msg,
      })
    );
    setTimeout(() => {
      dispatch(
        setToast({ toastAlert: !display, toastSeverity: "", toastMessage: "" })
      );
      if (path) {
        navigateTo(path);
        if (reload) {
          location.reload();
        }
      }
    }, 2000);
  };

  return {
    fetchData,
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
    toastAndNavigate,
  };
};

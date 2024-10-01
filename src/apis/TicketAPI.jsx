/**
 * Copyright © 2024, F2FINTECH. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2FINTECH., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2 FINTECH.
 */

import { axiosInstance } from "@/apis/config/axiosConfig";
import { defineCancelApiObject } from "@/apis/config/axiosUtils";

export const TicketAPI = {
  /** Login user
   */
  login: async (loginInfo, cancel = false) => {
    return await axiosInstance.request({
      url: `ticket/login`,
      method: "POST",
      data: loginInfo,
      signal: cancel
        ? cancelApiObject[this.login.name].handleRequestCancellation().signal
        : undefined,
    });
  },
  /** Login user
   */

  /** Register user */
  create: async (registerInfo, cancel = false) => {
    return await axiosInstance.request({
      url: `ticket/create`,
      method: "POST",
      data: registerInfo,
      signal: cancel
        ? cancelApiObject[this.register.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  getUserProfile: async (userId, cancel = false) => {
    return await axiosInstance.request({
      url: `ticket/get/${userId}`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getuserProfile.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  updateUserProfile: async (newData) => {
    try {
      const response = await axiosInstance.request({
        url: `ticket/update/:id`,
        method: "POST",
        data: newData,
      });
      return response.data; // Optionally return data if needed
    } catch (error) {
      // Handle errors here
      throw error; // Rethrow or handle as needed
    }
  },
};

// defining the cancel API object for TicketAPI
const cancelApiObject = defineCancelApiObject(TicketAPI);

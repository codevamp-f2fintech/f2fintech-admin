/**
 * Copyright © 2024, F2FINTECH. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2FINTECH., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2 FINTECH.
 */

import { axiosInstance } from "@/apis/config/axiosConfig";
import { defineCancelApiObject } from "@/apis/config/axiosUtils";

export const UserAPI = {
  /** Login user
   */
  login: async (loginInfo, cancel = false) => {
    return await axiosInstance.request({
      url: `/login`,
      method: "POST",
      data: loginInfo,
      signal: cancel
        ? cancelApiObject[this.login.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  /** Register user */
  create: async (registerInfo, cancel = false) => {
    return await axiosInstance.request({
      url: `create-user`,
      method: "POST",
      data: registerInfo,
      signal: cancel
        ? cancelApiObject[this.register.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  getUserProfile: async (userId, cancel = false) => {
    return await axiosInstance.request({
      url: `get-user-by-id/${userId}`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getuserProfile.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },

  updateUserProfile: async (newData) => {
    return await axiosInstance.request({
      url: `update-user`,
      method: "PATCH",
      data: newData,
    });
  },

  getInactiveUsers: async ( page = 1, limit = 10, cancel = false ) => {
    return await axiosInstance.request( {
      url: `/get-inactive-users`,
      method: "GET",
      params: {
        page,
        limit
      },
      signal: cancel
        ? cancelApiObject[ UserAPI.getInactiveUsers.name ].handleRequestCancellation()
          .signal
        : undefined,
    } );
  },

  // upload document to S3 Bucket
  uploadDocument: async (document, cancel = false) => {
    return await axiosInstance.request({
      url: `/upload-to-s3`,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      data: document,
      signal: cancel
        ? cancelApiObject[this.uploadDocument.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
};

// defining the cancel API object for UserAPI
const cancelApiObject = defineCancelApiObject(UserAPI);

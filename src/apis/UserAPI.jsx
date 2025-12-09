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
  /** Login user */
  login: async ( loginInfo, cancel = false ) => {
    return await axiosInstance.request( {
      url: `/login`,
      method: "POST",
      data: loginInfo,
      signal: cancel
        ? cancelApiObject[ this.login.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Register user */
  create: async ( registerInfo, cancel = false ) => {
    return await axiosInstance.request( {
      url: `create-user`,
      method: "POST",
      data: registerInfo,
      signal: cancel
        ? cancelApiObject[ this.create.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Get user profile with company_id support */
  getUserProfile: async ( userId, company_id = null, cancel = false ) => {
    const params = {};

    // Add company_id as query parameter if provided
    if ( company_id ) {
      params.company_id = company_id;
    }

    return await axiosInstance.request( {
      url: `get-user-by-id/${ userId }`,
      method: "GET",
      params: params,
      signal: cancel
        ? cancelApiObject[ this.getUserProfile.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Update user profile */
  updateUserProfile: async ( newData ) => {
    return await axiosInstance.request( {
      url: `update-user`,
      method: "PATCH",
      data: newData,
    } );
  },

  /** Get inactive users with company filtering */
  getInactiveUsers: async ( page = 1, limit = 10, company_id = null, cancel = false ) => {
    const params = {
      page,
      limit,
      company_id,
    };

    // Add company_id as query parameter if provided
    if ( company_id ) {
      params.company_id = company_id;
    }

    console.log( "company", company_id )

    return await axiosInstance.request( {
      url: `/get-inactive-users`,
      method: "GET",
      params: params,
      signal: cancel
        ? cancelApiObject[ UserAPI.getInactiveUsers.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Get all users with company filtering */
  getAllUsers: async ( page = 1, limit = 10, company_id = null, cancel = false ) => {
    const params = {
      page,
      limit
    };

    // Add company_id as query parameter if provided
    if ( company_id ) {
      params.company_id = company_id;
    }

    return await axiosInstance.request( {
      url: `/get-all-users`,
      method: "GET",
      params: params,
      signal: cancel
        ? cancelApiObject[ UserAPI.getAllUsers.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Get users by company */
  getUsersByCompany: async ( company_id, page = 1, limit = 10, cancel = false ) => {
    return await axiosInstance.request( {
      url: `/get-users-by-company/${ company_id }`,
      method: "GET",
      params: {
        page,
        limit
      },
      signal: cancel
        ? cancelApiObject[ UserAPI.getUsersByCompany.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Upload document to S3 Bucket */
  uploadDocument: async ( document, cancel = false ) => {
    return await axiosInstance.request( {
      url: `/upload-to-s3`,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      data: document,
      signal: cancel
        ? cancelApiObject[ this.uploadDocument.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /** Get all companies */
  getAllCompanies: async ( page = 1, limit = 10, cancel = false ) => {
    return await axiosInstance.request( {
      url: `/companies`,
      method: "GET",
      params: {
        page,
        limit
      },
      signal: cancel
        ? cancelApiObject[ UserAPI.getAllCompanies.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },
};

// defining the cancel API object for UserAPI
const cancelApiObject = defineCancelApiObject( UserAPI );
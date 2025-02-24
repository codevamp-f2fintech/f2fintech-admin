/**
 * Copyright © 2024, F2FINTECH. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2FINTECH., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2 FINTECH.
 */

import { axiosInstance } from './config/axiosConfig';
import { defineCancelApiObject } from './config/axiosUtils';

export const LoanProviderAPI = {
  /**
   * Create a new loan provider
   */
  create: async ( registerInfo: any, cancel = false) => {
    return await axiosInstance.request({
      url: '/loan-providers',
      method: 'POST',
      data: registerInfo,
      signal: cancel && cancelApiObject.create
        ? cancelApiObject.create.handleRequestCancellation().signal
        : undefined,

    });
  },

  /**
   * Get all loan providers
   */
  getAll: async (cancel = false) => {
    return await axiosInstance.request({
      url: '/loan-providers',
      method: 'GET',
      signal: cancel
        ? cancelApiObject.getAll.handleRequestCancellation().signal
        : undefined,

    });
  },

  /**
   * Get loan provider by ID
   */
  getById: async (id: string, cancel = false) => {
    return await axiosInstance.request({
      url: `/loan-providers/${id}`,
      method: 'GET',
      signal: cancel && cancelApiObject.getById
        ? cancelApiObject.getById.handleRequestCancellation().signal
        : undefined,

    });
  },
};

// Defining the cancel API object for LoanProviderAPI with proper typing
const cancelApiObject = defineCancelApiObject(LoanProviderAPI) as CancelApiObject;
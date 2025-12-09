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
  create: async ( loanProviderData, cancel = false ) => {
    return await axiosInstance.request( {
      url: '/create-loan-provider',
      method: 'POST',
      data: loanProviderData,
      signal: cancel
        ? cancelApiObject[ this.create.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },

  /**
   * Get all loan providers
   */
  getAll: async ( cancel = false ) => {
    return await axiosInstance.request( {
      url: '/get-all-loan-providers',
      method: 'GET',
      signal: cancel
        ? cancelApiObject[ this.getAll.name ].handleRequestCancellation().signal
        : undefined,
    } );
  },
};



// Defining the cancel API object for LoanProviderAPI
const cancelApiObject = defineCancelApiObject( LoanProviderAPI );

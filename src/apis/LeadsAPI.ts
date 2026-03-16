import { axiosInstance } from './config/axiosConfig';

export const LeadsAPI = {
  /**
   * Get all leads from the leads_info table
   */
  getAllLeads: async () => {
    return await axiosInstance.request({
      url: '/leads',
      method: 'GET',
    });
  },
};

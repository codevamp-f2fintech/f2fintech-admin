import { axiosInstance } from "@/apis/config/axiosConfig";

export interface NewApplication {
  applicationId: number;
  applicationNo: number;
  customerName: string;
  applicationDate: string;
  amount: number;
  loanType: string;
  provider: string;
}

export const ApplicationsAPI = {
  /** Get list of new (unpicked) applications for notifications */
  getNewApplications: async (limit: number = 10): Promise<NewApplication[]> => {
    try {
      const response = await axiosInstance.get(`application/new-applications`, {
        params: { limit },
      });
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch new applications:", error);
      return [];
    }
  },
  
  /** Get a single new application for notifications */
  getApplicationById: async (id: number): Promise<NewApplication | null> => {
    try {
      const response = await axiosInstance.get(`application/new-application/${id}`);
      return response.data?.data ?? null;
    } catch (error) {
      console.error(`Failed to fetch application ${id}:`, error);
      return null;
    }
  },
};

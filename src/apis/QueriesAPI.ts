import { axiosInstance } from "./config/axiosConfig";

export const QueriesAPI = {
  getQueries: async () => {
    const response = await axiosInstance.get("/queries");
    return response.data;
  },
};

import { axiosInstance } from "@/apis/config/axiosConfig";

export interface AdminNotification {
  id: number;
  customer_id: number;
  company_id: number;
  message: string;
  type: string;
  status: string;
  created_at: string;
  user_id: number;
  ticket_id: number;
  old_status: string;
  new_status: string;
  title: string;
}

export const NotificationsAPI = {
  getAdminNotifications: async (limit: number = 50): Promise<AdminNotification[]> => {
    const res = await axiosInstance.get(`/get-all-notifications?limit=${limit}`);
    return res.data.data.notifications;
  },

  getNotificationById: async (id: number): Promise<AdminNotification> => {
    const res = await axiosInstance.get(`/get-notification-by-id/${id}`);
    return res.data.data;
  },
};

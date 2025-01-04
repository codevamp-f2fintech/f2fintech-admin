export interface TicketActivitiesData {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  attachment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketActivities {
  statusCode: number;
  message: string;
  data: TicketActivitiesData[];
}

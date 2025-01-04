export interface TicketHistoryData {
  id: number;
  ticket_id: number;
  action?: string | null;
  created_at: string;
}

export interface TicketHistory {
  statusCode: number;
  message: string;
  data: TicketHistoryData[];
}
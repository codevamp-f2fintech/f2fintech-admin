export interface TicketData {
  customer_application_id: number;
  user_id: number;
  forwarded_to: number;
  status: string;
  due_date: Date;
}
export interface Ticket {
  results: TicketData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

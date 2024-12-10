export interface TicketData {
  customer_application_id: number;
  user_id: number;
  forwarded_to: number;
  ticketStatus: string;
  due_date: Date;
  created_at: Date;
}

export interface Ticket {
  results: TicketData[];
  count: number;
  pages: number;
  errorMessage?: string;
}

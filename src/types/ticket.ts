export interface JoinedTicketData {
  customer_application_id: number;
  user_id: number;
  forwarded_to: number;
  is_forwarded: number;
  original_estimate: string;
  voice_note_url: string | null;
  due_date: Date;
  created_at: Date;
  ticketId: number;
  ticketStatus: string;
  applicationAmount: string;
  applicationTenure: number;
  applicationDate: string;
  applicationId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  customerProfileImage: string;
  customerLocation: string;
  loanStatus: string;
}

export interface Ticket {
  results: JoinedTicketData[];
  count: number;
  pages: number;
  errorMessage?: string;
}

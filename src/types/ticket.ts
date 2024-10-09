export interface Ticket {
  customer_application_id: number;
  user_id: number;
  forwarded_to: number;
  status: string;
  due_date: Date;
}

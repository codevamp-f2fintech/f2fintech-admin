export interface TicketLogs {
    ticket_id: number;
    time_spent: string;
    work_description?: string | null;
    created_at: string;
}

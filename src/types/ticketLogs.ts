export interface TicketLogsData {
    id: number;
    ticket_id: number;
    user_id: number;
    time_spent: string;
    work_description?: string | null;
    created_at: string;
}[]

export interface TicketLogs {
    statusCode: number;
    message: string;
    data: TicketLogsData[];
}
export interface TicketVoiceNoteData {
    id: number;
    ticket_id: number;
    user_id: number;
    voice_note_url: string;
    created_at: string;
}

export interface TicketVoiceNote {
    statusCode: number;
    message: string;
    data: TicketVoiceNoteData[];
}

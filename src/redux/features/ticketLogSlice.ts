import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Ticket } from "@/types/ticket";

interface ticketInitialState {
    ticket: Ticket[];
    reduxLoading: boolean;
}

const initialState: ticketInitialState = {
    ticket: [],
    reduxLoading: false,
};

export const ticketSlice = createSlice({
    name: "ticket",
    initialState,
    reducers: {
        setTickets: (state, action: PayloadAction<Ticket[]>) => {
            state.ticket = action.payload;
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        },
    },
});

export const { setTickets, setLoading } = ticketSlice.actions;

// Export the reducer to be used in the store configuration
export default ticketSlice.reducer;

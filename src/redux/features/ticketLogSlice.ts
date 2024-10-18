import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Ticket } from "@/types/ticket";

interface ticketLogInitialState {
    ticketLog: Ticket[];
    reduxLoading: boolean;
}

const initialState: ticketLogInitialState = {
    ticketLog: [],
    reduxLoading: false,
};

export const ticketLogSlice = createSlice({
    name: "ticketLog",
    initialState,
    reducers: {
        setTickets: (state, action: PayloadAction<Ticket[]>) => {
            state.ticketLog = action.payload;
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        },
    },
});

export const { setTickets, setLoading } = ticketLogSlice.actions;

// Export the reducer to be used in the store configuration
export default ticketLogSlice.reducer;

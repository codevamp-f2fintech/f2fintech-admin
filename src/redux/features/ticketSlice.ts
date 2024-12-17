import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Ticket } from "@/types/ticket";

interface ticketInitialState {
  ticket: Ticket | null;
  reduxLoading: boolean;
}

const initialState: ticketInitialState = {
  ticket: null,
  reduxLoading: false,
};

export const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket>) => {
      state.ticket = {
        ...action.payload,
        results: [
          ...(state.ticket?.results || []),
          ...action.payload.results,
        ],
      };
    },
    resetTickets: (state) => {
      state.ticket = { results: [], count: 0, pages: 0 };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { setTickets, resetTickets, setLoading } = ticketSlice.actions;

// Export the reducer to be used in the store configuration
export default ticketSlice.reducer;

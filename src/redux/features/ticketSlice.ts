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

export const ticketSlice = createSlice( {
  name: "ticket",
  initialState,
  reducers: {
    setTickets: ( state, action: PayloadAction<Ticket & { currentPage: number }> ) => {
      const { currentPage, ...ticketData } = action.payload;
      state.ticket = currentPage === 1
        ? ticketData // Overwrite
        : {
          ...ticketData,
          results: [
            ...( state.ticket?.results || [] ),
            ...ticketData.results,
          ],
        };
    },
    resetTickets: ( state ) => {
      state.ticket = { results: [], count: 0, pages: 0 };
    },
    removeTicket: ( state, action: PayloadAction<number> ) => {
      if ( state.ticket )
      {
        state.ticket.results = state.ticket.results.filter(
          ticket => ticket.ticketId !== action.payload
        );
        state.ticket.count -= 1;
      }
    },
    setLoading: ( state, action: PayloadAction<boolean> ) => {
      state.reduxLoading = action.payload;
    },
  },
} );

export const { setTickets, resetTickets, removeTicket, setLoading } = ticketSlice.actions;

// Export the reducer to be used in the store configuration
export default ticketSlice.reducer;

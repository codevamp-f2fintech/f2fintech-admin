import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TicketHistory } from "@/types/tickethistory";

interface TicketHistoryInitialState {
  ticket: TicketHistory[];
  reduxLoading: boolean;
}

const initialState: TicketHistoryInitialState = {
  ticket: [],
  reduxLoading: false,
};

export const ticketHistorySlice = createSlice({
  name: "ticketHistory",
  initialState,
  reducers: {
    setTicketHistory: (state, action: PayloadAction<TicketHistory[]>) => {
      state.ticket = action.payload;
      state.reduxLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { setTicketHistory, setLoading } = ticketHistorySlice.actions;

export default ticketHistorySlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TicketActivities } from "@/types/ticketActivities";

interface TicketActivitiesState {
  ticketActivities: TicketActivities[];  
  reduxLoading: boolean;
}

const initialState: TicketActivitiesState = {
  ticketActivities: [],  
  reduxLoading: true,
};

export const ticketActivitiesSlice = createSlice({
  name: "ticketActivities",
  initialState,
  reducers: {
    appendTicketActivities: (state, action: PayloadAction<TicketActivities[]>) => {
      state.ticketActivities = [...state.ticketActivities, ...action.payload];
      state.reduxLoading = false;
    },
    setTicketActivities: (state, action: PayloadAction<TicketActivities[]>) => {
      state.ticketActivities = action.payload;
      state.reduxLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});


export const { appendTicketActivities, setTicketActivities, setLoading } = ticketActivitiesSlice.actions;


export default ticketActivitiesSlice.reducer;

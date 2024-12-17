import { configureStore } from "@reduxjs/toolkit";

import customerApplicationReducer from "./features/customerApplicationSlice";
import toastReducer from "./features/toastSlice";
import userReducer from "./features/userSlice";
import ticketReducer from "./features/ticketSlice";
import ticketActivitiesReducer from "./features/ticketactivitiesSlice";

export const store = configureStore({
  reducer: {
    customerApplications: customerApplicationReducer,
    tickets: ticketReducer,
    ticketActivities: ticketActivitiesReducer,
    toast: toastReducer,
    user: userReducer,
  },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

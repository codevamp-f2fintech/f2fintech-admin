import { configureStore } from "@reduxjs/toolkit";

import customerApplicationReducer from "./features/customerApplicationSlice";
import ticketReducer from "./features/ticketSlice";
import toastReducer from "./features/toastSlice";
import userReducer from "./features/userSlice";
import loanProviderReducer from "./features/loanProviderSlice";

export const store = configureStore( {
  reducer: {
    customerApplications: customerApplicationReducer,
    loanProviders: loanProviderReducer,
    tickets: ticketReducer,
    toast: toastReducer,
    user: userReducer,
  },
} );

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

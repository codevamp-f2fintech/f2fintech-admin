import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Customer } from "@/types/customer";
interface CustomerState {
  customer: Customer | null;
  reduxLoading: boolean;
}

const initialState: CustomerState = {
  customer: null,
  reduxLoading: false,
};

export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    appendCustomers: (state, action: PayloadAction<Customer>) => {
      if (state.customer) {
        // You could merge properties from `action.payload` into the existing `customer`
        state.customer = {
          ...state.customer,
          ...action.payload,
        };
      } else {
        // If no customer exists, set the payload as the current customer
        state.customer = action.payload;
      }
    },
    setCustomers: (state, action: PayloadAction<Customer>) => {
      state.customer = action.payload;
      state.reduxLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { appendCustomers, setCustomers, setLoading } =
  customerSlice.actions;

export default customerSlice.reducer;

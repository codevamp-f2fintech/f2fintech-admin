import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/types/customer";

interface CustomerState {
  customer: Customer[];
  reduxLoading: boolean;
}

const initialState: CustomerState = {
  customer: [],
  reduxLoading: true,
};

export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    appendCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customer = [...state.customer, ...action.payload];
      state.reduxLoading = false;
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
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

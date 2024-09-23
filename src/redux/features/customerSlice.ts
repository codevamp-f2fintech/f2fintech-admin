import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/types/customer";

// Define your customer state interface
interface CustomerState {
  customer: Customer[];
  reduxLoading: boolean;
}

// Initial state
const initialState: CustomerState = {
  customer: [],
  reduxLoading: true, // Default state for loading
};

// Create the slice
export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // Append customers to the existing state
    appendCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customer = [...state.customer, ...action.payload];
      state.reduxLoading = false;
    },

    // Set customers (replace the state)
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customer = action.payload;
      state.reduxLoading = false;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

// Export the actions and reducer
export const { appendCustomers, setCustomers, setLoading } =
  customerSlice.actions;
export default customerSlice.reducer;

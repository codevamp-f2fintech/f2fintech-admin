import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/types/customer";

interface CustomerState {
  customer: Customer[];
  pickedCustomers: Customer[];
  reduxLoading: boolean;
}

const initialState: CustomerState = {
  customer: [],
  pickedCustomers: [],
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
    pickCustomer: (state, action: PayloadAction<string>) => {
      const customerId = action.payload;
      const customerToPick = state.customer.find(
        (customer) => customer.Id === customerId
      );
      if (customerToPick) {
        state.pickedCustomers = [...state.pickedCustomers, customerToPick];
        state.customer = state.customer.filter(
          (customer) => customer.Id !== customerId
        );
      }
    },

    setPickedCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.pickedCustomers = action.payload;
    },
    clearPickedCustomers: (state) => {
      state.pickedCustomers = [];
    },
  },
});

export const {
  appendCustomers,
  setCustomers,
  setLoading,
  pickCustomer,
  setPickedCustomers, // Make sure this is exported
  clearPickedCustomers,
} = customerSlice.actions;

export default customerSlice.reducer;

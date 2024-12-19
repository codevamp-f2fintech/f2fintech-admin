import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CustomerApplication } from "@/types/customerApplication";

interface CustomerState {
  customerApplication: CustomerApplication | null;
  reduxLoading: boolean;
}

const initialState: CustomerState = {
  customerApplication: null,
  reduxLoading: false,
};

const customerApplicationSlice = createSlice({
  name: "customerApplication",
  initialState,
  reducers: {
    setCustomerApplications: (state, action: PayloadAction<CustomerApplication>) => {
      state.customerApplication = {
        ...action.payload,
        results: [
          ...(state.customerApplication?.results || []),
          ...action.payload.results,
        ],
      };
    },
    resetCustomerApplications: (state, action: PayloadAction<number | undefined>) => {
      const applicationIdToRemove = action.payload;

      if (applicationIdToRemove) {
        if (state.customerApplication?.results) {
          state.customerApplication.results = state.customerApplication.results.filter(
            (app) => app.applicationId !== applicationIdToRemove
          );
          state.customerApplication.count = state.customerApplication.results.length;
        }
      } else {
        // Reset the entire state
        state.customerApplication = { results: [], count: 0, pages: 0 };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { setCustomerApplications, resetCustomerApplications, setLoading } =
  customerApplicationSlice.actions;

export default customerApplicationSlice.reducer;

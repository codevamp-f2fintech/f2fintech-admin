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
    setCustomerApplications: (state, action: PayloadAction<CustomerApplication & { currentPage: number }>) => {
      const { currentPage, ...data } = action.payload;
      state.customerApplication = currentPage === 1
        ? data
        : {
          ...data,
          results: [
            ...(state.customerApplication?.results || []),
            ...data.results,
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
          if (state.customerApplication.count > 0) {
            state.customerApplication.count -= 1;
          }
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

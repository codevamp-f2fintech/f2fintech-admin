import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { LoanProvider } from "@/types/loanProvider";

interface loanProviderInitialState {
    loanProvider: LoanProvider | null;
    reduxLoading: boolean;
}

const initialState: loanProviderInitialState = {
    loanProvider: null,
    reduxLoading: false,
};

export const loanProviderSlice = createSlice( {
    name: "loanProvider",
    initialState,
    reducers: {
        setLoanProviders: ( state, action: PayloadAction<LoanProvider> ) => {
            state.loanProvider = action.payload;
            state.reduxLoading = false;
        },
        setLoading: ( state, action: PayloadAction<boolean> ) => {
            state.reduxLoading = action.payload;
        },
    },
} );

export const { setLoanProviders, setLoading } = loanProviderSlice.actions;

// Export the reducer to be used in the store configuration
export default loanProviderSlice.reducer;

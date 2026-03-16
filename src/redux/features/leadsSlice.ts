import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeadsState {
  leads: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  loading: false,
  error: null,
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action: PayloadAction<any[]>) => {
      state.leads = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLeads, setLoading, setError } = leadsSlice.actions;
export default leadsSlice.reducer;

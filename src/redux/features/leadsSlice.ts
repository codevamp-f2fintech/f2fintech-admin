import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeadsState {
  leads: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: null,
  loading: false,
  error: null,
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action: PayloadAction<any & { currentPage: number }>) => {
      const { currentPage, ...leadsData } = action.payload;
      state.leads = currentPage === 1
        ? leadsData
        : {
          ...leadsData,
          results: [
            ...(state.leads?.results || []),
            ...(leadsData.results || []),
          ],
        };
    },
    resetLeads: (state) => {
      state.leads = { results: [], count: 0, pages: 0 };
    },
    removeLead: (state, action: PayloadAction<number>) => {
      if (state.leads) {
        state.leads.results = state.leads.results.filter(
          (lead: any) => lead.id !== action.payload
        );
        if (state.leads.count) {
          state.leads.count -= 1;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLeads, resetLeads, removeLead, setLoading, setError } = leadsSlice.actions;
export default leadsSlice.reducer;

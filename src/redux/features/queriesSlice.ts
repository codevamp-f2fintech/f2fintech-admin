import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QueriesState {
  queries: any[];
  loading: boolean;
  error: string | null;
}

const initialState: QueriesState = {
  queries: [],
  loading: false,
  error: null,
};

const queriesSlice = createSlice({
  name: "queries",
  initialState,
  reducers: {
    setQueries: (state, action: PayloadAction<any[]>) => {
      state.queries = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setQueries, setLoading, setError } = queriesSlice.actions;
export default queriesSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QueriesState {
  queries: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: QueriesState = {
  queries: null,
  loading: false,
  error: null,
};

const queriesSlice = createSlice({
  name: "queries",
  initialState,
  reducers: {
    setQueries: (state, action: PayloadAction<any & { currentPage: number }>) => {
      const { currentPage, ...queriesData } = action.payload;
      state.queries = currentPage === 1
        ? queriesData
        : {
          ...queriesData,
          results: [
            ...(state.queries?.results || []),
            ...(queriesData.results || []),
          ],
        };
    },
    resetQueries: (state) => {
      state.queries = { results: [], count: 0, pages: 0 };
    },
    removeQuery: (state, action: PayloadAction<number>) => {
      if (state.queries) {
        state.queries.results = state.queries.results.filter(
          (query: any) => query.id !== action.payload
        );
        if (state.queries.count) {
          state.queries.count -= 1;
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

export const { setQueries, resetQueries, removeQuery, setLoading, setError } = queriesSlice.actions;
export default queriesSlice.reducer;

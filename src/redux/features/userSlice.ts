import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { User } from "@/types/user";

interface userInitialState {
  user: User | null;
  reduxLoading: boolean;
}

const initialState: userInitialState = {
  user: null,
  reduxLoading: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User & { currentPage: number }>) => {
      const { currentPage, ...userData } = action.payload;
      state.user = currentPage === 1
        ? userData
        : {
            ...userData,
            results: [
              ...(state.user?.results || []),
              ...(userData.results || []),
            ],
          };
      state.reduxLoading = false;
    },
    resetUsers: (state) => {
      state.user = { results: [], count: 0, pages: 0 };
    },
    removeUser: (state, action: PayloadAction<number | string>) => {
      if (state.user) {
        state.user.results = state.user.results.filter(
          (u: any) => u.id !== action.payload
        );
        state.user.count -= 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.reduxLoading = action.payload;
    },
  },
});

export const { setUsers, resetUsers, removeUser, setLoading } = userSlice.actions;

// Export the reducer to be used in the store configuration
export default userSlice.reducer;

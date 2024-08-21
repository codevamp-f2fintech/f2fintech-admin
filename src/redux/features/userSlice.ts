import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '@/types/user';

interface userInitialState {
    user: User[];
    reduxLoading: boolean;
};

const initialState: userInitialState = {
    user: [],
    reduxLoading: false
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setDemoUsers: (state, action: PayloadAction<User[]>) => {
            state.user = action.payload;
            state.reduxLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.reduxLoading = action.payload;
        }
    },
});

export const { setDemoUsers, setLoading } = userSlice.actions;

// Export the reducer to be used in the store configuration
export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit"


interface User {
    id: string;
    username: string;
    email: string;
    contact: string;
    designation: string;
}

interface userState {
    user: User[];
    loading: boolean;
    error: string | null;
}

const initialState: userState = {
    user: [],
    loading: false,
    error: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        increment: (state) => {
            state.loading = true
        }
    }
})

export const { increment } = userSlice.actions
export default userSlice.reducer

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Toast } from "@/types/toast";

interface toastState {
  toast: Toast;
}
const initialState: toastState = {
  toast: { toastAlert: false, toastSeverity: "", toastMessage: "" },
};
export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (state, action: PayloadAction<Toast>) => {
      state.toast = action.payload;
    },
  },
});
export const { setToast } = toastSlice.actions;
export default toastSlice.reducer;

import { AlertColor } from "@mui/material/Alert";

export interface Toast {
  toastAlert: boolean;
  toastSeverity: AlertColor;
  toastMessage: string;
}

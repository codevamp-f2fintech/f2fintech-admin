// src/app/theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: "#red",
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    h1: {
      fontSize: "2rem",
    },
    h2: {
      fontSize: "1.5rem",
    },
  },
});

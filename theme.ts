"use client";

import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material";

// color design tokens
export const tokens = (mode) => ({
  primary: {
    main: "#3949ab", // Deep Indigo / Royal Blue matching SaaS reference
    light: "#eef2ff",
    dark: "#303f9f",
    contrastText: "#ffffff",
  },
  neutral: {
    100: "#f4f5f7",
    200: "#ebecf0",
    300: "#dfe1e6",
    400: "#c1c7d0",
    500: "#7a869a",
    600: "#5e6c84",
    700: "#42526e",
    800: "#253858",
    900: "#091e42",
  },
});

//mui Theme Settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode,
      primary: colors.primary,
      background: {
        default: "#f4f7fe",
        paper: "#ffffff",
      },
      text: {
        primary: colors.neutral[900],
        secondary: colors.neutral[700],
      },
      divider: "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      fontFamily: "'Inter', 'Verdana', sans-serif",
      allVariants: {
        textTransform: "none",
      },
      fontSize: 12,
      h1: { fontSize: "2.5rem", fontWeight: 700 },
      h2: { fontSize: "2rem", fontWeight: 700 },
      h3: { fontSize: "1.5rem", fontWeight: 600 },
      h4: { fontSize: "1.25rem", fontWeight: 600 },
      h5: { fontSize: "1rem", fontWeight: 600 },
      h6: { fontSize: "0.875rem", fontWeight: 600 },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            boxShadow: "none",
            padding: "8px 20px",
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            },
          },
          containedPrimary: {
            backgroundColor: "#3949ab",
            "&:hover": {
              backgroundColor: "#303f9f",
              boxShadow: "0px 4px 12px rgba(57, 73, 171, 0.25)",
            },
          },
          outlined: {
            borderColor: colors.neutral[300],
            color: colors.neutral[700],
            "&:hover": {
              backgroundColor: "rgba(9, 30, 66, 0.04)",
              borderColor: colors.neutral[400],
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(0,0,0,0.05)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: "#dfe1e6",
              },
              "&:hover fieldset": {
                borderColor: "#c1c7d0",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#3949ab",
                borderWidth: "2px",
              },
            },
            "& .MuiInputBase-input": {
              padding: "12px 14px",
              fontSize: "0.9rem",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            padding: "12px 14px",
            borderRadius: "8px",
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              padding: "4px 8px !important",
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "rgba(0,0,0,0.06)",
          },
        },
      },
    },
  };
};

//Context for Color Mode
export const ColorModeContext = createContext({
  toggleColorMode: () => { },
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};

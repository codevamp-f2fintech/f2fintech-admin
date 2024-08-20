import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material";

// color design tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        footerGradient:
          "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(6,55,158,1) 100%)",
        textHighlighter: " rgba(6,55,158,1)",
        textWhite: "#ffffff",
        textBlack: "#000000",
      }
    : {
        footerGradient:
          "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(6,55,158,1) 100%)",
        textHighlighter: " rgba(6,55,158,1)",
        textWhite: "#ffffff",
        textBlack: "#000000",
      }),
});

//mui Theme Settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    typography: {
      allVariants: {
        fontFamily: "'Verdana', sans-serif",
        textTransform: "none",
      },
      fontSize: 12,
      h1: {
        lineHeight: "4rem",
        fontSize: "3rem",
        fontWeight: "550",
      },
      h2: {
        fontSize: 32,
        fontWeight: "550",
        lineHeight: "4rem",
      },
      h3: {
        fontWeight: "400",
        fontSize: "1.1rem",
        lineHeight: "3rem",
      },
      h4: {
        fontSize: 20,
      },
      h5: {
        fontSize: 16,
      },
      h6: {
        fontSize: 14,
      },
    },
  };
};

//Context for Color Mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
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

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#D32F2F",
    },
    background: {
      default: "#fff",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            padding: "5px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
          },
          "& .MuiInputBase-input": {
            padding: "10px",
          },
          "& .Mui-focused fieldset": {
            borderColor: "#1976d2",
          },
        },
      },
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
      fontSize: "22px",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});

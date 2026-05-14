"use client";

import React from "react";
import { Box, GlobalStyles, CssBaseline, ThemeProvider, Container } from "@mui/material";
import { useMode, ColorModeContext } from "../../theme";
import { SideNav } from "./components/dashboard/layout/side-nav";
import { AppBarNav } from "./components/dashboard/layout/appbar-nav";

export const RootLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode as any}>
      <ThemeProvider theme={theme as any}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              "--MainNav-height": "64px",
              "--MainNav-zIndex": 1000,
              "--SideNav-width": "15vw",
              "--SideNav-zIndex": 1100,
              "--MobileNav-width": "1000px",
              "--MobileNav-zIndex": 1100,
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            position: "relative",
            minHeight: "100vh",
            background: "#f4f7fe",
          }}
        >
          <SideNav />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <AppBarNav />
            <Box
              sx={{
                display: "flex",
                flex: "1 1 auto",
                flexDirection: "column",
              }}
            >
              <main>
                <Container
                  maxWidth={false}
                  sx={{
                    py: { xs: 2, sm: 4 },
                    px: { xs: 1, sm: 2, md: 3 },
                    maxWidth: "1700px",
                  }}
                >
                  {children}
                </Container>
              </main>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

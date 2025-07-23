import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Container, Box, GlobalStyles, CssBaseline } from "@mui/material";

import ReduxProvider from "@/redux/provider";
import { SideNav } from "./components/dashboard/layout/side-nav";
import { AppBarNav } from "./components/dashboard/layout/appbar-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "F2-Fintech Admin Panel",
  description: "Resolving tickets of customers",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <>
            <CssBaseline />

            <GlobalStyles
              styles={{
                body: {
                  "--MainNav-height": "56px",
                  "--MainNav-zIndex": 1000,
                  "--SideNav-width": "15vw",
                  "--SideNav-zIndex": 1100,
                  "--MobileNav-width": "320px",
                  "--MobileNav-zIndex": 1100,
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                minHeight: "100%",
                padding: "0 !important",
                background: "linear-gradient( #deebff, #deebff)",
              }}
            >
              <SideNav />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: "1",
                }}
              >
                <AppBarNav />
                <Box
                  sx={{
                    display: "flex",
                    flex: "1 1 auto",
                    flexDirection: "column",
                    // pl: { lg: "var(--SideNav-width)" },
                  }}
                >
                  <main>
                    <Container sx={{ py: "5vh" }}>{children}</Container>
                  </main>
                </Box>
              </Box>
            </Box>
          </>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;

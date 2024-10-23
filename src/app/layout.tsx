import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ReduxProvider from "@/redux/provider";
import { Container, Box, GlobalStyles, CssBaseline } from "@mui/material";
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
                background:
                  "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
              }}
            >
              <SideNav />

              <Box
                sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}
              >
                <AppBarNav />
                <Box
                  sx={{
                    display: "flex",
                    flex: "1 1 auto",
                    flexDirection: "column",
                    // pl: { lg: "var(--SideNav-width)" },
                    background:
                      "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
                  }}
                >
                  {/* <MainNav /> */}
                  <main>
                    <Container maxWidth="xl" sx={{ py: "5vh" }}>
                      {children}
                    </Container>
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

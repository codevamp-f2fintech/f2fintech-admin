import * as React from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { SideNav } from "@/app/components/dashboard/layout/side-nav";
import { AppBarNav } from "@/app/components/dashboard/layout/appbar-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
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

        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
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
  );
}

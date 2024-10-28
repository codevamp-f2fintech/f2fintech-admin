"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Menu, MenuItem } from "@mui/material";
import { usePathname } from "next/navigation";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { MobileNav } from "./mobile-nav";
import { Utility } from "@/utils";

export function AppBarNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  const { decodedToken } = Utility();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleLogout = () => {
    try {
      document.cookie = "token=; path=/; max-age=0; secure; samesite=strict";
      handleMenuClose();
      router.push("/login");
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  // Hide AppBarNav on login page
  if (pathname === "/login") return <></>;

  return (
    <React.Fragment>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid var(--mui-palette-divider)",
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
          top: 0,
          zIndex: "6",
          height: "12vh",
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              <IconButton
                onClick={(): void => {
                  setOpenNav(true);
                }}
                sx={{ display: { lg: "none" } }}
              >
                <ListIcon />
              </IconButton>
            </Stack>
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              <Tooltip title="Notifications">
                <Badge badgeContent={4} color="success" variant="dot">
                  <IconButton>
                    <BellIcon />
                  </IconButton>
                </Badge>
              </Tooltip>
              <IconButton onClick={handleMenuClick}>
                <Avatar>
                  {decodedToken()?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                id="avatar-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout} sx={{ cursor: "pointer" }}>
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}

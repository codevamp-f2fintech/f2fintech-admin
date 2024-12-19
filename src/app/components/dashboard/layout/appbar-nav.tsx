"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from './user-popover';
import { Utility } from "@/utils";
import { usePopover } from "@/hooks/use-popover";

export function AppBarNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const pathname = usePathname();
  const userPopover = usePopover<HTMLDivElement>();

  const { decodedToken } = Utility();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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

              <Avatar
                onClick={userPopover.handleOpen}
                ref={userPopover.anchorRef}
                sx={{ cursor: 'pointer' }}
              >
                {decodedToken()?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}

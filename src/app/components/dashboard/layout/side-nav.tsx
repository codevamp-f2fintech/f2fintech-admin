"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/utils/is-nav-item-active";
import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { Utility } from "@/utils";
import { Logo } from "../../core/logo";

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false); // Collapse state
  const { decodedToken } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1100px)");

  const userRole = decodedToken()?.role;

  // Toggle collapse state
  const handleToggleCollapse = () => setCollapsed((prev) => !prev);

  // Hide SideNav if on login page
  if (pathname === "/login") {
    return <></>;
  }

  return (
    <Box
      sx={{
        "--SideNav-background": "var(--mui-palette-neutral-950)",
        "--SideNav-color": "green",
        "--NavItem-color": "green",
        "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
        "--NavItem-active-background": "var(--mui-palette-primary-main)",
        "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
        "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
        "--NavItem-icon-active-color":
          "var(--mui-palette-primary-contrastText)",
        "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
        backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 20.7%, rgba(89,97,223,1) 68.7%)
    `,
        backgroundBlendMode: "multiply, screen, normal",
        color: "var(--SideNav-color)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "100vh",
        left: 0,
        position: "sticky",
        scrollbarWidth: "none",
        top: 0,
        width: collapsed ? "5vw" : "15vw",
        zIndex: "var(--SideNav-zIndex)",
        transition: "width 0.3s",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Stack spacing={1} sx={{ p: "1rem" }}>
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            width: "2rem",
            height: "2rem",
            color: "white",
            alignSelf: collapsed ? "center" : "end",
            top: "0",
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          component={RouterLink}
          href="/"
          sx={{
            display: "inline-flex",
          }}
        >
          <Logo collapsed={collapsed} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "lightgray" }} />
      <Box component="nav">
        {renderNavItems({ pathname, items: navItems, collapsed, userRole })}
      </Box>
      <Divider sx={{ borderColor: "lightgray" }} />
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
  collapsed,
  userRole,
}: {
  items?: NavItemConfig[];
  pathname: string;
  collapsed: boolean;
  userRole: string;
}): React.JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, ...item } = curr;
      if (item.title === "Users" && userRole !== "admin") {
        return acc;
      }

      // If the user is an operations or credit, hide the "Loan Provider" link
      if ( item.title === "Loan Provider" && userRole !== "admin" )
      {
        return acc;
      }
      if ( item.title === "Archived Tickets" && userRole !== "admin" )
      {
        return acc;
        }

      acc.push(
        <NavItem
          key={key}
          pathname={pathname}
          collapsed={collapsed}
          {...item}
        />
      );

      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", mt: 5, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  collapsed: boolean;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  collapsed,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? "a" : RouterLink,
              href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: "0px 20px 20px 0px",
          color: "white",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          flex: "0 0 auto",
          gap: 1,
          padding: "1rem 0rem 1rem .5rem",
          position: "relative",
          textDecoration: "none",
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
          backgroundBlendMode: "multiply, screen, normal",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundImage: `
      linear-gradient(64.5deg, rgba(255,138,185,1) 14.7%, rgba(89,150,223,1) 88.7%)
    `,
            transform: "scale(1)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
            height: "5vh",
            width: "3vw",
            borderRadius: "50px",
            boxShadow:
              "rgba(0, 0, 0, 0) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
            "&:hover": {
              transform: "scale(1.1)",
              background:
                "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
            },
          }}
        >
          {Icon ? (
            <Tooltip title={title} arrow>
              <Icon
                fill={
                  active
                    ? "var(--NavItem-icon-active-color)"
                    : "var(--NavItem-icon-color)"
                }
                fontSize="1.4rem"
              />
            </Tooltip>
          ) : null}
        </Box>
        <Collapse in={!collapsed} orientation="horizontal">
          <Box
            component="span"
            sx={{
              color: active ? "white" : "white",
              fontFamily: "monospace",
              fontSize: "1rem",
              fontWeight: "600",
              lineHeight: 2.5,
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Box>
        </Collapse>
      </Box>
    </li>
  );
}

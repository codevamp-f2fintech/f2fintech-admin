"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Tooltip from "@mui/material/Tooltip";

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
        backgroundImage: "linear-gradient(135deg, #fff 0%, #fff 100%)",
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
            color: "black",
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
      if (item.title === "Loan Provider" && userRole !== "admin") {
        return acc;
      }
      if ( item.title === "Archived" && userRole !== "admin" )
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
          color: "red !important",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          flex: "0 0 auto",
          gap: 1,
          width: "92% !important",
          padding: "2px 0px 2px 1px",
          position: "relative",
          // mr: "3px",
          textDecoration: "none",
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundImage: `
   linear-gradient(#deebff, #deebff)
    `,
          backgroundBlendMode: "multiply, screen, normal",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundImage: `
      linear-gradient(#c8d4e6, #c8d4e6)
    `,
            transform: "scale(1)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
            height: "5vh",
            width: "3vw",
            borderRadius: "50px",
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
              color: active ? "#0c66e4" : "black",
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

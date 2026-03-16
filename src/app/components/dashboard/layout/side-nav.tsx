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
  const [collapsed, setCollapsed] = React.useState(true);
  const { decodedToken } = Utility();

  const userRole = decodedToken()?.role;

  const handleToggleCollapse = () => setCollapsed((prev) => !prev);

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
        "--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
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
        // iPad Pro 12.9" (1024 x 1366)
        "@media only screen and (min-width: 1300px) and (max-width: 1366px) and (orientation: landscape)": {
          width: collapsed ? "100px" : "220px",
        },
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
  // Filter nav items based on user role
  const filteredItems = items.filter((item) => {
    // SUPERADMIN can only see Company and User
    if (userRole === "super admin") {
      return item.title === "Company" || item.title === "Users" || item.title === "SuperAdminDashboard";
    }

    // ADMIN should NOT see Company and Admin User, but SHOULD see Users
    if (userRole === "admin") {
      if (item.title === "Company" || item.title === "Admin User") {
        return false;
      }
      // Admin SHOULD see Users, Loan Provider, Archived
      return true;
    }

    // For non-admin roles (operations, credit, etc.)
    if (item.title === "Users" && userRole !== "admin") {
      return false;
    }
    if (item.title === "Company" && userRole !== "admin") {
      return false;
    }

    if (item.title === "Loan Provider" && userRole !== "admin") {
      return false;
    }

    if (item.title === "Archived" && userRole !== "admin") {
      return false;
    }

    if ((item.title === "Leads" || item.title === "Query") && userRole !== "admin") {
      return false;
    }

    return true;
  });

  const children = filteredItems.map((item) => (
    <NavItem
      key={item.key}
      pathname={pathname}
      collapsed={collapsed}
      {...item}
    />
  ));

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", mt: 5, p: 0 }}>
      {children}
    </Stack>
  );
}

// NavItem component remains the same as before
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
          textDecoration: "none !important",
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
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundImage: `linear-gradient(#deebff, #deebff)`,
          backgroundBlendMode: "multiply, screen, normal",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundImage: `linear-gradient(#c8d4e6, #c8d4e6)`,
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
            // iPad Pro 12.9" (1024 x 1366)
            "@media only screen and (min-width: 1300px) and (max-width: 1366px) and (orientation: landscape)": {
              borderRadius: "20px",
              width: "60px",
            },
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
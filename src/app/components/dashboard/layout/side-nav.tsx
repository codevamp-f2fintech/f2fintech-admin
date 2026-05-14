"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/utils/is-nav-item-active";
import { navItems } from "./config";
import { navIcons } from "./nav-icons";
import { Utility } from "@/utils";
import { Logo } from "../../core/logo";

// ─── Sidebar background matches the navbar (#c4d5eb) ───────────────────────
const SIDEBAR_BG = "#c4d5eb";
const SIDEBAR_ACTIVE_BG = "rgba(12, 102, 228, 0.15)";
const SIDEBAR_HOVER_BG = "rgba(12, 102, 228, 0.08)";
const SIDEBAR_ACTIVE_COLOR = "#0c3d8a";
const SIDEBAR_ICON_COLOR = "#1e3a5f";
const SIDEBAR_ICON_ACTIVE_COLOR = "#0c3d8a";

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(true);
  const { decodedToken } = Utility();

  const userRole = decodedToken()?.role;

  const handleToggleCollapse = () => setCollapsed((prev) => !prev);

  const handleSignOut = React.useCallback(() => {
    document.cookie = "oms_cookie=; path=/; max-age=0; secure; samesite=strict";
    document.cookie = "userId=; path=/; max-age=0; secure; samesite=strict";
    document.cookie = "userRole=; path=/; max-age=0; secure; samesite=strict";
    document.cookie = "companyId=; path=/; max-age=0; secure; samesite=strict";
    document.cookie = "companyName=; path=/; max-age=0; secure; samesite=strict";
    localStorage.removeItem("oms_cookie");
    localStorage.removeItem("userId");
    localStorage.removeItem("companyId");
    localStorage.removeItem("selectedCompanyId");
    localStorage.removeItem("companyName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    location.reload();
  }, []);

  if (pathname === "/login") {
    return <></>;
  }

  return (
    <Box
      sx={{
        "--SideNav-background": SIDEBAR_BG,
        "--SideNav-color": "#1e3a5f",
        "--NavItem-color": SIDEBAR_ICON_COLOR,
        "--NavItem-hover-background": SIDEBAR_HOVER_BG,
        "--NavItem-active-background": SIDEBAR_ACTIVE_BG,
        "--NavItem-active-color": SIDEBAR_ACTIVE_COLOR,
        "--NavItem-disabled-color": "rgba(30,58,95,0.3)",
        "--NavItem-icon-color": SIDEBAR_ICON_COLOR,
        "--NavItem-icon-active-color": SIDEBAR_ICON_ACTIVE_COLOR,
        "--NavItem-icon-disabled-color": "rgba(30,58,95,0.3)",
        bgcolor: "var(--SideNav-background)",
        borderRight: "1px solid rgba(12,66,160,0.12)",
        boxShadow: "2px 0 8px rgba(12,66,160,0.08)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "100vh",
        left: 0,
        position: "sticky",
        scrollbarWidth: "none",
        top: 0,
        width: collapsed ? "5vw" : "15vw",
        zIndex: "var(--SideNav-zIndex)",
        transition: "width 0.3s ease",
        "@media only screen and (min-width: 1300px) and (max-width: 1366px) and (orientation: landscape)": {
          width: collapsed ? "100px" : "220px",
        },
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* ── Logo + hamburger ─────────────────────────────── */}
      <Stack spacing={1} sx={{ p: "0.75rem" }}>
        <IconButton
          onClick={handleToggleCollapse}
          sx={{
            width: "2rem",
            height: "2rem",
            color: "#1e3a5f",
            alignSelf: collapsed ? "center" : "end",
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box component={RouterLink} href="/" sx={{ display: "inline-flex" }}>
          <Logo collapsed={collapsed} />
        </Box>
      </Stack>

      <Divider sx={{ borderColor: "rgba(12,66,160,0.15)" }} />

      {/* ── Nav items ─────────────────────────────────────── */}
      <Box component="nav" sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
        {renderNavItems({ pathname, items: navItems, collapsed, userRole })}
      </Box>

      <Divider sx={{ borderColor: "rgba(12,66,160,0.15)" }} />

      {/* ── Sign Out — pinned at bottom ───────────────────── */}
      <Box sx={{ p: "0.75rem" }}>
        <Tooltip title="Sign out" arrow placement="right">
          <Box
            onClick={handleSignOut}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: "8px",
              cursor: "pointer",
              color: "#b71c1c",
              transition: "all 0.2s ease",
              justifyContent: collapsed ? "center" : "flex-start",
              "&:hover": {
                bgcolor: "rgba(183,28,28,0.08)",
                transform: "translateX(2px)",
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: "1.3rem", color: "inherit" }} />
            <Collapse in={!collapsed} orientation="horizontal">
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  color: "inherit",
                }}
              >
                Sign out
              </Typography>
            </Collapse>
          </Box>
        </Tooltip>
      </Box>
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
  const filteredItems = items.filter((item) => {
    if (userRole === "super admin") {
      return item.title === "Company" || item.title === "Users" || item.title === "SuperAdminDashboard";
    }
    if (userRole === "admin") {
      if (item.title === "Company" || item.title === "Admin User") return false;
      return true;
    }
    if (item.title === "Users" && userRole !== "admin") return false;
    if (item.title === "Company" && userRole !== "admin") return false;
    if (item.title === "Loan Provider" && userRole !== "admin") return false;
    if (item.title === "Archived" && userRole !== "admin") return false;
    if ((item.title === "Leads" || item.title === "Query") && userRole !== "admin" && userRole !== "sub admin") return false;
    return true;
  });

  const children = filteredItems.map((item) => {
    const { key, ...rest } = item;
    return <NavItem key={key} pathname={pathname} collapsed={collapsed} {...rest} />;
  });

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

function NavItem({ disabled, external, href, icon, matcher, pathname, title, collapsed }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
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
          borderRadius: "0px 24px 24px 0px",
          color: active ? "var(--NavItem-active-color) !important" : "var(--NavItem-color) !important",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          flex: "0 0 auto",
          gap: 1.5,
          width: "92% !important",
          padding: "8px 16px",
          position: "relative",
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundColor: active ? "var(--NavItem-active-background)" : "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: active ? "var(--NavItem-active-background)" : "var(--NavItem-hover-background)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: active ? "rgba(255,255,255,0.6)" : "transparent",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
            height: "32px",
            width: "32px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {Icon ? (
            <Tooltip title={collapsed ? title : ""} arrow placement="right">
              <Icon
                fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
                fontSize="1.4rem"
              />
            </Tooltip>
          ) : null}
        </Box>
        <Collapse in={!collapsed} orientation="horizontal">
          <Box
            component="span"
            sx={{
              color: "inherit",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.95rem",
              fontWeight: active ? "700" : "500",
              lineHeight: 1.5,
              textTransform: "none",
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
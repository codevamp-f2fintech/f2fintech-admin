"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/utils/is-nav-item-active";
import { Logo } from "@/app/components/core/logo";

import { navItems } from "./config";

import { navIcons } from "./nav-icons";
import { useMediaQuery } from "@mui/material";
import { Utility } from "@/utils";

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({
  open,
  onClose,
}: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const { decodedToken } = Utility();
  const userRole = decodedToken()?.role;

  return (
    <Drawer
      PaperProps={{
        sx: {
          "--MobileNav-background": "var(--mui-palette-neutral-950)",
          "--MobileNav-color": "var(--mui-palette-common-white)",
          "--NavItem-color": "var(--mui-palette-neutral-300)",
          "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
          "--NavItem-active-background": "var(--mui-palette-primary-main)",
          "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
          "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
          "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
          "--NavItem-icon-active-color":
            "var(--mui-palette-primary-contrastText)",
          "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
          bgcolor: "var(--MobileNav-background)",
          color: "var(--MobileNav-color)",
          display: "flex",
          backgroundImage: "linear-gradient(135deg, #fff 0%, #fff 100%)",
          backgroundBlendMode: "multiply, screen, normal",
          flexDirection: "column",
          maxWidth: "100%",
          scrollbarWidth: "none",
          width: isMobile ? "45vw" : isTab ? "30vw" : "",
          zIndex: "var(--MobileNav-zIndex)",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href="/"
          sx={{
            display: isMobile ? "flex" : isTab ? "flex" : "",
            alignItems: isMobile ? "center" : "",
            justifyContent: isMobile ? "center" : "",
            width: isMobile ? "auto" : isTab ? "15vw" : "",
          }}
        >
          <Logo color="light" height={32} width={122} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      <Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
        {renderNavItems({ pathname, items: navItems, userRole })}
      </Box>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
    </Drawer>
  );
}

function renderNavItems({
  items = [],
  pathname,
  userRole,
}: {
  items?: NavItemConfig[];
  pathname: string;
  userRole: string;
}): React.JSX.Element {
  const children = items.reduce<React.ReactNode[]>((acc, curr) => {
    const { key, ...item } = curr;

    // Conditionally exclude "Users" for non-admin roles
    if (item.title === "Users" && userRole !== "admin") {
      return acc; // Skip if not admin
    }

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);
    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
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
          borderRadius: 1,
          color: "black",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          backgroundImage: `
          linear-gradient(#deebff, #deebff)
           `,
          backgroundBlendMode: "multiply, screen, normal",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundImage: `
             linear-gradient #c4d5eb, #c4d5eb)
           `,
            transform: "scale(1)", // Slightly scale up the element on hover
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Add shadow on hover
          },
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          {Icon ? (
            <Icon
              fill={
                active
                  ? "var(--NavItem-icon-active-color)"
                  : "var(--NavItem-icon-color)"
              }
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{
              color: "black",
              fontSize: "1rem",
              fontWeight: 500,
              lineHeight: "1.2rem",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}

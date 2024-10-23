import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
  {
    key: "overview",
    title: "Overview",
    href: paths.dashboard.overview,
    icon: "chart-pie",
  },
  {
    key: "users",
    title: "Users",
    href: paths.dashboard.customers,
    icon: "users",
  },
] satisfies NavItemConfig[];

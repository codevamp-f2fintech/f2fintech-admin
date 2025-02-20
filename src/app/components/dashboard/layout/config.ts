import type { NavItemConfig } from "@/types/nav";

export const navItems = [
  {
    key: "overview",
    title: "Overview",
    href: "/dashboard",
    icon: "chart-pie",
  },
  {
    key: "users",
    title: "Users",
    href: "/users",
    icon: "users",
  },
  {
    key: "loanProvider",
    title: "Loan Provider",
    href: "/loan-provider",
    icon: "users",
  }
] satisfies NavItemConfig[];

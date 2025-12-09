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
    icon: "bank",
  },
  {
    key: "archived",
    title: "Archived",
    href: "/tickets-archive",
    icon: "file-archive",
  },
  {
    key: 'company',
    title: 'Company',
    href: '/company',
    icon: 'business'
  },
] satisfies NavItemConfig[];

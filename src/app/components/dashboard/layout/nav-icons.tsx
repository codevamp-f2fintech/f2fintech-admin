import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { Bank as BankIcon } from "@phosphor-icons/react/dist/ssr/Bank";
import { FileArchive as FileArchiveIcon } from "@phosphor-icons/react/dist/ssr/FileArchive";
import { ChartPie as ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { PlugsConnected as PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";
import { Buildings as BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings";

export const navIcons = {
  "bank": BankIcon,
  "file-archive": FileArchiveIcon,
  "chart-pie": ChartPieIcon,
  "gear-six": GearSixIcon,
  "plugs-connected": PlugsConnectedIcon,
  "x-square": XSquare,
  "business": BuildingsIcon,
  "people": UsersIcon,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;

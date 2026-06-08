"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { X as CloseIcon } from "@phosphor-icons/react/dist/ssr/X";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";
import { Utility } from "@/utils";
import { usePopover } from "@/hooks/use-popover";
import { CompanyAPI } from "@/apis/CompanyAPI";
import { ApplicationsAPI, NewApplication } from "@/apis/ApplicationsAPI";
import { NotificationsAPI, AdminNotification } from "@/apis/NotificationsAPI";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SEEN_APPLICATIONS_KEY = "seenApplicationIds";

function getSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_APPLICATIONS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_APPLICATIONS_KEY, JSON.stringify(Array.from(ids)));
}
export type UnifiedNotification =
  | { type: 'application'; data: NewApplication; id: string; date: number }
  | { type: 'ticket'; data: AdminNotification; id: string; date: number };

export function AppBarNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [notifAnchorEl, setNotifAnchorEl] = useState<HTMLButtonElement | null>(null);
  const notifOpenRef = useRef(false);
  const [page, setPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedCompanyId");
      if (saved) setSelectedCompany(saved);
      setSeenIds(getSeenIds());
    }
  }, []);

  const pathname = usePathname();
  const userPopover = usePopover<HTMLDivElement>();

  const { decodedToken } = Utility();
  const userInfo = decodedToken();
  const role = userInfo?.role;
  const isSales = role === "sales";

  // Disable the Aggregator selector on ticket detail pages or create page
  const isTicketPage = /^\/ticket\/[^/]+/.test(pathname ?? "");
  const isCreatePage = pathname === "/home/create";
  const disableAggregator = isTicketPage || isCreatePage;

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await CompanyAPI.getAll({ page: 1, limit: 100 });
      setCompanies(res.data.results || []);
    } catch (error) {
      console.error("Failed to load companies", error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Fetch unified notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [apps, tickets] = await Promise.all([
        ApplicationsAPI.getNewApplications(50),
        NotificationsAPI.getAdminNotifications(50)
      ]);

      const unified: UnifiedNotification[] = [
        ...(Array.isArray(apps) ? apps : []).map(app => ({
          type: 'application' as const,
          data: app,
          id: `app_${app.applicationId}`,
          date: new Date(app.applicationDate).getTime()
        })),
        ...(Array.isArray(tickets) ? tickets : []).map(ticket => ({
          type: 'ticket' as const,
          data: ticket,
          id: `ticket_${ticket.id}`,
          date: new Date(ticket.created_at).getTime()
        }))
      ];

      console.log('Fetched Apps:', apps);
      console.log('Fetched Tickets:', tickets);
      console.log('Unified Notifications:', unified);

      // Sort by date descending
      unified.sort((a, b) => {
        const dateA = isNaN(a.date) ? 0 : a.date;
        const dateB = isNaN(b.date) ? 0 : b.date;
        return dateB - dateA;
      });
      setNotifications(unified);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  useEffect(() => {
    if (isSales) return;

    fetchNotifications();

    // Connect to the Express server (port 8080) where applications are created
    const webUrl =
      process.env.NEXT_PUBLIC_WEB_URL?.replace("/api/v1", "") || "http://localhost:8080";
    const socket = io(webUrl);

    socket.on("connect", () => {
      console.log("Connected to WebSocket notifications server on port 8080");
    });

    socket.on("new-application", async (payload: { applicationId: number }) => {
      if (!payload || !payload.applicationId) return;
      try {
        const newApp = await ApplicationsAPI.getApplicationById(payload.applicationId);
        if (newApp) {
          setNotifications((prev) => {
            const newNotif: UnifiedNotification = {
              type: 'application',
              data: newApp,
              id: `app_${newApp.applicationId}`,
              date: new Date(newApp.applicationDate).getTime()
            };
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev].sort((a, b) => b.date - a.date);
          });
          setPage(1);
        }
      } catch (error) {
        console.error("Error fetching new application for socket event:", error);
      }
    });

    socket.on("ticket-status-changed", async (payload: { notificationId: number, ticketId: number }) => {
      if (!payload || !payload.notificationId) return;
      try {
        const ticketNotif = await NotificationsAPI.getNotificationById(payload.notificationId);
        if (ticketNotif) {
          setNotifications((prev) => {
            const newNotif: UnifiedNotification = {
              type: 'ticket',
              data: ticketNotif,
              id: `ticket_${ticketNotif.id}`,
              date: new Date(ticketNotif.created_at).getTime()
            };
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev].sort((a, b) => b.date - a.date);
          });
          setPage(1);
        }
      } catch (error) {
        console.error("Error fetching ticket notification for socket event:", error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications, isSales]);


  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;
  
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(notifications.length / ITEMS_PER_PAGE));
  const paginatedNotifications = notifications.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleNotifOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotifAnchorEl(event.currentTarget);
    notifOpenRef.current = true;
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    notifOpenRef.current = false;
  };

  const handleMarkAllRead = () => {
    const updated = new Set(seenIds);
    notifications.forEach((n) => updated.add(n.id));
    setSeenIds(updated);
    saveSeenIds(updated);
  };

  const handleCompanyChange = (e: SelectChangeEvent) => {
    const value = e.target.value as string;
    setSelectedCompany(value);
    if (!value) {
      localStorage.removeItem("selectedCompanyId");
    } else {
      localStorage.setItem("selectedCompanyId", value);
    }
    window.dispatchEvent(new CustomEvent("companyChanged", { detail: value }));
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", { 
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  if (pathname === "/login") return <></>;

  const notifOpen = Boolean(notifAnchorEl);
  const notifId = notifOpen ? "notification-popover" : undefined;

  return (
    <React.Fragment>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid var(--mui-palette-divider)",
          backgroundImage: "linear-gradient(#c4d5eb, #c4d5eb)",
          top: 0,
          zIndex: "6",
          height: "60px",
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important", height: "56px", alignItems: "center" }}>
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
              {/* Company Selector */}
              <Tooltip
                title={disableAggregator ? "Aggregator cannot be changed here" : "Change Aggregator"}
                placement="bottom"
                arrow
              >
                <FormControl
                  sx={{
                    minWidth: 220,
                    display: { xs: "none", sm: "block" },
                    opacity: disableAggregator ? 0.55 : 1,
                    transition: "opacity 0.2s",
                  }}
                  size="small"
                >
                  <InputLabel id="company-select-label" shrink>
                    Aggregator
                  </InputLabel>
                  <Select
                    labelId="company-select-label"
                    id="company-select"
                    value={selectedCompany}
                    label="Aggregator"
                    onChange={handleCompanyChange}
                    disabled={disableAggregator}
                    displayEmpty
                    notched
                    fullWidth
                    sx={{
                      height: "40px",
                      backgroundColor: "white",
                      "& .MuiSelect-select": {
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        paddingTop: 0,
                        paddingBottom: 0,
                        boxSizing: "border-box",
                      },
                    }}
                  >
                    <MenuItem value="">All Aggregators</MenuItem>
                    {companies?.map((company: any, index: number) => (
                      <MenuItem
                        key={company.id || `company-${index}`}
                        value={company.companyId ? company.companyId.toString() : ""}
                      >
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>

              {/* Notification Bell */}
              {!isSales && (
                <Tooltip title="Notifications" arrow placement="bottom">
                  <IconButton
                    aria-describedby={notifId}
                    onClick={handleNotifOpen}
                    sx={{ height: 40, width: 40, position: "relative" }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      max={99}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          minWidth: "14px",
                          height: "14px",
                          padding: "0 4px",
                          animation: unreadCount > 0 ? "pulse 1.5s ease-in-out infinite" : "none",
                          "@keyframes pulse": {
                            "0%": { transform: "scale(1)" },
                            "50%": { transform: "scale(1.2)" },
                            "100%": { transform: "scale(1)" },
                          },
                        },
                      }}
                    >
                      <BellIcon size={28} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* Notification Popover */}
              {!isSales && (
                <Popover
                  id={notifId}
                  open={notifOpen}
                  anchorEl={notifAnchorEl}
                  onClose={handleNotifClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: {
                      sx: {
                        width: 440,
                        maxHeight: 480,
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "white",
                      color: "black",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                        }}
                      >
                        <BellIcon size={20} weight="fill" />
                      </Box>
                      <Typography fontWeight={600} fontSize="1.1rem" sx={{ color: "#1e293b" }}>
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip
                          label={`${unreadCount} new`}
                          size="small"
                          sx={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: "22px",
                          }}
                        />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {unreadCount > 0 && (
                        <Button
                          size="small"
                          onClick={handleMarkAllRead}
                          disableRipple
                          sx={{
                            color: "#1e293b",
                            fontSize: "0.85rem",
                            textTransform: "none",
                            fontWeight: 500,
                            p: 0,
                            minWidth: "auto",
                            "&:hover": { background: "transparent", textDecoration: "underline" },
                          }}
                        >
                          ✓ Mark all
                        </Button>
                      )}
                      <IconButton onClick={handleNotifClose} size="small" sx={{ p: 0.5, color: "#64748b" }}>
                        <CloseIcon size={18} />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Application List */}
                  <Box sx={{ overflowY: "auto", flex: 1 }}>
                    {notifications.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 5,
                          gap: 1,
                        }}
                      >
                        <BellIcon size={36} color="#bdbdbd" />
                        <Typography color="text.secondary" fontSize="0.85rem">
                          No new notifications
                        </Typography>
                      </Box>
                    ) : (
                      paginatedNotifications.map((notif, index) => {
                        const isUnread = !seenIds.has(notif.id);
                        
                        if (notif.type === 'application') {
                          const app = notif.data;
                          return (
                            <React.Fragment key={notif.id}>
                            <Box
                              onClick={() => {
                                // mark this one as seen
                                const updated = new Set(seenIds);
                                updated.add(notif.id);
                                setSeenIds(updated);
                                saveSeenIds(updated);
                                handleNotifClose();
                                router.push(`/?search=${app.applicationNo}`);
                              }}
                              sx={{
                                px: 3,
                                py: 2,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.8,
                                backgroundColor: isUnread ? "#f4f8fb" : "white",
                                borderLeft: isUnread ? "4px solid #3b82f6" : "4px solid transparent",
                                transition: "background 0.15s",
                                "&:hover": {
                                  backgroundColor: "#f1f5f9",
                                },
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                                <Typography
                                  fontWeight={isUnread ? 600 : 500}
                                  fontSize="0.9rem"
                                  sx={{ color: "#1e293b" }}
                                >
                                  New Application Received
                                </Typography>
                                {isUnread && (
                                  <Box
                                    sx={{
                                      mt: "4px",
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      backgroundColor: "#3b82f6", // Blue dot on right
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </Box>

                              <Typography fontSize="0.85rem" sx={{ color: "#64748b", lineHeight: 1.4 }}>
                                Application <strong>#{app.applicationNo}</strong> for <strong>{app.customerName}</strong> has been submitted for a <strong>{formatAmount(app.amount)}</strong> <strong>{app.loanType}</strong> via <strong>{app.provider || "Unknown"}</strong>.
                              </Typography>
                              
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                <ClockIcon size={14} color="#94a3b8" />
                                <Typography fontSize="0.75rem" sx={{ color: "#94a3b8" }}>
                                  {formatDate(app.applicationDate)}
                                </Typography>
                              </Stack>
                            </Box>
                            {index < paginatedNotifications.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                        } else {
                          // Ticket
                          const ticket = notif.data;
                          return (
                            <React.Fragment key={notif.id}>
                              <Box
                                onClick={() => {
                                  const updated = new Set(seenIds);
                                  updated.add(notif.id);
                                  setSeenIds(updated);
                                  saveSeenIds(updated);
                                  handleNotifClose();
                                  router.push(`/ticket/${ticket.ticket_id}`);
                                }}
                                sx={{
                                  px: 3,
                                  py: 2,
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.8,
                                  backgroundColor: isUnread ? "#f0fdf4" : "white",
                                  borderLeft: isUnread ? "4px solid #22c55e" : "4px solid transparent",
                                  transition: "background 0.15s",
                                  "&:hover": {
                                    backgroundColor: "#dcfce7",
                                  },
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                                  <Typography
                                    fontWeight={isUnread ? 600 : 500}
                                    fontSize="0.9rem"
                                    sx={{ color: "#1e293b" }}
                                  >
                                    {ticket.title || 'Ticket Update'}
                                  </Typography>
                                  {isUnread && (
                                    <Box
                                      sx={{
                                        mt: "4px",
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: "#22c55e", // Green dot on right
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </Box>
  
                                <Typography fontSize="0.85rem" sx={{ color: "#64748b", lineHeight: 1.4 }}>
                                  {(() => {
                                    const match = ticket.message.match(/Ticket #(\d+) for (.+?) has been updated to (.+?)(?: by (.+))?$/);
                                    if (match) {
                                      const customerName = match[2];
                                      const actor = match[4];
                                      return (
                                        <>
                                          Ticket <strong>#{ticket.ticket_id}</strong> for <strong>{customerName}</strong> was moved from <strong>{ticket.old_status}</strong> to <strong>{ticket.new_status}</strong>
                                          {actor && <span> by <strong>{actor}</strong></span>}.
                                        </>
                                      );
                                    }
                                    return ticket.message;
                                  })()}
                                </Typography>
                                
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                  <ClockIcon size={14} color="#94a3b8" />
                                  <Typography fontSize="0.75rem" sx={{ color: "#94a3b8" }}>
                                    {formatDateTime(ticket.created_at)}
                                  </Typography>
                                </Stack>
                              </Box>
                              {index < paginatedNotifications.length - 1 && <Divider />}
                            </React.Fragment>
                          );
                        }
                      })
                    )}
                  </Box>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <>
                      <Divider />
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#f8f9fa",
                        }}
                      >
                        <Button
                          size="small"
                          disabled={page === 1}
                          onClick={() => setPage(p => p - 1)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", minWidth: "auto", px: 1, visibility: totalPages > 1 ? "visible" : "hidden" }}
                        >
                          ← Prev
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            handleNotifClose();
                            // Or go to a unified notifications page
                          }}
                          sx={{ color: "#3b82f6", fontSize: "0.8rem", textTransform: "none", fontWeight: 600, visibility: "hidden" }}
                        >
                          View all notifications →
                        </Button>
                        <Button
                          size="small"
                          disabled={page === totalPages}
                          onClick={() => setPage(p => p + 1)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", minWidth: "auto", px: 1, visibility: totalPages > 1 ? "visible" : "hidden" }}
                        >
                          Next →
                        </Button>
                      </Box>
                    </>
                  )}
                </Popover>
              )}

              <Tooltip title="User Profile" arrow placement="bottom">
                <Avatar
                  onClick={userPopover.handleOpen}
                  ref={userPopover.anchorRef}
                  sx={{
                    cursor: "pointer",
                    height: 40,
                    width: 40,
                  }}
                >
                  {decodedToken()?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
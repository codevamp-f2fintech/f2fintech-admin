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
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SEEN_APPLICATIONS_KEY = "seenApplicationIds";

function getSeenIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_APPLICATIONS_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<number>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_APPLICATIONS_KEY, JSON.stringify(Array.from(ids)));
}

export function AppBarNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Notification state
  const [newApplications, setNewApplications] = useState<NewApplication[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [notifAnchorEl, setNotifAnchorEl] = useState<HTMLButtonElement | null>(null);
  const notifOpenRef = useRef(false);

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

  // Fetch new applications for notifications
  const fetchNewApplications = useCallback(async () => {
    try {
      const apps = await ApplicationsAPI.getNewApplications(15);
      setNewApplications(apps);
    } catch (error) {
      console.error("Failed to fetch new applications for notifications", error);
    }
  }, []);

  useEffect(() => {
    if (isSales) return;
    
    fetchNewApplications();

    // Connect to the Express server (port 8080) where applications are created
    const webUrl =
      process.env.NEXT_PUBLIC_WEB_URL?.replace("/api/v1", "") || "http://localhost:8080";
    const socket = io(webUrl);

    socket.on("connect", () => {
      console.log("Connected to WebSocket notifications server on port 8080");
    });

    socket.on("new-application", () => {
      fetchNewApplications();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNewApplications, isSales]);


  const unreadCount = newApplications.filter((app) => !seenIds.has(app.applicationId)).length;

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
    newApplications.forEach((app) => updated.add(app.applicationId));
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
          height: "12vh",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important", alignItems: "center" }}>
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
              <FormControl
                sx={{
                  minWidth: 220,
                  display: { xs: "none", sm: "block" },
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

              {/* Notification Bell */}
              {!isSales && (
                <Tooltip title="New Applications">
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
                        width: 360,
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
                  {/* Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
                      color: "white",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BellIcon size={18} />
                      <Typography fontWeight={700} fontSize="0.95rem">
                        New Applications
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip
                          label={`${unreadCount} new`}
                          size="small"
                          sx={{
                            backgroundColor: "#e53935",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            height: "20px",
                          }}
                        />
                      )}
                    </Stack>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={handleMarkAllRead}
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: "0.7rem",
                          textTransform: "none",
                          p: "2px 8px",
                          minWidth: "auto",
                          "&:hover": { color: "white", background: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        ✓ Mark all read
                      </Button>
                    )}
                  </Box>

                  <Divider />

                  {/* Application List */}
                  <Box sx={{ overflowY: "auto", flex: 1 }}>
                    {newApplications.length === 0 ? (
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
                          No new applications
                        </Typography>
                      </Box>
                    ) : (
                      newApplications.map((app, index) => {
                        const isUnread = !seenIds.has(app.applicationId);
                        return (
                          <React.Fragment key={app.applicationId}>
                            <Box
                              onClick={() => {
                                // mark this one as seen
                                const updated = new Set(seenIds);
                                updated.add(app.applicationId);
                                setSeenIds(updated);
                                saveSeenIds(updated);
                                handleNotifClose();
                                router.push(`/?search=${app.applicationNo}`);
                              }}
                              sx={{
                                px: 2,
                                py: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                gap: 1.5,
                                alignItems: "flex-start",
                                backgroundColor: isUnread ? "rgba(25, 118, 210, 0.05)" : "transparent",
                                transition: "background 0.15s",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                                },
                              }}
                            >
                              {/* Unread dot */}
                              <Box
                                sx={{
                                  mt: "6px",
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: isUnread ? "#e53935" : "transparent",
                                  flexShrink: 0,
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  fontWeight={isUnread ? 700 : 500}
                                  fontSize="0.85rem"
                                  noWrap
                                  sx={{ color: "#1a1a2e" }}
                                >
                                  {app.customerName}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" mt={0.3}>
                                  <Typography fontSize="0.75rem" color="text.secondary">
                                    {formatAmount(app.amount)}
                                  </Typography>
                                  <Typography fontSize="0.75rem" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography
                                    fontSize="0.62rem"
                                    sx={{
                                      backgroundColor: "#e3f2fd",
                                      color: "#1565c0",
                                      px: 0.8,
                                      py: 0.1,
                                      borderRadius: "4px",
                                      textTransform: "capitalize",
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {app.loanType}
                                  </Typography>
                                  <Typography
                                    fontSize="0.62rem"
                                    sx={{
                                      backgroundColor: "#e3f2fd",
                                      color: "#1565c0",
                                      px: 0.8,
                                      py: 0.1,
                                      borderRadius: "4px",
                                      textTransform: "capitalize",
                                      fontWeight: 400,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {app.provider}
                                  </Typography>
                                </Stack>
                                <Typography fontSize="0.72rem" color="text.secondary" mt={0.3}>
                                  {formatDate(app.applicationDate)}
                                </Typography>
                              </Box>
                            </Box>
                            {index < newApplications.length - 1 && <Divider sx={{ mx: 2 }} />}
                          </React.Fragment>
                        );
                      })
                    )}
                  </Box>

                  {/* Footer */}
                  {newApplications.length > 0 && (
                    <>
                      <Divider />
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          textAlign: "center",
                          background: "#f8f9fa",
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() => {
                            handleNotifClose();
                            router.push("/");
                          }}
                          sx={{
                            fontSize: "0.78rem",
                            textTransform: "none",
                            color: "#1976d2",
                            fontWeight: 600,
                          }}
                        >
                          View all applications →
                        </Button>
                      </Box>
                    </>
                  )}
                </Popover>
              )}

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
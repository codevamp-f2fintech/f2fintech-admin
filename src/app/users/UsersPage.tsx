"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
  Tooltip,
  Avatar,
  CircularProgress,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  ClearRounded,
  SearchRounded,
  PersonAddRounded,
  MailRounded,
  EditRounded,
  DeleteRounded,
  PersonRounded,
  PersonOffRounded,
  BadgeRounded,
  PhoneRounded,
  CalendarTodayRounded,
  UpdateRounded,
  SettingsBackupRestoreRounded,
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";

import FormComponent from "./FormInModal";
import Loader from "../components/common/Loader";
import type { AppDispatch, RootState } from "@/redux/store";
import type { UserData } from "@/types/user";
import { setUsers, resetUsers, removeUser } from "@/redux/features/userSlice";
import { useGetUsers } from "@/hooks/user";
import { UserAPI } from "@/apis/UserAPI";
import { Utility } from "@/utils";
import Toast from "../components/common/Toast";
import { getUserRole } from "@/utils/cookies";
import { useRouter, useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const UsersPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Search — two states like home page: live input + debounced API call
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = (searchParams.get("status") as "active" | "inactive") || "active";

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">(urlStatus);

  const prevStatusRef = useRef<string>(urlStatus);
  const prevSearchRef = useRef<string>("");

  const { user: reduxUsers, reduxLoading } = useSelector((state: RootState) => state.user);
  const { toast } = useSelector((state: RootState) => state.toast);
  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, toastAndNavigate, debounceScroll } = Utility();

  // Initialize user role
  useEffect(() => {
    const role = getUserRole();
    setCurrentUserRole(role || "");
  }, []);

  // Debounce search — 500ms like home page
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ─── SWR hook — pure client, no SSR ──────────────────────────────────────
  const { value: data, swrLoading, refetch } = useGetUsers(
    "get-users",
    currentPage,
    ITEMS_PER_PAGE,
    statusFilter,
    debouncedSearch,
  );

  // Stable fingerprint — changes only when the actual dataset changes.
  // Using this instead of the array reference avoids infinite re-render loops.
  const dataFingerprint = `${data?.data?.count ?? ""}|${data?.data?.results?.[0]?.id ?? ""}|${data?.data?.results?.length ?? ""}`;

  // ─── Sync SWR → Redux (mirrors home page pattern) ────────────────────────
  useEffect(() => {
    if (!data?.data?.results) return;

    const statusChanged = statusFilter !== prevStatusRef.current;
    const searchChanged = debouncedSearch !== prevSearchRef.current;

    // Reset Redux when filter or search changes (new dataset)
    if (statusChanged || searchChanged) {
      dispatch(resetUsers());
      prevStatusRef.current = statusFilter;
      prevSearchRef.current = debouncedSearch;
    }

    if (data.data.results.length > 0) {
      dispatch(setUsers({ ...data.data, currentPage }));
      setHasMoreData(data.data.results.length === ITEMS_PER_PAGE);
    } else {
      // DO NOT dispatch resetUsers() here — it causes an infinite loop.
      // The reset above (on filter/search change) is the only safe place.
      setHasMoreData(false);
    }
  }, [dataFingerprint, currentPage, statusFilter, debouncedSearch, dispatch]);

  // Reset page when status filter or search changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMoreData(true);
  }, [statusFilter, debouncedSearch]);

  const handleStatusChange = (newStatus: "active" | "inactive") => {
    setStatusFilter(newStatus);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("status", newStatus);
    router.push(`?${newSearchParams.toString()}`);
  };


  // ─── Infinite scroll ──────────────────────────────────────────────────────
  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
      if (nearBottom && !swrLoading && hasMoreData) {
        setCurrentPage((prev) => prev + 1);
      }
    }, 200),
    [swrLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ─── Role-based display filter ────────────────────────────────────────────
  const displayedUsers = useMemo(() => {
    const users = reduxUsers?.results || [];
    if (!Array.isArray(users) || users.length === 0) return [];

    return users.filter((user: UserData) => {
      if (!user) return false; // only drop null/undefined entries
      if (currentUserRole === "super admin") return user.role === "admin";
      if (currentUserRole === "admin") return user.role !== "super admin";
      return true;
    });
  }, [reduxUsers, currentUserRole]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleUserDelete = useCallback(
    async (id: string | number) => {
      try {
        await UserAPI.updateUserProfile({ id, status: "inactive" });
        dispatch(removeUser(id));
        toastAndNavigate(dispatch, true, "success", "User Deactivated Successfully", null, null, true);
      } catch (err: any) {
        toastAndNavigate(dispatch, true, "error", err?.response?.data?.message || "Error Occurred");
      }
    },
    [dispatch, toastAndNavigate]
  );

  const handleUserRestore = useCallback(
    async (id: string | number) => {
      try {
        await UserAPI.updateUserProfile({ id, status: "active" });
        dispatch(removeUser(id));
        toastAndNavigate(dispatch, true, "success", "User Restored Successfully", null, null, true);
      } catch (err: any) {
        toastAndNavigate(dispatch, true, "error", err?.response?.data?.message || "Error restoring user");
      }
    },
    [dispatch, toastAndNavigate]
  );

  const handleOpenDialog = (userId: string | null = null) => {
    setSelectedUserId(userId);
    setUpdatePassword(false);
    setOpenDialog(true);
  };

  const isInactive = statusFilter === "inactive";
  const totalCount = reduxUsers?.count || 0;

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", pb: 6 }}>
      <Container sx={{ p: 0 }}>

        {/* ── Header bar — matches home page style ── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", xl: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", xl: "center" },
            gap: 2,
            mb: 3,
            width: "100%",
          }}
        >
          {/* Left: search + status filter panel */}
          <Box sx={{ flexGrow: 1, display: "flex", minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                p: 1.5,
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                width: "100%",
              }}
            >
              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  whiteSpace: "nowrap",
                  color: "#1a2340",
                }}
              >
                {isInactive ? "Inactive" : "Active"} Users
                {totalCount > 0 && (
                  <Box component="span" sx={{ ml: 1, color: "#64748b", fontWeight: 500, fontSize: "0.9rem" }}>
                    ({totalCount})
                  </Box>
                )}
              </Typography>

              {/* Divider */}
              <Box sx={{ display: { xs: "none", md: "block" }, width: "1px", height: "32px", bgcolor: "#e2e8f0" }} />

              {/* Search + status chips row */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                  flex: 1,
                  flexDirection: { xs: "column", sm: "row" },
                  "& > *": { width: { xs: "100%", sm: "auto" } },
                }}
              >
                {/* Search field — API-based, 500ms debounce */}
                <TextField
                  size="small"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    flex: 1,
                    minWidth: { xs: "100%", sm: 220, md: 280 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "& fieldset": { border: "1px solid #e2e8f0" },
                      "&:hover fieldset": { borderColor: "#cbd5e1" },
                      "&.Mui-focused fieldset": { borderColor: "#3f50b5", borderWidth: "1px" },
                      "&.Mui-focused": {
                        backgroundColor: "#fff",
                        boxShadow: "0 0 0 3px rgba(63,80,181,0.1)",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 1,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "#334155",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {swrLoading && debouncedSearch
                          ? <CircularProgress size={16} sx={{ color: "#94a3b8" }} />
                          : <SearchRounded sx={{ fontSize: 20, color: "#94a3b8" }} />
                        }
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                          <ClearRounded sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Divider */}
                <Box sx={{ width: "1px", height: "24px", bgcolor: "#e2e8f0", display: { xs: "none", sm: "block" } }} />

                {/* Status filter chips */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Tooltip title="View Active Users">
                    <Chip
                      icon={<PersonRounded sx={{ fontSize: 16 }} />}
                      label="Active"
                      onClick={() => handleStatusChange("active")}
                      sx={{
                        height: "36px",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        bgcolor: statusFilter === "active" ? "#3f50b5" : "transparent",
                        color: statusFilter === "active" ? "#fff" : "#475569",
                        border: statusFilter === "active" ? "1px solid #3f50b5" : "1px solid transparent",
                        "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
                        "&:hover": {
                          bgcolor: statusFilter === "active" ? "#303f9f" : "#f1f5f9",
                        },
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="View Inactive Users">
                    <Chip
                      icon={<PersonOffRounded sx={{ fontSize: 16 }} />}
                      label="Inactive"
                      onClick={() => handleStatusChange("inactive")}
                      sx={{
                        height: "36px",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        bgcolor: statusFilter === "inactive" ? "#dc3545" : "transparent",
                        color: statusFilter === "inactive" ? "#fff" : "#475569",
                        border: statusFilter === "inactive" ? "1px solid #dc3545" : "1px solid transparent",
                        "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
                        "&:hover": {
                          bgcolor: statusFilter === "inactive" ? "#b71c1c" : "#f1f5f9",
                        },
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Right: Create button — only for active view */}
          {!isInactive && (
            <Button
              variant="contained"
              startIcon={<PersonAddRounded />}
              onClick={() => handleOpenDialog(null)}
              sx={{
                height: "48px",
                borderRadius: "16px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                bgcolor: "#3f50b5",
                boxShadow: "0 4px 14px rgba(63,80,181,0.2)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "#303f9f",
                  boxShadow: "0 6px 20px rgba(63,80,181,0.3)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Create New User
            </Button>
          )}
        </Box>

        {/* ── User Cards Grid ── */}
        {(reduxLoading || (swrLoading && displayedUsers.length === 0)) ? (
          <Loader />
        ) : displayedUsers.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              textAlign: "center",
              borderRadius: "16px",
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              gap: 1,
            }}
          >
            {isInactive ? <PersonOffRounded sx={{ fontSize: 48, color: "#cbd5e1" }} /> : <PersonRounded sx={{ fontSize: 48, color: "#cbd5e1" }} />}
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
              No {isInactive ? "inactive" : "active"} users{debouncedSearch ? ` matching "${debouncedSearch}"` : ""} found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {displayedUsers.map((user: UserData, index: number) => (
              <Grid item xs={12} md={6} key={user.id ?? index}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    bgcolor: isInactive ? "#fafafa" : "#fff",
                    transition: "all 0.2s ease",
                    opacity: isInactive ? 0.85 : 1,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      borderColor: "#c7d2fe",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      {/* User info */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                        <Avatar
                          sx={{
                            bgcolor: isInactive ? "#94a3b8" : "#3f50b5",
                            width: 48,
                            height: 48,
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            flexShrink: 0,
                          }}
                        >
                          {user.username?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "#1a2340",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {capitalizeFirstLetter(user.username)}
                            </Typography>
                            {isInactive && (
                              <Chip
                                label="Inactive"
                                size="small"
                                sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#fee2e2", color: "#dc2626", borderRadius: "6px" }}
                              />
                            )}
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <MailRounded sx={{ fontSize: 14, color: "#94a3b8" }} />
                            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {user.email}
                            </Typography>
                          </Box>
                          {user.designation && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                              <BadgeRounded sx={{ fontSize: 14, color: "#94a3b8" }} />
                              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textTransform: "capitalize" }}>
                                {user.designation}
                              </Typography>
                            </Box>
                          )}
                          {user.number && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                              <PhoneRounded sx={{ fontSize: 14, color: "#94a3b8" }} />
                              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user.number}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Role + gender chips */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0, ml: 1 }}>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            borderRadius: "8px",
                            bgcolor: "#eef2ff",
                            color: "#3f50b5",
                            textTransform: "capitalize",
                          }}
                        />
                        {user.gender && (
                          <Chip
                            icon={<WcIcon sx={{ fontSize: "14px !important" }} />}
                            label={capitalizeFirstLetter(user.gender)}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              borderRadius: "8px",
                              bgcolor: "#f8fafc",
                              color: "#64748b",
                              border: "1px solid #e2e8f0",
                              "& .MuiChip-icon": { color: "#94a3b8", ml: 0.5 },
                            }}
                          />
                        )}

                        {/* Action buttons under chips */}
                        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                          {isInactive ? (
                            <Tooltip title="Restore User">
                              <IconButton
                                size="small"
                                onClick={() => handleUserRestore(user.id)}
                                sx={{
                                  color: "#fff",
                                  bgcolor: "#16a34a",
                                  borderRadius: "10px",
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  gap: 0.5,
                                  "&:hover": { bgcolor: "#15803d" },
                                }}
                              >
                                <SettingsBackupRestoreRounded sx={{ fontSize: 16 }} />
                                <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Restore</Box>
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(user.id)}
                                  sx={{
                                    color: "#3f50b5",
                                    bgcolor: "#eef2ff",
                                    borderRadius: "10px",
                                    "&:hover": { bgcolor: "#e0e7ff" },
                                  }}
                                >
                                  <EditRounded sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleUserDelete(user.id)}
                                  sx={{
                                    color: "#dc2626",
                                    bgcolor: "#fee2e2",
                                    borderRadius: "10px",
                                    "&:hover": { bgcolor: "#fecaca" },
                                  }}
                                >
                                  <DeleteRounded sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Date information footer just above actions */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
                      {user.created_at ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarTodayRounded sx={{ fontSize: 13, color: "#94a3b8" }} />
                          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            Joined: {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      ) : <Box />}
                      {user.updated_at && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <UpdateRounded sx={{ fontSize: 13, color: "#94a3b8" }} />
                          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            Updated: {new Date(user.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Load-more spinner */}
        {swrLoading && hasMoreData && displayedUsers.length > 0 && (
          <Loader />
        )}
      </Container>

      {/* Form modal */}
      {!isInactive && (
        <FormComponent
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          updatePassword={updatePassword}
          setUpdatePassword={setUpdatePassword}
          userId={selectedUserId}
          refetch={refetch}
        />
      )}

      <Toast
        alerting={toast.toastAlert}
        message={toast.toastMessage}
        severity={toast.toastSeverity}
      />
    </Box>
  );
};

export default UsersPage;
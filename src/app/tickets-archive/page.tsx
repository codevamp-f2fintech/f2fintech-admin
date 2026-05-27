"use client";
import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as UserIcon,
  Business as BuildingIcon,
  Phone as PhoneIcon,
  Email as MailIcon,
  Visibility as EyeIcon,
  Cached as RotateIcon,
  ChevronLeft,
  ChevronRight,
  FolderOff as FolderOffIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Tooltip,
  ButtonGroup,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { axiosInstance } from "@/apis/config/axiosConfig";

const ArchivedTicketsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [tempSearchValue, setTempSearchValue] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    provider: "",
    name: "",
    startDate: "",
    endDate: "",
    userId: "",
    search: "",
  });

  const debouncedSearch = useCallback(
    _.debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 800),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const fetchUsers = async () => {
    try {
      // Since you're already using axios with interceptors, use axios instead of fetch
      const response = await axiosInstance.get('/get-users', {
        params: {
          page: 1,
          limit: 100
        }
      });

      const data = response.data;

      if (data.statusCode === 200) {
        setUsers(data.data.results || data.data);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mock API call
  const fetchArchivedTickets = async (page = 1, appliedFilters = filters) => {
    try {
      setLoading(true);

      // Use axiosInstance instead of fetch
      const response = await axiosInstance.get('/get-all-archived-tickets', {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          ...(appliedFilters.status && { status: appliedFilters.status }),
          ...(appliedFilters.provider && { provider: appliedFilters.provider }),
          ...(appliedFilters.name && { name: appliedFilters.name }),
          ...(appliedFilters.startDate && {
            startDate: appliedFilters.startDate,
          }),
          ...(appliedFilters.endDate && { endDate: appliedFilters.endDate }),
          ...(appliedFilters.search && { search: appliedFilters.search }),
        }
      });

      const data = response.data; // Axios returns data in response.data

      if (data.statusCode === 200) {
        setTickets(data.data.results);
        setTotalPages(data.data.pages);
        setTotalCount(data.data.count);
      } else {
        setError(data.message || "Failed to fetch archived tickets");
      }
    } catch (err) {
      setError("Error fetching archived tickets");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedTickets(currentPage);
  }, [currentPage, filters]);

  const getUsernameById = (userId) => {
    if (!userId) return "System";
    const user = users.find(
      (user) => user.id === userId || user._id === userId
    );
    return user
      ? user.username || user.name || `User ${userId}`
      : `User ${userId}`;
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: "",
      provider: "",
      name: "",
      startDate: "",
      endDate: "",
      userId: "",
      searchQuery: "",
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    fetchArchivedTickets(1, clearedFilters);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTicket(null);
  };

  const handleRestore = async (archiveId) => {
    try {
      const response = await axiosInstance.post(
        `/restore-original-ticket/${archiveId}`
      );
      const data = response.data;

      if (data.statusCode === 201) {
        alert("Ticket restored successfully");
        fetchArchivedTickets(currentPage);
      } else {
        alert(data.message || "Failed to restore ticket");
      }
    } catch (err) {
      alert("Error restoring ticket");
      console.error("Error:", err);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      disbursed: "success",
      rejected: "error",
      pending: "warning",
      approved: "info",
      "under review": "secondary",
      default: "default",
    };
    return statusColors[status?.toLowerCase()] || statusColors.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    if (!amount || amount === "No Amount") return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Card view for mobile/tablet
  const renderTicketCard = (ticket) => (
    <Card
      key={ticket.archiveId}
      sx={{
        mb: 2,
        borderRadius: 2,
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={`#${ticket.archiveId}`}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={ticket.ticketStatus}
              color={getStatusColor(ticket.ticketStatus)}
              size="small"
            />
          </Box>
          <ButtonGroup variant="text" size="small">
            <Tooltip title="Restore">
              <IconButton
                onClick={() => handleRestore(ticket.archiveId)}
                color="success"
                size="small"
              >
                <RotateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => handleViewDetails(ticket)}
                color="primary"
                size="small"
              >
                <EyeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {/* Customer Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: 14,
              }}
            >
              {ticket.customerName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {ticket.customerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Archived by: {getUsernameById(ticket.archiveBy)}
              </Typography>
            </Box>
          </Box>

          {/* Contact chips - responsive layout */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Chip
              icon={<PhoneIcon fontSize="small" />}
              label={ticket.customerContact}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: { xs: "140px", sm: "180px" },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            <Chip
              icon={<MailIcon fontSize="small" />}
              label={ticket.customerEmail}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: { xs: "140px", sm: "200px" },
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          </Box>
        </Box>

        {/* Application Details */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatAmount(ticket.applicationAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Provider
            </Typography>
            <Typography variant="body2" fontWeight={500} noWrap>
              {ticket.applicationProvider}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Tenure
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {ticket.applicationTenure} years
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Archived
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(ticket.archivedAt)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Archived Tickets
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and restore your archived tickets
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: { xs: "100%", sm: 400 },
                  maxWidth: 400,
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "divider",
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchArchivedTickets(1);
                }}
              >
                <IconButton
                  type="submit"
                  sx={{ p: "10px" }}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
                <input
                  type="text"
                  placeholder="Search by Customer Name or Archive Id..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "8px",
                    fontSize: "14px",
                    backgroundColor: "transparent",
                  }}
                  value={tempSearchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTempSearchValue(value);
                    debouncedSearch(value);
                  }}
                />
                {(tempSearchValue || filters.search) && (
                  <IconButton
                    onClick={() => {
                      setTempSearchValue("");
                      setFilters({ ...filters, search: "" });
                      fetchArchivedTickets(1, { ...filters, search: "" });
                    }}
                    sx={{ p: "10px" }}
                    aria-label="clear"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>



        {/* Tickets Table/Cards */}
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 6,
                gap: 2,
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="body1" color="text.secondary">
                Loading archived tickets...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          ) : tickets.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 6,
                gap: 2,
              }}
            >
              <FolderOffIcon sx={{ fontSize: 60, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                No archived tickets found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tickets you archive will appear here
              </Typography>
            </Box>
          ) : (
            <>
              {/* Responsive Table/Card View */}
              {isTablet ? (
                // Card view for tablet and mobile
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  {tickets.map(renderTicketCard)}
                </Box>
              ) : (
                // Table view for desktop
                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 1000 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: "#3949ab",
                          "& th": {
                            fontWeight: 600,
                            color: "white",
                            fontSize: "14px",
                            borderRight: "1px solid rgba(255,255,255,0.2)",
                            py: 2,
                            "&:last-child": { borderRight: "none" }
                          },
                        }}
                      >
                        <TableCell>A.ID</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Provider</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Tenure</TableCell>
                        <TableCell>Archived Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow
                          key={ticket.archiveId}
                          hover
                          sx={{ "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                            {ticket.archiveId}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}>
                            {ticket.customerName}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b" }}>
                            {ticket.customerEmail}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: "#059669", fontWeight: 700, fontSize: "14px" }}>
                              {formatAmount(ticket.applicationAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: "#7e22ce", fontWeight: 700, fontSize: "14px" }}>
                              {ticket.applicationProvider}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.ticketStatus}
                              size="small"
                              sx={{
                                bgcolor: "rgba(57, 73, 171, 0.1)",
                                color: "#3949ab",
                                fontWeight: 600,
                                borderRadius: "8px"
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "#64748b" }}>
                            {ticket.applicationTenure} {ticket.applicationTenure > 10 ? 'months' : 'years'}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b" }}>
                            {formatDate(ticket.archivedAt).split(',').slice(0, 2).join(',')}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <Button
                                size="small"
                                onClick={() => handleRestore(ticket.archiveId)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: "20px",
                                  color: "#f44336",
                                  bgcolor: "rgba(244, 67, 54, 0.1)",
                                  "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" },
                                  minWidth: "70px",
                                  py: 0.2
                                }}
                              >
                                Restore
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleViewDetails(ticket)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  borderRadius: "20px",
                                  color: "#3949ab",
                                  bgcolor: "rgba(57, 73, 171, 0.1)",
                                  "&:hover": { bgcolor: "rgba(57, 73, 171, 0.2)" },
                                  minWidth: "70px",
                                  py: 0.2
                                }}
                              >
                                View
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light"
                        ? "grey.50"
                        : "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing{" "}
                      <strong>
                        {(currentPage - 1) * limit + 1}-
                        {Math.min(currentPage * limit, totalCount)}
                      </strong>{" "}
                      of <strong>{totalCount}</strong>
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      shape="rounded"
                      showFirstButton={!isMobile}
                      showLastButton={!isMobile}
                      siblingCount={isMobile ? 0 : 1}
                      boundaryCount={1}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Modal Dialog - Responsive */}
      {selectedTicket && (
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              m: isMobile ? 0 : 2,
              maxHeight: isMobile ? "100vh" : "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#3949ab",
              color: "white",
              py: 2,
              px: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                <UserIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
                  Ticket #{selectedTicket.archiveId}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, color: "rgba(255,255,255,0.8)" }}>
                  {selectedTicket.customerName}'s Application
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{ p: 0, overflowY: "auto" }}
          >
            <Grid container>
              {/* Left Section - Customer Info */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  backgroundColor: "grey.50",
                  p: { xs: 2, sm: 3 },
                  borderRight: { md: "1px solid" },
                  borderColor: { md: "divider" },
                  borderBottom: { xs: "1px solid", md: "none" },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <UserIcon fontSize="small" />
                  Customer Details
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#aaa",
                        color: "white",
                        mr: 2,
                        width: 40,
                        height: 40,
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      {capitalizeFirstLetter(
                        selectedTicket.customerName.split(".")[1]?.trim() ||
                        selectedTicket.customerName
                          .split(" ")
                          .slice(1)
                          .join(" ")
                      ).charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {selectedTicket.customerName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedTicket.customerContact || "Not provided"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <MailIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                        {selectedTicket.customerEmail || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CalendarIcon fontSize="small" />
                  Timeline
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    gap: 3
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created At
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(selectedTicket.createdAt).split(',').slice(0, 2).join(',')}
                    </Typography>
                  </Box>
                  
                  <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Archived At
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(selectedTicket.archivedAt).split(',').slice(0, 2).join(',')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Section - Application Details */}
              <Grid item xs={12} md={7} sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "grey.50" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BuildingIcon fontSize="small" />
                  Application Details
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      rowGap: 2,
                      columnGap: { xs: 2, sm: 2.5 },
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {formatAmount(selectedTicket.applicationAmount)}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tenure
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {selectedTicket.applicationTenure} yrs
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Provider
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {selectedTicket.applicationProvider}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedTicket.ticketStatus}
                          color={getStatusColor(selectedTicket.ticketStatus)}
                          size="small"
                          sx={{ 
                            height: 22, 
                            fontSize: "0.75rem",
                            "& .MuiChip-label": { px: 1 } 
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <UserIcon fontSize="small" />
                  Archive Information
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      rowGap: 2,
                      columnGap: { xs: 2, sm: 3 },
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Archived By
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: 10,
                            mr: 1,
                            bgcolor: "#3949ab",
                          }}
                        >
                          {getUsernameById(selectedTicket.archiveBy)
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {getUsernameById(selectedTicket.archiveBy)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />

                    <Box sx={{ flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reason
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                        {selectedTicket.reason}
                      </Typography>
                    </Box>

                    {selectedTicket.additionalNotes && (
                      <>
                        <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.12)" }} />
                        <Box sx={{ flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Additional Notes
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                            {selectedTicket.additionalNotes}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              flexDirection: { xs: "column-reverse", sm: "row" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleRestore(selectedTicket.archiveId);
                handleCloseModal();
              }}
              variant="contained"
              startIcon={<RotateIcon />}
              sx={{
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
                backgroundColor: "#3949ab",
                "&:hover": { backgroundColor: "#2c387e" }
              }}
            >
              Restore Ticket
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ArchivedTicketsPage;

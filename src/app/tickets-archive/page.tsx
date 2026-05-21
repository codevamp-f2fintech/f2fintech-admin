"use client";
import React, { useState, useEffect } from "react";
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
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                    })
                  }
                />
                {filters.search && (
                  <IconButton
                    onClick={() => {
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: "20px" }}>
              <CardContent sx={{ borderRadius: "20px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    backgroundImage: "linear-gradient(#c4d5eb, #c4d5eb)",
                  }}
                >
                  <div>
                    <Typography variant="body2" color="text.secondary">
                      Total Archived
                    </Typography>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
                      {totalCount}
                    </Typography>
                  </div>
                  <Avatar sx={{ bgcolor: "grey.100" }}>
                    <UserIcon color="action" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tickets Table/Cards */}
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              backgroundImage: "linear-gradient(#c4d5eb, #c4d5eb)",
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Archived Tickets
            </Typography>
          </Box>

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
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                              ? "grey.100"
                              : "background.default",
                          "& th": { fontWeight: 600 },
                        }}
                      >
                        <TableCell>Archive ID</TableCell>
                        <TableCell>Archived By</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Application</TableCell>
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
                          <TableCell>
                            <Chip
                              label={`#${ticket.archiveId}`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "primary.main",
                                  fontSize: 14,
                                }}
                              >
                                {getUsernameById(ticket.archiveBy)
                                  .charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                              <Typography variant="body2">
                                {getUsernameById(ticket.archiveBy)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={500}>
                                {ticket.customerName}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
                                <Tooltip title="Phone">
                                  <Chip
                                    icon={<PhoneIcon fontSize="small" />}
                                    label={ticket.customerContact}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Tooltip>
                                <Tooltip title="Email">
                                  <Chip
                                    icon={<MailIcon fontSize="small" />}
                                    label={ticket.customerEmail}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      maxWidth: 150,
                                      "& .MuiChip-label": {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      },
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {formatAmount(ticket.applicationAmount)}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1.5, mt: 0.5 }}>
                              <Chip
                                label={`${ticket.applicationTenure} yrs`}
                                size="small"
                              />
                              <Chip
                                label={ticket.applicationProvider}
                                size="small"
                                color="secondary"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {formatDate(ticket.archivedAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Created: {formatDate(ticket.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <ButtonGroup variant="text" size="small">
                              <Tooltip title="Restore">
                                <IconButton
                                  onClick={() =>
                                    handleRestore(ticket.archiveId)
                                  }
                                  color="success"
                                >
                                  <RotateIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton
                                  onClick={() => handleViewDetails(ticket)}
                                  color="primary"
                                >
                                  <EyeIcon />
                                </IconButton>
                              </Tooltip>
                            </ButtonGroup>
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
              backgroundColor: "#c4d5eb",
              color: "black",
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
                  bgcolor: "#aaa",
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                <UserIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ticket #{selectedTicket.archiveId}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedTicket.customerName}'s Application
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseModal} sx={{ color: "red" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{ p: 0, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
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
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
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
                      alt={capitalizeFirstLetter(
                        selectedTicket.customerName.split(".")[1]?.trim() ||
                        selectedTicket.customerName
                          .split(" ")
                          .slice(1)
                          .join(" ")
                      )}
                      src={
                        Array.isArray(selectedTicket.customerProfileImage) &&
                          selectedTicket.customerProfileImage.length > 0
                          ? selectedTicket.customerProfileImage[0]
                          : undefined
                      }
                      sx={{
                        bgcolor: "#aaa",
                        color: "white",
                        mr: 2,
                        width: 48,
                        height: 48,
                        fontSize: 20,
                        fontWeight: "bold",
                        border: "1px solid rgba(255,255,255,0.3)",
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
                      <Chip
                        label={selectedTicket.ticketStatus}
                        color={getStatusColor(selectedTicket.ticketStatus)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PhoneIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          selectedTicket.customerContact || "Not provided"
                        }
                        primaryTypographyProps={{ variant: "body2" }}
                        secondary="Contact"
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MailIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={selectedTicket.customerEmail || "Not provided"}
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: {
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          },
                        }}
                        secondary="Email"
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  </List>
                </Box>

                {/* Timeline Section */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
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
                  }}
                >
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "success.main",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatDate(selectedTicket.createdAt)}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondary="Created"
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "warning.main",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={formatDate(selectedTicket.archivedAt)}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondary="Archived"
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>

              {/* Right Section - Application Details */}
              <Grid item xs={12} md={7} sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BuildingIcon fontSize="small" />
                  Application Details
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Loan Amount
                        </Typography>
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          sx={{ fontWeight: 600 }}
                        >
                          {formatAmount(selectedTicket.applicationAmount)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Tenure
                        </Typography>
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          sx={{ fontWeight: 600 }}
                        >
                          {selectedTicket.applicationTenure} years
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Provider
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: "secondary.light",
                          color: "secondary.main",
                          mr: 2,
                          width: 36,
                          height: 36,
                        }}
                      >
                        <BuildingIcon fontSize="small" />
                      </Avatar>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, wordBreak: "break-word" }}
                      >
                        {selectedTicket.applicationProvider}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Archived By User Section */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <UserIcon fontSize="small" />
                  Archived By
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#aaa",
                        mr: 2,
                        width: 36,
                        height: 36,
                        fontSize: 16,
                      }}
                    >
                      {getUsernameById(selectedTicket.archiveBy)
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {getUsernameById(selectedTicket.archiveBy)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: #{selectedTicket.archiveBy || "System"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Reason for Archiving */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <UserIcon fontSize="small" />
                  Reason for Archiving
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTicket.reason}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Notes */}
                {selectedTicket.additionalNotes && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography fontSize="small">📝</Typography>
                      Additional Notes
                    </Typography>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {selectedTicket.additionalNotes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
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
              color="success"
              startIcon={<RotateIcon />}
              sx={{
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
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

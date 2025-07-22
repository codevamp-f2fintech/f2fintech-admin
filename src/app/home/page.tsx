"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Grid,
  Button,
  TextField,
  Typography,
  Box,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";

import ApplicationCard from "../components/common/ApplicationCard";
import Loader from "../components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  setCustomerApplications,
  resetCustomerApplications,
} from "@/redux/features/customerApplicationSlice";
import { useGetCustomerApplications } from "@/hooks/customerApplication";
import { Utility } from "@/utils";
import { ClearRounded, SearchRounded } from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

const ITEMS_PER_PAGE = 12;

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    applicationId: null,
    customerName: "",
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toggleListView, setToggleListView] = useState(true);

  const { customerApplication } = useSelector(
    (state: RootState) => state.customerApplications
  );
  const dispatch: AppDispatch = useDispatch();
  const { debounceScroll, decodedToken, remLocalStorage } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const salesUserId =
    decodedToken()?.role === "sales" ? decodedToken()?.id : null;

  const userRole = decodedToken()?.role;
  const isAdmin = userRole === "admin";

  const {
    value: data,
    swrLoading,
    refetch,
  } = useGetCustomerApplications(
    "get-customer-loan-applications",
    currentPage,
    ITEMS_PER_PAGE,
    salesUserId
  );

  // Delete application function
  const handleDeleteApplication = async (
    applicationId: string,
    customerName: string,
    reason: string
  ) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delete-loan-application/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete application");
      }

      // Close dialog first
      setDeleteDialog({ open: false, applicationId: null, customerName: "" });

      // Reload the page to ensure fresh data
      window.location.reload();
      // Optionally show success message
      console.log("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      // You might want to show an error toast/notification here
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, applicationId: null, customerName: "" });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (applicationId: string, customerName: string) => {
    if (!isAdmin) {
      console.warn("Only admin users can delete applications");
      return;
    }

    setDeleteDialog({
      open: true,
      applicationId,
      customerName,
    });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, applicationId: null, customerName: "" });
  };

  // Fetch and update state with new data
  useEffect(() => {
    if (data.results.length > 0) {
      dispatch(setCustomerApplications(data));
      setHasMoreData(data.results.length === ITEMS_PER_PAGE);
    } else {
      setHasMoreData(false);
    }
  }, [data, dispatch]);

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400; // 400px threshold
      if (nearBottom && !swrLoading && hasMoreData) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }, 500),
    [swrLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Filtered results based on search term
  const filteredCustomers = useMemo(() => {
    return customerApplication?.results.filter(
      (customer) =>
        (!customer.is_picked &&
          customer.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        customer.customerContact.toLowerCase().includes(searchTerm)
    );
  }, [searchTerm, customerApplication]);

  useEffect(() => {
    return () => {
      dispatch(resetCustomerApplications()) as unknown as void;
    };
  }, [dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Only mobile (column) and desktop (row)
          width: "100%",
          alignItems: "center",
          gap: { xs: 2, md: 0 }, // Gap only for mobile
        }}
      >
        <Box
          sx={{
            height: { xs: "6vh", md: "7vh" }, // Mobile: 6vh, Desktop: 7vh
            width: {
              xs: "100%", // Full width on mobile
              md: "22vw", // Original desktop width
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            color: "#000",
            "&:hover": {
              color: "#403d39",
            },
            gap: 4,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "semibold",
              fontSize: {
                xs: "1.5rem", // Mobile
                md: "1.7rem", // Desktop (original)
              },
              whiteSpace: "nowrap", // Prevent text wrapping
            }}
          >
            Fresh Applications: {customerApplication?.count || 0}
          </Typography>
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
                md: "none",
                xl: "none",
                lg: "none",
              },
            }}
          >
            <TextField
              label="Search by name or number..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "action.active", mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "100px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "& fieldset": { border: "none" },
                  width: { xs: "100%", md: "15vw" }, // Full width on mobile, original on desktop
                },
              }}
              InputLabelProps={{
                style: {
                  color: "#757575",
                },
              }}
            />
          </Box>
        </Box>
        {/* Right Side  Controls*/}
        <Box
          sx={{
            height: { xs: "auto", md: "10vh" }, // Auto height on mobile
            width: {
              xs: "100%", // Full width on mobile
              md: "70%", // Original desktop width
            },
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Column on mobile, row on desktop
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 2, md: 0 }, // Gap between items on mobile
            ml: { xs: 0, md: "3vw" }, // Margin left only on desktop
          }}
        >
          <Box
            sx={{
              display: {
                xs: "flex",
                sm: "none",
                md: "flex",
                xl: "flex",
                lg: "flex",
              },
            }}
          >
            <TextField
              label="Search by name or number..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "action.active", mr: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "100px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "& fieldset": { border: "none" },
                  width: { xs: "100%", md: "15vw" }, // Full width on mobile, original on desktop
                },
              }}
              InputLabelProps={{
                style: {
                  color: "#757575",
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: {
                xs: "center",
                sm: "center",
                alignItems: "center",
                gap: 10,
              },
            }}
          >
            <Link href="/ticket" passHref>
              <Button
                sx={{
                  width: {
                    xs: "100%", // Full width on mobile
                    md: "12vw", // Original desktop width
                  },
                  fontSize: {
                    xs: "0.7rem", // Smaller on mobile
                    md: "1rem", // Original on desktop
                  },
                  bgcolor: "#0c66e4",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#0c66e4",
                  },
                  whiteSpace: "nowrap",
                  order: { xs: 3, md: 2 }, // Reorder for mobile
                }}
                variant="contained"
              >
                {decodedToken()?.role === "admin" ||
                decodedToken()?.role === "sales"
                  ? "Show Tickets"
                  : "Show My Tickets"}
              </Button>
            </Link>
            {/* toggle button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                padding: "6px 12px",
                backgroundColor: "#fafafa",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
                width: "fit-content",
                height: {
                  md: "7vh",
                  sm: "4vh",
                  xs: "4.5vh",
                },
                order: { xs: 2, md: 3 }, // Reorder for mobile
              }}
            >
              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setToggleListView(false)}
                  sx={{
                    color: !toggleListView ? "#1d86ff" : "#9e9e9e",
                    height: {
                      sm: "3vh",
                      md: "5vh",
                      xs: "4vh",
                    },
                    backgroundColor: !toggleListView
                      ? "#e3f2fd"
                      : "transparent",
                    borderRadius: "8px",
                  }}
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="List View">
                <IconButton
                  onClick={() => setToggleListView(true)}
                  sx={{
                    color: toggleListView ? "#1d86ff" : "#9e9e9e",
                    height: {
                      sm: "3vh",
                      md: "5vh",
                      xs: "4vh",
                    },
                    backgroundColor: toggleListView ? "#e3f2fd" : "transparent",
                    borderRadius: "8px",
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {decodedToken()?.role === "sales" ? (
            <Link href="/home/create" passHref>
              <Button
                sx={{
                  width: isTab ? "21vw" : "auto", // Original tablet/desktop logic
                  fontSize: isTab ? "1rem" : "", // Original tablet logic
                  bgcolor: "#0c66e4",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#0c66e4",
                  },
                  whiteSpace: "nowrap",
                  order: 4,
                }}
                onClick={() => {
                  remLocalStorage("customerInfo");
                }}
                variant="contained"
              >
                Create Application
              </Button>
            </Link>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          minWidth: "80vw",
          minHeight: "90vh",
          marginTop: "1vh",
        }}
      >
        <Grid container spacing={2}>
          {!filteredCustomers?.length ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "90vh",
              }}
            >
              <Typography
                sx={{
                  color: "black",
                  display: "flex",
                  mb: "20vh",
                }}
              >
                No Applications Found...
              </Typography>
            </Box>
          ) : (
            <>
              {filteredCustomers.map((customerApplication) => (
                <ApplicationCard
                  key={customerApplication.applicationId}
                  customerApplication={customerApplication}
                  refetch={refetch}
                  showDeleteButton={isAdmin}
                  onDelete={openDeleteDialog}
                  isApplication={true}
                  handleDeleteApplication={handleDeleteApplication}
                  toggleListView={toggleListView}
                  userRole={userRole}
                />
              ))}

              {/* Show "No more applications to load" message */}
              {!hasMoreData && !swrLoading && (
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    mt: 4,
                    color: "black",
                    // ml: "4vw",
                  }}
                >
                  No more applications to load...
                </Typography>
              )}
            </>
          )}
        </Grid>
        {swrLoading && <Loader />}
      </Box>
    </Box>
  );
};

export default Home;

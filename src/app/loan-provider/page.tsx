"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setLoanProviders } from "@/redux/features/loanProviderSlice";
import { useGetLoanProviders } from "@/hooks/loanProvider";
import { Utility } from "@/utils";
import {
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ClearRounded,
  SearchRounded,
  PersonAddRounded,
  DeleteRounded,
  EditRounded,
} from "@mui/icons-material";
import PublicIcon from "@mui/icons-material/Public";
import Loader from "../components/common/Loader";

const ITEMS_PER_PAGE = 100;

const LoanProviderPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [noMoreData, setNoMoreData] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { loanProvider, reduxLoading } = useSelector(
    (state: RootState) => state.loanProviders
  );
  const { debounceScroll } = Utility();

  const {
    value: data,
    swrLoading,
    refetch,
  } = useGetLoanProviders(
    null,
    "get-all-loan-providers",
    currentPage,
    ITEMS_PER_PAGE
  );

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  // Set loan providers when data changes
  useEffect(() => {
    if (data?.data?.results) {
      dispatch(setLoanProviders(data?.data?.results));
      setHasMoreData(data.data.results.length === ITEMS_PER_PAGE);
    } else {
      setHasMoreData(false);
    }
  }, [data?.data?.results, dispatch]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredLoanProviders = useMemo(() => {
    return (loanProvider || []).filter((provider) =>
      provider.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, loanProvider]);

  // Delete functionality
  const handleDeleteClick = (provider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProvider) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delete-loan-provider/${selectedProvider.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the deleted provider from Redux store
        const updatedProviders = loanProvider.filter(
          (p) => p.id !== selectedProvider.id
        );
        dispatch(setLoanProviders(updatedProviders));

        setSnackbar({
          open: true,
          message: "Loan provider deleted successfully",
          severity: "success",
        });

        refetch();
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.message || "Failed to delete loan provider",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting loan provider:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while deleting the loan provider",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedProvider(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

      if (nearBottom) {
        if (!swrLoading && hasMoreData) {
          setCurrentPage((prevPage) => prevPage + 1);
        } else if (!hasMoreData) {
          setNoMoreData(true);
        }
      }
    }, 500),
    [swrLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Box
      sx={{ minHeight: "100vh", px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 4 } }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
          }}
        >
          <TextField
            placeholder="Search by name..."
            variant="outlined"
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
                width: { xs: "100%", md: "320px" },
              },
            }}
            InputLabelProps={{
              style: {
                color: "black",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<PersonAddRounded />}
            onClick={() => router.push("/loan-provider/create")}
            sx={{
              borderRadius: "100px",
              px: { xs: 2, sm: 3 },
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              bgcolor: "#0c66e4",
              color: "white",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#0c66e4",
                color: "white",
              },
            }}
          >
            Create Loan Provider
          </Button>
        </Box>

        {/* Loan Provider Grid */}
        {filteredLoanProviders.length > 0 ? (
          <Grid container spacing={3}>
            {filteredLoanProviders.map((provider) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={provider.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 14px 40px rgba(0,0,0,0.12)",
                    },
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  {/* Top Banner */}
                  <Box sx={{ height: "48px", bgcolor: "#3949ab", width: "100%" }} />

                  {/* Avatar Image */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: "-32px" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "#1e293b",
                        border: "3px solid white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                      }}
                    >
                      {provider.home_image ? (
                        <img
                          src={provider.home_image}
                          alt="Home"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Typography sx={{ color: "white", fontWeight: 700, fontSize: "24px" }}>
                          {provider.title?.charAt(0)?.toUpperCase()}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2, pt: 1.5, pb: "16px !important" }}>
                    {/* Title & Location */}
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 800, textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.5px" }}>
                        {provider.title}
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: "12px", mt: 0.5 }}>
                        {provider.country}
                      </Typography>
                    </Box>

                    {/* Information Grid Container */}
                    <Box sx={{ bgcolor: "#f8fafc", borderRadius: 2, p: 2, mb: 2, border: "1px solid #f1f5f9" }}>
                      <Grid container spacing={1.5}>

                        {/* Min/Max Amount */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Amount Range
                          </Typography>
                          <Typography sx={{ color: "#059669", fontWeight: 700, fontSize: "13px" }}>
                            ₹{provider.min_amount?.toLocaleString() || 0} - ₹{provider.max_amount?.toLocaleString() || 0}
                          </Typography>
                        </Grid>

                        {/* Interest Rate */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Interest Rate
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px" }}>
                            {provider.interest_rate}%
                          </Typography>
                        </Grid>

                        {/* Max Tenure */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Max Tenure
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px" }}>
                            {provider.max_tenure} years
                          </Typography>
                        </Grid>

                        {/* Charges */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Charges
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px" }}>
                            {provider.charges || "N/A"}
                          </Typography>
                        </Grid>

                        {/* Minimum KYC */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Min. KYC
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px" }}>
                            {provider.minimum_kyc || "N/A"}
                          </Typography>
                        </Grid>

                        {/* Documents */}
                        <Grid item xs={6}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Documents
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {provider.document_required || "N/A"}
                          </Typography>
                        </Grid>

                        {/* Divider & Dates */}
                        <Grid item xs={12}>
                          <Box sx={{ borderTop: "1px solid #e2e8f0", my: 0.5 }} />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography sx={{ color: "#94a3b8", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                            Created At
                          </Typography>
                          <Typography sx={{ color: "#1e293b", fontWeight: 700, fontSize: "13px" }}>
                            {provider.created_at ? new Date(provider.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Actions Footer */}
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleDeleteClick(provider)}
                        startIcon={<DeleteRounded sx={{ fontSize: "16px !important" }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "20px",
                          py: 0.5,
                          color: "#f44336",
                          bgcolor: "rgba(244, 67, 54, 0.08)",
                          "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => router.push(`/loan-provider/edit/${provider.id}`)}
                        startIcon={<EditRounded sx={{ fontSize: "16px !important" }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "20px",
                          py: 0.5,
                          color: "#3949ab",
                          bgcolor: "rgba(57, 73, 171, 0.08)",
                          "&:hover": { bgcolor: "rgba(57, 73, 171, 0.15)" },
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {!hasMoreData && !swrLoading && (
              <Grid item xs={12}>
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    mt: 4,
                    color: "black",
                  }}
                >
                  No more loan providers to load...
                </Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          !swrLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "40vh",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "gray", textAlign: "center" }}
              >
                No loan providers found
              </Typography>
            </Box>
          )
        )}
      </Container>

      {swrLoading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Loader />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{selectedProvider?.title}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={16} /> : <DeleteRounded />
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoanProviderPage;

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

const ITEMS_PER_PAGE = 100;

const LoanProviderPage = () => {
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ hasMoreData, setHasMoreData ] = useState( true );
  const [ noMoreData, setNoMoreData ] = useState( false );
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState( false );
  const [ selectedProvider, setSelectedProvider ] = useState( null );
  const [ isDeleting, setIsDeleting ] = useState( false );
  const [ snackbar, setSnackbar ] = useState( {
    open: false,
    message: "",
    severity: "success",
  } );

  const { loanProvider, reduxLoading } = useSelector(
    ( state: RootState ) => state.loanProviders
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
  useEffect( () => {
    if ( data?.data?.results )
    {
      dispatch( setLoanProviders( data?.data?.results ) );
      setHasMoreData( data.data.results.length === ITEMS_PER_PAGE );
    } else
    {
      setHasMoreData( false );
    }
  }, [ data?.data?.results, dispatch ] );

  const [ searchTerm, setSearchTerm ] = useState( "" );

  const filteredLoanProviders = useMemo( () => {
    return ( loanProvider || [] ).filter( ( provider ) =>
      provider.title?.toLowerCase().includes( searchTerm.toLowerCase() )
    );
  }, [ searchTerm, loanProvider ] );

  // Delete functionality
  const handleDeleteClick = ( provider ) => {
    setSelectedProvider( provider );
    setDeleteDialogOpen( true );
  };

  const handleDeleteConfirm = async () => {
    if ( !selectedProvider ) return;

    setIsDeleting( true );
    try
    {
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_API_URL }/delete-loan-provider/${ selectedProvider.id }`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if ( response.ok )
      {
        // Remove the deleted provider from Redux store
        const updatedProviders = loanProvider.filter(
          ( p ) => p.id !== selectedProvider.id
        );
        dispatch( setLoanProviders( updatedProviders ) );

        setSnackbar( {
          open: true,
          message: "Loan provider deleted successfully",
          severity: "success",
        } );

        refetch();
      } else
      {
        const errorData = await response.json();
        setSnackbar( {
          open: true,
          message: errorData.message || "Failed to delete loan provider",
          severity: "error",
        } );
      }
    } catch ( error )
    {
      console.error( "Error deleting loan provider:", error );
      setSnackbar( {
        open: true,
        message: "An error occurred while deleting the loan provider",
        severity: "error",
      } );
    } finally
    {
      setIsDeleting( false );
      setDeleteDialogOpen( false );
      setSelectedProvider( null );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen( false );
    setSelectedProvider( null );
  };

  const handleScroll = useCallback(
    debounceScroll( () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

      if ( nearBottom )
      {
        if ( !swrLoading && hasMoreData )
        {
          setCurrentPage( ( prevPage ) => prevPage + 1 );
        } else if ( !hasMoreData )
        {
          setNoMoreData( true );
        }
      }
    }, 500 ),
    [ swrLoading, hasMoreData ]
  );

  useEffect( () => {
    window.addEventListener( "scroll", handleScroll );
    return () => window.removeEventListener( "scroll", handleScroll );
  }, [ handleScroll ] );

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
            onChange={( e ) => setSearchTerm( e.target.value )}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "action.active", mr: 1 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm( "" )}>
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
            onClick={() => router.push( "/loan-provider/create" )}
            sx={{
              borderRadius: "100px",
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              bgcolor: "#f06292",
              color: "white",
              "&:hover": {
                bgcolor: "#9D50BB",
                color: "white",
              },
            }}
          >
            Create Loan Providers
          </Button>
        </Box>

        {/* Loan Provider Grid */}
        {filteredLoanProviders.length > 0 ? (
          <Grid container spacing={3}>
            {filteredLoanProviders.map( ( provider ) => (
              <Grid item xs={12} md={6} key={provider.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    },
                    position: "relative",
                    width: "100%",
                    maxWidth: {
                      xs: "100%",
                      sm: "500px",
                      md: "700px",
                      lg: "900px",
                    },
                    margin: "auto",
                  }}
                >
                  {/* Delete Button */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick( provider )}
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                      }}
                    >
                      <DeleteRounded />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        router.push( `/loan-provider/edit/${ provider.id }` )
                      }
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                      }}
                    >
                      <EditRounded />
                    </IconButton>
                  </Box>

                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 3 },
                      minHeight: { xs: "auto", md: "30vh" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "center", md: "start" },
                        gap: { xs: 2, md: 0 },
                        mb: 0,
                      }}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          width: { xs: "100%", md: "50%" },
                          height: { xs: "200px", md: "28vh" },
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={provider.home_image}
                          alt="Home"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>

                      {/* Text */}
                      <Box
                        sx={{
                          width: { xs: "100%", md: "60%" },
                          paddingLeft: { xs: 0, md: 2 },
                          marginTop: { xs: 0, md: 3 },
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            color: "black",
                            fontWeight: 600,
                            mb: 1,
                            textAlign: { xs: "center", md: "left" },
                          }}
                        >
                          {provider.title}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                            justifyContent: { xs: "center", md: "flex-start" },
                          }}
                        >
                          <PublicIcon sx={{ color: "blue", fontSize: 18 }} />
                          <Typography
                            sx={{ color: "black", fontSize: "0.9rem" }}
                          >
                            {provider.country}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            justifyContent: { xs: "center", md: "flex-start" },
                          }}
                        >
                          <PublicIcon sx={{ color: "blue", fontSize: 18 }} />
                          <Typography
                            sx={{ color: "black", fontSize: "0.9rem" }}
                          >
                            {provider.short_description}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) )}

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
          <CircularProgress />
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
        onClose={() => setSnackbar( { ...snackbar, open: false } )}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar( { ...snackbar, open: false } )}
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

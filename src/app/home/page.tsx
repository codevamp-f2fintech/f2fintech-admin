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
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Dialog,
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

const ITEMS_PER_PAGE = 12;

const Home: React.FC = () => {
  const [ searchTerm, setSearchTerm ] = useState<string>( "" );
  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ hasMoreData, setHasMoreData ] = useState<boolean>( true );
  const [ deleteDialog, setDeleteDialog ] = useState( {
    open: false,
    applicationId: null,
    customerName: "",
  } );
  const [ isDeleting, setIsDeleting ] = useState<boolean>( false );

  const { customerApplication } = useSelector(
    ( state: RootState ) => state.customerApplications
  );
  const dispatch: AppDispatch = useDispatch();
  const { debounceScroll, decodedToken, remLocalStorage } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const salesUserId = decodedToken()?.role === "sales" ? decodedToken()?.id : null;

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
  const handleDeleteApplication = async ( applicationId: string, customerName: string, reason: string ) => {
    setIsDeleting( true );
    try
    {
      const token = localStorage.getItem( 'token' );
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_API_URL }/delete-loan-application/${ applicationId }`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ token }`,
          },
        }
      );

      if ( !response.ok )
      {
        const errorData = await response.json();
        throw new Error( errorData.message || 'Failed to delete application' );
      }

      // Close dialog first
      setDeleteDialog( { open: false, applicationId: null, customerName: "" } );

      // Reload the page to ensure fresh data
      window.location.reload();
      // Optionally show success message
      console.log( 'Application deleted successfully' );
    } catch ( error )
    {
      console.error( 'Error deleting application:', error );
      // You might want to show an error toast/notification here
    } finally
    {
      setIsDeleting( false );
      setDeleteDialog( { open: false, applicationId: null, customerName: "" } );
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = ( applicationId: string, customerName: string ) => {
    if ( !isAdmin )
    {
      console.warn( 'Only admin users can delete applications' );
      return;
    }

    setDeleteDialog( {
      open: true,
      applicationId,
      customerName,
    } );
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog( { open: false, applicationId: null, customerName: "" } );
  };

  // Fetch and update state with new data
  useEffect( () => {
    if ( data.results.length > 0 )
    {
      dispatch( setCustomerApplications( data ) );
      setHasMoreData( data.results.length === ITEMS_PER_PAGE );
    } else
    {
      setHasMoreData( false );
    }
  }, [ data, dispatch ] );

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll( () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400; // 400px threshold
      if ( nearBottom && !swrLoading && hasMoreData )
      {
        setCurrentPage( ( prevPage ) => prevPage + 1 );
      }
    }, 500 ),
    [ swrLoading, hasMoreData ]
  );

  useEffect( () => {
    window.addEventListener( "scroll", handleScroll );
    return () => window.removeEventListener( "scroll", handleScroll );
  }, [ handleScroll ] );

  // Filtered results based on search term
  const filteredCustomers = useMemo( () => {
    return customerApplication?.results.filter(
      ( customer ) =>
        !customer.is_picked &&
        customer.customerName.toLowerCase().includes( searchTerm.toLowerCase() )
        ||
        customer.customerContact.toLowerCase().includes( searchTerm )
    );
  }, [ searchTerm, customerApplication ] );

  useEffect( () => {
    return () => {
      dispatch( resetCustomerApplications() ) as unknown as void;
    };
  }, [ dispatch ] );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            height: "7vh",
            width: isMobile ? "40vw" : isTab ? "40vw" : "22vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            color: "#f06292",
            "&:hover": {
              color: "#9D50BB",
            },
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: isMobile ? ".8rem" : isTab ? "1.9rem" : "1.8rem",
            }}
          >
            Fresh Applications: {customerApplication?.count || 0}
          </Typography>
        </Box>
        <Box
          sx={{
            height: "10vh",
            width: isMobile ? "61vw" : isTab ? "50vw" : "70%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            ml: isMobile ? "" : isTab ? "" : "3vw",
          }}
        >
          <TextField
            label="Search by name or number..."
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
                width: "15vw",
              },
            }}
            InputLabelProps={{
              style: {
                color: "#757575",
              },
            }}
          />
          <Link href="/ticket" passHref>
            <Button
              sx={{
                width: isMobile ? "20vw" : isTab ? "18vw" : "12vw",
                fontSize: isMobile ? ".5rem" : isTab ? "1rem" : "",
                bgcolor: "#f06292",
                color: "white",
                "&:hover": {
                  bgcolor: "#9D50BB",
                  color: "white",
                },
              }}
              variant="contained"
            >
              {decodedToken()?.role === "admin" || decodedToken()?.role === "sales"
                ? "Show Tickets"
                : "Show My Tickets"}
            </Button>
          </Link>

          {decodedToken()?.role === "sales" ?
            <Link href="/home/create" passHref>
              <Button
                sx={{
                  width: isMobile ? "23vw" : isTab ? "21vw" : "20vw",
                  fontSize: isMobile ? ".5rem" : isTab ? "1rem" : "",
                  bgcolor: "#9D50BB",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#f06292"
                  },
                }}
                onClick={() => {
                  remLocalStorage( "customerInfo" );
                }}
                variant="contained"
              >
                Create New Application
              </Button>
            </Link>
            : null}
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
              {filteredCustomers.map( ( customerApplication ) => (
                <ApplicationCard
                  key={customerApplication.applicationId}
                  customerApplication={customerApplication}
                  refetch={refetch}
                  showDeleteButton={isAdmin}
                  onDelete={openDeleteDialog}
                  isApplication={true}
                  handleDeleteApplication={handleDeleteApplication}
                />
              ) )}

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

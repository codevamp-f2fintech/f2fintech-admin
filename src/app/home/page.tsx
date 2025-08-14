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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper, // Added missing import
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
import TableViewIcon from "@mui/icons-material/TableView";

const ITEMS_PER_PAGE = 6;

const Home: React.FC = () => {
  const [ searchTerm, setSearchTerm ] = useState<string>( "" );
  const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState<string>( "" );
  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ hasMoreData, setHasMoreData ] = useState<boolean>( true );
  const [ isSearching, setIsSearching ] = useState<boolean>( false );
  const [ deleteDialog, setDeleteDialog ] = useState( {
    open: false,
    applicationId: null,
    customerName: "",
  } );
  const [ isDeleting, setIsDeleting ] = useState<boolean>( false );
  const [ toggleListView, setToggleListView ] = useState( 'table' );
  const [ prevSearchTerm, setPrevSearchTerm ] = useState<string>( "" );

  const { customerApplication } = useSelector(
    ( state: RootState ) => state.customerApplications
  );
  const dispatch: AppDispatch = useDispatch();
  const { debounceScroll, decodedToken, remLocalStorage } = Utility();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );
  const salesUserId =
    decodedToken()?.role === "sales" ? decodedToken()?.id : null;

  const userRole = decodedToken()?.role;
  const isAdmin = userRole === "admin";

  // Debounce search term
  useEffect( () => {
    setIsSearching( true );
    const handler = setTimeout( () => {
      setDebouncedSearchTerm( searchTerm );
      setCurrentPage( 1 );
      setIsSearching( false );
    }, 500 );

    return () => {
      clearTimeout( handler );
    };
  }, [ searchTerm ] );

  const {
    value: data,
    swrLoading,
    error,
    refetch,
  } = useGetCustomerApplications(
    "get-customer-loan-applications",
    currentPage,
    ITEMS_PER_PAGE,
    salesUserId,
    debouncedSearchTerm
  );

  // Fetch and update state with new data
  useEffect( () => {
    if ( !data || !data.results ) return;

    // Check if search term changed (new search)
    const isNewSearch = debouncedSearchTerm !== prevSearchTerm;

    if ( isNewSearch )
    {
      // Reset data for new search
      dispatch( resetCustomerApplications() );
      setPrevSearchTerm( debouncedSearchTerm );
    }

    if ( data.results.length > 0 )
    {
      dispatch( setCustomerApplications( { ...data, currentPage } ) )
      setHasMoreData( data.results.length === ITEMS_PER_PAGE );
    } else
    {
      if ( currentPage === 1 || isNewSearch )
      {
        dispatch( resetCustomerApplications() );
      }
      setHasMoreData( false );
    }
  }, [ data?.results?.length, currentPage, debouncedSearchTerm ] );

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll( () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
      if ( nearBottom && !swrLoading && hasMoreData && !debouncedSearchTerm )
      {
        setCurrentPage( ( prevPage ) => prevPage + 1 );
      }
    }, 500 ),
    [ swrLoading, hasMoreData, debouncedSearchTerm ]
  );

  useEffect( () => {
    window.addEventListener( "scroll", handleScroll );
    return () => window.removeEventListener( "scroll", handleScroll );
  }, [ handleScroll ] );

  useEffect( () => {
    return () => {
      dispatch( resetCustomerApplications() ) as unknown as void;
    };
  }, [ dispatch ] );

  // Remove client-side filtering since we're doing it on the backend now
  const filteredCustomers = useMemo( () => {
    return customerApplication?.results || [];
  }, [ customerApplication ] );

  // Delete application function
  const handleDeleteApplication = async (
    applicationId: string,
    customerName: string,
    reason: string
  ) => {
    setIsDeleting( true );
    try
    {
      const token = localStorage.getItem( "token" );
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_API_URL }/delete-loan-application/${ applicationId }`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ token }`,
          },
        }
      );

      if ( !response.ok )
      {
        const errorData = await response.json();
        throw new Error( errorData.message || "Failed to delete application" );
      }

      setDeleteDialog( { open: false, applicationId: null, customerName: "" } );
      window.location.reload();
    } catch ( error )
    {
      console.error( "Error deleting application:", error );
    } finally
    {
      setIsDeleting( false );
      setDeleteDialog( { open: false, applicationId: null, customerName: "" } );
    }
  };

  const openDeleteDialog = ( applicationId: string, customerName: string ) => {
    if ( !isAdmin )
    {
      console.warn( "Only admin users can delete applications" );
      return;
    }

    setDeleteDialog( {
      open: true,
      applicationId,
      customerName,
    } );
  };

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
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          alignItems: "center",
          gap: { xs: 2, md: 0 },
        }}
      >
        <Box
          sx={{
            height: { xs: "6vh", md: "7vh" },
            width: { xs: "100%", md: "22vw" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            color: "#000",
            "&:hover": { color: "#403d39" },
            gap: 4,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "semibold",
              fontSize: { xs: "1.5rem", md: "1.7rem" },
              whiteSpace: "nowrap",
            }}
          >
            Fresh Applications: {customerApplication?.count || 0}
          </Typography>
          {/* Search field for mobile */}
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
              label="Search by name, number or PAN..."
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
                  width: { xs: "100%", md: "15vw" },
                },
              }}
              InputLabelProps={{
                style: { color: "#757575" },
              }}
            />
          </Box>
        </Box>

        {/* Right Side Controls */}
        <Box
          sx={{
            height: { xs: "auto", md: "10vh" },
            width: { xs: "100%", md: "70%" },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 2, md: 0 },
            ml: { xs: 0, md: "3vw" },
          }}
        >
          {/* Search field for desktop */}
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
              label="Search by name, number or PAN..."
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
                  width: { xs: "100%", md: "15vw" },
                },
              }}
              InputLabelProps={{
                style: { color: "#757575" },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Link href="/ticket" passHref>
              <Button
                sx={{
                  width: { xs: "100%", md: "12vw" },
                  fontSize: { xs: "0.7rem", md: "1rem" },
                  bgcolor: "#0c66e4",
                  color: "white",
                  "&:hover": { bgcolor: "#0c66e4" },
                  whiteSpace: "nowrap",
                }}
                variant="contained"
              >
                {decodedToken()?.role === "admin" ||
                  decodedToken()?.role === "sales"
                  ? "Show Tickets"
                  : "Show My Tickets"}
              </Button>
            </Link>

            {/* View toggle buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                padding: "4px",
                backgroundColor: "#fafafa",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
                width: "fit-content",
                height: { md: "7vh", sm: "4vh", xs: "4.5vh" },
              }}
            >
              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setToggleListView( 'grid' )}
                  sx={{
                    color: toggleListView === 'grid' ? "#1d86ff" : "#9e9e9e",
                    backgroundColor: toggleListView === 'grid' ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="List View">
                <IconButton
                  onClick={() => setToggleListView( 'list' )}
                  sx={{
                    color: toggleListView === 'list' ? "#1d86ff" : "#9e9e9e",
                    backgroundColor: toggleListView === 'list' ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Table View">
                <IconButton
                  onClick={() => setToggleListView( 'table' )}
                  sx={{
                    color: toggleListView === 'table' ? "#1d86ff" : "#9e9e9e",
                    backgroundColor: toggleListView === 'table' ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <TableViewIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {decodedToken()?.role === "sales" && (
              <Link href="/home/create" passHref>
                <Button
                  sx={{
                    width: "auto",
                    fontSize: isTab ? "1rem" : "",
                    bgcolor: "#0c66e4",
                    color: "white",
                    "&:hover": { bgcolor: "#0c66e4" },
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => remLocalStorage( "customerInfo" )}
                  variant="contained"
                >
                  Create Application
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          minWidth: "80vw",
          minHeight: "90vh",
          marginTop: "7vh",
        }}
      >
        {error && (
          <Typography color="error" sx={{ textAlign: "center", mt: 2 }}>
            Error loading applications: {error.message}
          </Typography>
        )}

        {isSearching ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "10vh",
            }}
          >
            <Typography>Searching...</Typography>
          </Box>
        ) : !filteredCustomers?.length ? (
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
              {searchTerm
                ? "No applications match your search criteria"
                : "No Applications Found..."}
            </Typography>
          </Box>
        ) : (
          <>
                {toggleListView === 'table' ? (
                  <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table sx={{
                      tableLayout: "auto",
                      '& .MuiTableCell-root': {
                        padding: '8px' // Adjust padding if needed
                      }
                    }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#3f50b5"}}>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Contact</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Provider</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Tenure</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 'bold',color: "white",fontSize: "1rem,wordWrap: 'break-word'" }}>Created At</TableCell>
                          <TableRow sx={{
                            backgroundColor: "#3f50b5",
                            '& td': { borderBottom: 'none' },
                            borderBottom: 'none'
                          }}>
                            {userRole !== 'sales' ? (
                              <TableCell sx={{
                                fontWeight: 'bold',
                                color: "white",
                                fontSize: ".9rem",
                                wordWrap: 'break-word',
                                borderBottom: 'none'
                              }}>Actions</TableCell>
                            ) : null}
                          </TableRow>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCustomers.map( ( customerApplication ) => (
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
                        ) )}
                      </TableBody>
                    </Table>
                  </TableContainer>
            ) : (
              // List View - You can implement a different list component here
              <Grid container spacing={2}>
                {filteredCustomers.map( ( customerApplication ) => (
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
                ) )}
              </Grid>
            )}

            {!hasMoreData && !swrLoading && (
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  mt: 4,
                  color: "black",
                }}
              >
                No more applications to load...
              </Typography>
            )}
          </>
        )}
      </Box>
      {( swrLoading || isDeleting ) && <Loader />}
    </Box>
  );
};

export default Home;
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { axiosInstance } from "../../apis/config/axiosConfig";
import { CompanyAPI } from "@/apis/CompanyAPI";

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
  const [ toggleListView, setToggleListView ] = useState( "table" );
  const [ prevSearchTerm, setPrevSearchTerm ] = useState<string>( "" );

  const { customerApplication } = useSelector(
    ( state: RootState ) => state.customerApplications
  );
  const dispatch: AppDispatch = useDispatch();
  const { debounceScroll, decodedToken, remLocalStorage } = Utility();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );

  // Get user info from token
  const userInfo = decodedToken();
  const salesUserId = userInfo?.role === "sales" ? userInfo?.id : null;
  const userRole = userInfo?.role;
  const userCompanyId = userInfo?.company_id || userInfo?.companyId; // Support both naming conventions
  const isAdmin = userRole === "admin";
  const isSuperAdmin = userRole === "super admin";

  const [ companies, setCompanies ] = useState( [] );
  const [ selectedCompany, setSelectedCompany ] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem( "selectedCompanyId" ) || ""
      : ""
  );

  // Sync with global company selection
  useEffect( () => {
    const handleGlobalCompanyChange = ( event: any ) => {
      console.log( "Dashboard received companyChanged event:", event.detail );
      setSelectedCompany( event.detail );
      window.location.reload();
    };

    window.addEventListener( "companyChanged", handleGlobalCompanyChange );
    return () => window.removeEventListener( "companyChanged", handleGlobalCompanyChange );
  }, [] );

  const fetchCompanies = useCallback( async () => {
    try
    {
      const res = await CompanyAPI.getAll( {
        page: 1,
        limit: 100
      } );

      setCompanies( res.data.results || [] );
    } catch ( error )
    {
      console.error( "Failed to load companies", error );
    }
  }, [] );

  useEffect( () => {
    fetchCompanies();
  }, [ fetchCompanies ] );

  // useEffect(() => {
  //   dispatch(resetCustomerApplications());
  //   setCurrentPage(1);
  //   setHasMoreData(true);
  // }, [selectedCompany]);

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
      dispatch( setCustomerApplications( { ...data, currentPage } ) );
      setHasMoreData( data.results.length === ITEMS_PER_PAGE );
    } else
    {
      if ( currentPage === 1 || isNewSearch )
      {
        dispatch( resetCustomerApplications() );
      }
      setHasMoreData( false );
    }
  }, [ data?.results?.length, currentPage, debouncedSearchTerm, selectedCompany ] );

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

  // Filter applications by company ID - Only show applications with same company_id as logged-in user
  const filteredCustomers = useMemo( () => {
    const allApplications = customerApplication?.results || [];

    // If user is admin or super admin, show all applications
    if ( userRole === "admin" || userRole === "super admin" )
    {
      return allApplications;
    }

    // For other roles, filter by company_id (support both snake_case and camelCase)
    return allApplications.filter( application =>
      ( ( application as any ).company_id === userCompanyId ) ||
      ( application.companyId === userCompanyId )
    );
  }, [ customerApplication, userRole, userCompanyId ] );

  // Update the count display to show filtered count
  const displayCount = useMemo( () => {
    if ( userRole === "admin" || userRole === "super admin" )
    {
      return customerApplication?.count || 0;
    }
    return filteredCustomers.length;
  }, [ customerApplication?.count, filteredCustomers.length, userRole ] );

  // Delete application function using axios
  const handleDeleteApplication = async (
    applicationId: string,
    customerName: string,
    reason: string
  ) => {
    setIsDeleting( true );
    try
    {
      await axiosInstance.delete( `/delete-loan-application/${ applicationId }` );

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
    if ( !isAdmin && !isSuperAdmin )
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
            Fresh Applications: {displayCount}
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
            {/* <FormControl
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
              size="small"
            >
              <InputLabel id="company-select-label">
                Company
              </InputLabel>

              <Select
                labelId="company-select-label"
                value={selectedCompany}
                label="Company"
                onChange={( e ) => {
                  const value = e.target.value;
                  setSelectedCompany( value );

                  if ( !value )
                  {
                    // ALL companies
                    localStorage.removeItem( "selectedCompanyId" );
                  } else
                  {
                    localStorage.setItem( "selectedCompanyId", value );
                    refetch();
                  }
                }}
              >
                {companies?.map( ( company: any, index: number ) => (
                  <MenuItem
                    key={company.id || `company-${ index }`}
                    value={company.companyId ? company.companyId.toString() : ""}
                  >
                    {company.name}
                  </MenuItem>
                ) )}
              </Select>
            </FormControl> */}

            <Link href="/ticket" passHref>
              <Button
                sx={{
                  width: { xs: "100%", md: "auto" },
                  fontSize: { xs: "0.7rem", md: "1rem" },
                  bgcolor: "#0c66e4",
                  color: "white",
                  "&:hover": { bgcolor: "#0c66e4" },
                  whiteSpace: "nowrap",
                }}
                variant="contained"
              >
                {userRole === "admin" || userRole === "sales" || userRole === "super admin"
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
                padding: "3px",
                backgroundColor: "#fafafa",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
                width: "fit-content",
                height: { md: "7vh", sm: "4vh", xs: "4.5vh" },
              }}
            >
              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setToggleListView( "grid" )}
                  sx={{
                    color: toggleListView === "grid" ? "#1d86ff" : "#9e9e9e",
                    backgroundColor:
                      toggleListView === "grid" ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="List View">
                <IconButton
                  onClick={() => setToggleListView( "list" )}
                  sx={{
                    color: toggleListView === "list" ? "#1d86ff" : "#9e9e9e",
                    backgroundColor:
                      toggleListView === "list" ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Table View">
                <IconButton
                  onClick={() => setToggleListView( "table" )}
                  sx={{
                    color: toggleListView === "table" ? "#1d86ff" : "#9e9e9e",
                    backgroundColor:
                      toggleListView === "table" ? "#e3f2fd" : "transparent",
                    borderRadius: "6px",
                    margin: "2px",
                  }}
                >
                  <TableViewIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {userRole === "sales" && (
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
            {toggleListView === "table" ? (
              <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflowX: "auto",
                  width: "100%",
                  maxWidth: {
                    xs: "90vw",
                    md: "100vw",
                    sm: "90vw",
                    lg: "100vw",
                  },
                }}
              >
                <Table
                  sx={{
                    tableLayout: "auto",
                    minWidth: { xs: 650, sm: 750, md: 900 },
                    "& .MuiTableCell-root": {
                      padding: { xs: "4px", sm: "6px", md: "8px" },
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                      wordWrap: "break-word",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: { xs: "80px", sm: "120px", md: "150px" },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#3f50b5" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "white",
                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.875rem",
                            md: "1rem",
                          },
                          wordWrap: "break-word",
                          minWidth: { xs: "60px", sm: "80px", md: "10px" },
                        }}
                      >
                        S.no
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "white",
                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.875rem",
                            md: "1rem",
                          },
                          wordWrap: "break-word",
                          minWidth: { xs: "60px", sm: "80px", md: "100px" },
                        }}
                      >
                        Name
                      </TableCell>
                      {userRole !== "sales" && (
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "white",
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.875rem",
                              md: "1rem",
                            },
                            wordWrap: "break-word",
                            minWidth: { xs: "80px", sm: "100px", md: "120px" },
                          }}
                        >
                          E-mail
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Provider</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Loan Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Tenure</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem,wordWrap: 'break-word'" }}>Application Date</TableCell>
                      <TableRow sx={{
                        backgroundColor: "#3f50b5",
                        '& td': { borderBottom: 'none' },
                        borderBottom: 'none',
                      }}>
                        {userRole !== 'sales' ? (
                          <TableCell sx={{
                            fontWeight: 'bold',
                            color: "white",
                            fontSize: ".9rem",
                            wordWrap: 'break-word',
                            borderBottom: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', ml: "1.5vw"
                          }}>Actions</TableCell>
                        ) : null}
                      </TableRow>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.map( ( customerApplication, index ) => (
                      <ApplicationCard
                        key={customerApplication.applicationId}
                        customerApplication={customerApplication}
                        mainIndex={index + 1}
                        refetch={refetch}
                        showDeleteButton={isAdmin || isSuperAdmin}
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
                {filteredCustomers.map( ( customerApplication, index ) => (
                  <ApplicationCard
                    key={customerApplication.applicationId}
                    customerApplication={customerApplication}
                    mainIndex={index + 1}
                    refetch={refetch}
                    showDeleteButton={isAdmin || isSuperAdmin}
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
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Pagination,
  InputAdornment,
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
} from "@mui/icons-material";
import WcIcon from "@mui/icons-material/Wc";
import BusinessIcon from '@mui/icons-material/Business';

import FormComponent from "./FormInModal";
import type { AppDispatch, RootState } from "@/redux/store";
import type { User, UserData } from "@/types/user";
import { setUsers } from "@/redux/features/userSlice";
import { useGetUsers } from "@/hooks/user";
import { UserAPI } from "@/apis/UserAPI";
import { Utility } from "@/utils";
import Link from "next/link";
import Toast from "../components/common/Toast";
import { getCompanyId, getUserRole } from "@/utils/cookies";

interface UsersPageProps {
  initialData: User;
}

const ITEMS_PER_PAGE = 10;

const UsersPage: React.FC<UsersPageProps> = ( { initialData } ) => {
  const [ openDialog, setOpenDialog ] = useState( false );
  const [ updatePassword, setUpdatePassword ] = useState( false );
  const [ selectedUserId, setSelectedUserId ] = useState<string | null>( null );
  const [ searchTerm, setSearchTerm ] = useState<string>( "" );
  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ showInactive, setShowInactive ] = useState<boolean>( false );
  const [ inactiveUsers, setInactiveUsers ] = useState<User | null>( null );
  const [ loadingInactive, setLoadingInactive ] = useState<boolean>( false );
  const [ currentUserRole, setCurrentUserRole ] = useState<string>( "" );
  const [ currentUserCompanyId, setCurrentUserCompanyId ] = useState<string>( "" );
  const { user: reduxUsers, reduxLoading } = useSelector( ( state: RootState ) => state.user );

  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const [ companyId, setCompanyId ] = useState<string | null>( null );

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, toastAndNavigate } = Utility();

  // Initialize user role and company ID
  useEffect( () => {
    const role = getUserRole();
    const companyId = getCompanyId();
    setCurrentUserRole( role || "" );
    // setCurrentUserCompanyId( companyId || "" );
    setCompanyId( companyId );
  }, [] );

  // Initialize Redux with initial data
  useEffect( () => {
    if ( initialData?.data?.results && companyId )
    {
      dispatch( setUsers( initialData.data ) );
    }
  }, [ initialData?.data?.results, companyId, dispatch ] );



  const {
    value: data,
    swrLoading,
    refetch,
  } = useGetUsers(
    initialData as User,
    "get-users",
    currentPage,
    ITEMS_PER_PAGE,
    // companyId 
  );

  // Update Redux when SWR data changes
  useEffect( () => {
    if ( data?.data?.results )
    {
      dispatch( setUsers( data.data ) );
    }
  }, [ data?.data?.results, dispatch ] );

  // Get current users to display based on toggle state
  const currentUsersData = useMemo( () => {
    if ( showInactive )
    {
      return inactiveUsers?.data?.results || [];
    }
    return reduxUsers?.results || initialData?.data?.results || [];
  }, [ showInactive, inactiveUsers, reduxUsers, initialData?.data?.results ] );

  // Fixed role filtering
  const filteredUsersByRole = useMemo( () => {
    console.log( "Current Users Data for filtering:", currentUsersData );

    if ( !currentUsersData || !Array.isArray( currentUsersData ) || currentUsersData.length === 0 )
    {
      return [];
    }

    return currentUsersData.filter( ( user: UserData ) => {
      // Ensure user has required properties
      if ( !user || !user.role ) return false;

      // Super Admin can only see Admin users
      if ( currentUserRole === 'super admin' )
      {
        return user.role === 'admin';
      }

      // Admin can see all users of their company except Super Admin
      if ( currentUserRole === 'admin' )
      {
        // const isSameCompany = user.companyId?.toString() === currentUserCompanyId;
        const isNotSuperAdmin = user.role !== 'super admin';
        // return isSameCompany && isNotSuperAdmin;
      }

      // Sub Admin can see all users of their company except Super Admin
      if ( currentUserRole === 'sub admin' )
      {
        const isSameCompany = user.companyId?.toString() === currentUserCompanyId;
        const isNotSuperAdmin = user.role !== 'super admin';
        return isSameCompany && isNotSuperAdmin;
      }

      // Default: show all users (for other roles)
      return true;
    } );
  }, [ currentUsersData, currentUserRole, currentUserCompanyId ] );


  // Function to fetch inactive users
  const fetchInactiveUsers = useCallback( async () => {
    try
    {
      setLoadingInactive( true );
      const { getCookies } = Utility();
      const cookieStore = getCookies() as {
        token?: string;
        companyId?: string;
        userRole?: string;
      };

      const companyId = cookieStore.companyId;

      const response = await UserAPI.getInactiveUsers(
        currentPage,
        ITEMS_PER_PAGE,
      ); // You'll need to add this method
      setInactiveUsers( response.data );
    } catch ( err: any )
    {
      const errorMessage =
        err?.response?.data?.message ||
        "Error fetching inactive users. Please Try Again";
      toastAndNavigate( dispatch, true, "error", errorMessage );
    } finally
    {
      setLoadingInactive( false );
    }
  }, [ currentPage, dispatch, toastAndNavigate ] );

  // Handle toggle between active and inactive users
  const handleToggleUsers = useCallback( async () => {
    if ( !showInactive )
    {
      // Switching to inactive users
      await fetchInactiveUsers();
    }
    setShowInactive( !showInactive );
    setSearchTerm( "" ); // Clear search when toggling
    setCurrentPage( 1 ); // Reset to first page
  }, [ showInactive, fetchInactiveUsers ] );



  const filteredUsers = useMemo( () => {
    return filteredUsersByRole.filter( ( val: any ) =>
      val.username?.toLowerCase().includes( searchTerm.toLowerCase() )
    );
  }, [ searchTerm, filteredUsersByRole ] );

  const handleUserDelete = useCallback( async ( id: string | number ) => {
    try
    {
      await UserAPI.updateUserProfile( { id, status: "inactive" } );
      const updatedUsers = await refetch();
      if ( updatedUsers )
      {
        dispatch( setUsers( updatedUsers.data ) );
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "User Deleted Successfully",
          null,
          null,
          true
        );
      }
    } catch ( err: any )
    {
      const errorMessage =
        err?.response?.data?.message || "Error Occurred. Please Try Again";
      toastAndNavigate( dispatch, true, "error", errorMessage );
    }
  }, [] );

  // Function to restore inactive user
  const handleUserRestore = useCallback(
    async ( id: string | number ) => {
      try
      {
        await UserAPI.updateUserProfile( { id, status: "active" } );
        // Refresh inactive users list
        await fetchInactiveUsers();
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "User Restored Successfully",
          null,
          null,
          true
        );
      } catch ( err: any )
      {
        const errorMessage =
          err?.response?.data?.message ||
          "Error restoring user. Please Try Again";
        toastAndNavigate(
          dispatch,
          true,
          "error",
          errorMessage,
          null,
          null,
          true
        );
      }
    },
    [ fetchInactiveUsers, dispatch, toastAndNavigate ]
  );

  const handleOpenDialog = ( userId: string | null = null ) => {
    setSelectedUserId( userId );
    setUpdatePassword( false );
    setOpenDialog( !openDialog );
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage( page );
  };

  // Effect to refetch inactive users when page changes and showing inactive users
  useEffect( () => {
    if ( showInactive && currentPage > 1 )
    {
      fetchInactiveUsers();
    }
  }, [ currentPage, showInactive, fetchInactiveUsers ] );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        // px: { xs: 2, sm: 4 },
      }}
    >
      <Container sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
            width: "100%",
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
              sx: {
                borderRadius: "100px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "& fieldset": { border: "none" },
                width: { xs: "100%", sm: "280px", md: "320px" },
                color: "black",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap", // allow wrapping on small screens
              justifyContent: { xs: "center", sm: "flex-end" }, // center on mobile, right align on bigger screens
              width: "100%",
              gap: 2,
            }}
          >
            {/* Show Create button only for active users */}
            {!showInactive && (
              <Button
                variant="contained"
                startIcon={<PersonAddRounded />}
                onClick={() => handleOpenDialog( null )}
                sx={{
                  borderRadius: "100px",
                  px: { xs: 2, sm: 3 }, // smaller padding on mobile
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  bgcolor: "#0c66e4",
                  color: "white",
                  // remove ml (non-responsive), instead use flex/grid
                  width: { xs: "100%", sm: "auto" }, // full width on mobile, auto on desktop
                  "&:hover": {
                    bgcolor: "#0c66e4",
                    color: "white",
                  },
                }}
              >
                Create New User
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={
                showInactive ? <PersonRounded /> : <PersonOffRounded />
              }
              onClick={handleToggleUsers}
              disabled={loadingInactive}
              sx={{
                borderRadius: "100px",
                px: { xs: 2, sm: 3 },
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                color: "#0c66e4",
                borderColor: "#0c66e4",
                width: { xs: "100%", sm: "auto" }, // full width on small devices
                "&:hover": {
                  bgcolor: "#f0f4ff",
                  borderColor: "#0c66e4",
                },
              }}
            >
              {loadingInactive ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : null}
              {showInactive ? "View Active Users" : "View Inactive Users"}
            </Button>
          </Box>
        </Box>

        {/* Display current view title */}
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "#33415c",
          }}
        >
          {showInactive ? "Inactive Users" : "Active Users"}
        </Typography>

        {/* User Grid */}
        <Grid container spacing={3}>
          {filteredUsers.length > 0 &&
            filteredUsers.map( ( user: UserData, index: number ) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: 4,
                    backgroundImage: showInactive
                      ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                      : "linear-gradient(135deg, #fff 0%, #fff 100%)",
                    backgroundBlendMode: "multiply, screen, normal",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    opacity: showInactive ? 0.8 : 1,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, color: "red" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ color: "black", fontWeight: 600, mb: 1 }}
                        >
                          {capitalizeFirstLetter( user.username )}
                          {showInactive && (
                            <Chip
                              label="Inactive"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: "#dc3545",
                                color: "white",
                              }}
                            />
                          )}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <MailRounded
                            sx={{
                              color: "#33415c",
                              fontSize: 18,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#33415c",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PersonAddRounded
                            sx={{
                              color: "#33415c",
                              fontSize: 18,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#33415c",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.role}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <BusinessIcon
                            sx={{
                              color: "#33415c",
                              fontSize: 18,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#33415c",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.companyName || "N/A"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <WcIcon
                            sx={{
                              color: "#33415c",
                              fontSize: 18,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#33415c",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.gender}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          icon={
                            <PersonRounded sx={{ color: "#fff !important" }} />
                          }
                          label={capitalizeFirstLetter( user.gender )}
                          sx={{
                            bgcolor: "#0c66e4",
                            color: "#fff",
                            borderRadius: "100px",
                            "& .MuiChip-icon": { color: "white" },
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "#adb5bd",
                          width: 48,
                          height: 48,
                        }}
                      >
                        {user.username.charAt( 0 )}
                      </Avatar>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {showInactive ? (
                          <Tooltip title="Restore User">
                            <IconButton
                              size="small"
                              sx={{
                                color: "white",
                                bgcolor: "#28a745",
                                "&:hover": { bgcolor: "#218838" },
                              }}
                              onClick={() => handleUserRestore( user.id )}
                            >
                              <PersonAddRounded />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                sx={{
                                  color: "white",
                                  bgcolor: "#adb5bd",
                                  "&:hover": { bgcolor: "#33415c" },
                                }}
                                onClick={() => handleOpenDialog( user.id )}
                              >
                                <EditRounded />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small"
                                sx={{
                                  color: "white",
                                  bgcolor: "#adb5bd",
                                  "&:hover": { bgcolor: "#33415c" },
                                }}
                                onClick={() => handleUserDelete( user.id )}
                              >
                                <DeleteRounded />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) )}
        </Grid>

        {/* Show message when no users found */}
        {filteredUsers.length === 0 && !loadingInactive && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No {showInactive ? "inactive" : "active"} users found
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={
                showInactive
                  ? inactiveUsers?.pages || 1
                  : data?.pages || initialData?.pages || 1
              }
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Container>

      {reduxLoading || swrLoading || loadingInactive ? (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      ) : null}

      {/* Only show form for active users */}
      {!showInactive && (
        <FormComponent
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          updatePassword={updatePassword}
          setUpdatePassword={setUpdatePassword}
          userId={selectedUserId}
          refetch={refetch}
          setUsers={setUsers}
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
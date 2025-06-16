"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";

import ApplicationCard from "../components/common/ApplicationCard";
import FilterPanel from "../components/common/FilterPanel";
import Loader from "../components/common/Loader";
import { useDeleteTicket, useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import type { Ticket } from "@/types/ticket";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTickets, resetTickets } from "@/redux/features/ticketSlice";

const Ticket = () => {
  const [ filter, setFilter ] = useState<string>( "" );
  const [ selectedUser, setSelectedUser ] = useState<any | null>( null );
  const [ sortBy, setSortBy ] = useState<string>( "all" );
  const [ startDate, setStartDate ] = useState<string | null>( null );
  const [ endDate, setEndDate ] = useState<string | null>( null );
  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ hasMoreData, setHasMoreData ] = useState<boolean>( true );
  const [ isInitialized, setIsInitialized ] = useState<boolean>( false );

  const { ticket } = useSelector( ( state: RootState ) => state.tickets );
  const { deleteTicket, error, loading } = useDeleteTicket();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );
  const ITEMS_PER_PAGE = 6;

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { debounceScroll, decodedToken } = Utility();
  const userRole = decodedToken()?.role;

  // Enhanced API endpoint memoization with better error handling
  const apiEndpoint = React.useMemo( () => {
    const formatStatus = ( status: string ) => {
      if ( status === 'forwarded to me' || status === 'forwarded by me' )
      {
        return status.replace( /\s+/g, "" );
      }
      return status;
    };

    console.log( "Building API endpoint with:", {
      selectedUser: selectedUser?.id,
      userRole,
      sortBy,
      isInitialized
    } );

    if ( selectedUser?.id )
    {
      return `get-all-tickets/${ selectedUser.id }`;
    }

    const baseParams = new URLSearchParams();

    try
    {
      const decodedUserToken = decodedToken();
      const userId = decodedUserToken?.id;

      switch ( userRole )
      {
        case "admin":
          if ( sortBy && sortBy !== "all" )
          {
            baseParams.set( "status", formatStatus( sortBy ) );
          }
          return `get-all-tickets${ baseParams.toString() ? `?${ baseParams.toString() }` : '' }`;

        case "agent":
          if ( !userId ) return "get-all-tickets";
          const agentUrl = `get-all-tickets/${ userId }`;
          baseParams.set( "isAgent", "true" );
          if ( sortBy && sortBy !== "all" )
          {
            baseParams.set( "status", formatStatus( sortBy ) );
          }
          return `${ agentUrl }?${ baseParams.toString() }`;

        case "sales":
          if ( userId )
          {
            baseParams.set( "appliedBy", userId.toString() );
          }
          if ( sortBy && sortBy !== "all" )
          {
            baseParams.set( "status", formatStatus( sortBy ) );
          }
          return `get-all-tickets?${ baseParams.toString() }`;

        default:
          return "get-all-tickets";
      }
    } catch ( error )
    {
      console.error( "Error building API endpoint:", error );
      return "get-all-tickets";
    }
  }, [ selectedUser?.id, userRole, sortBy, isInitialized ] );

  // Production debugging effect
  useEffect( () => {
    console.log( "=== PRODUCTION DEBUG ===" );
    console.log( "Environment:", process.env.NODE_ENV );
    console.log( "Current sortBy:", sortBy );
    console.log( "Current filter:", filter );
    console.log( "Selected user:", selectedUser?.id );
    console.log( "API Endpoint:", apiEndpoint );
    console.log( "Is Initialized:", isInitialized );
    console.log( "User Role:", userRole );
    console.log( "========================" );
  }, [ sortBy, filter, selectedUser, apiEndpoint, isInitialized, userRole ] );

  const { value: ticketData, swrLoading, mutate } = useGetTickets(
    apiEndpoint,
    currentPage,
    ITEMS_PER_PAGE,
    filter,
    startDate,
    endDate
  );

  const [ userData, setUserData ] = useState( {} );

  // Fetch users for admin
  useEffect( () => {
    if ( userRole === "admin" )
    {
      const fetchUsers = async () => {
        try
        {
          console.log( "Fetching users for admin..." );
          const response = await fetcher( `get-users?page=1&limit=500` );
          setUserData( response || [] );
          console.log( "Users fetched successfully:", response?.results?.length );
        } catch ( error )
        {
          console.error( "Error fetching users:", error );
        }
      };
      fetchUsers();
    }
  }, [ userRole ] );

  // Handle URL search params initialization
  useEffect( () => {
    try
    {
      const queryStatus = searchParams.get( "status" );
      console.log( "Initializing from URL - Query status:", queryStatus );

      if ( queryStatus && queryStatus !== sortBy )
      {
        console.log( "Setting sortBy from URL:", queryStatus );
        setSortBy( queryStatus );
      } else if ( !queryStatus && sortBy !== "all" )
      {
        console.log( "No URL status, setting to 'all'" );
        setSortBy( "all" );
      }

      // Mark as initialized after processing URL params
      if ( !isInitialized )
      {
        setIsInitialized( true );
      }
    } catch ( error )
    {
      console.error( "Error processing URL params:", error );
      if ( !isInitialized )
      {
        setIsInitialized( true );
      }
    }
  }, [ searchParams, isInitialized ] );

  // Enhanced filter change handler
  const handleFilterChange = useCallback( ( filterParams = {} ) => {
    console.log( "handleFilterChange called with:", filterParams );

    try
    {
      // Reset pagination and state
      setCurrentPage( 1 );
      setHasMoreData( true );
      dispatch( resetTickets() );

      // Apply individual filter updates if provided
      if ( filterParams.hasOwnProperty( 'name' ) )
      {
        const newFilter = filterParams.name || '';
        console.log( "Setting filter to:", newFilter );
        setFilter( newFilter );
      }

      if ( filterParams.hasOwnProperty( 'status' ) )
      {
        const newStatus = filterParams.status || 'all';
        console.log( "Setting sortBy to:", newStatus );
        setSortBy( newStatus );
      }

      if ( filterParams.hasOwnProperty( 'user' ) )
      {
        const newUser = filterParams.user || null;
        console.log( "Setting selectedUser to:", newUser?.id );
        setSelectedUser( newUser );
      }

      if ( filterParams.hasOwnProperty( 'startDate' ) )
      {
        const newStartDate = filterParams.startDate || null;
        console.log( "Setting startDate to:", newStartDate );
        setStartDate( newStartDate );
      }

      if ( filterParams.hasOwnProperty( 'endDate' ) )
      {
        const newEndDate = filterParams.endDate || null;
        console.log( "Setting endDate to:", newEndDate );
        setEndDate( newEndDate );
      }

      // Force SWR to revalidate with a delay to ensure state updates
      setTimeout( () => {
        if ( mutate )
        {
          console.log( "Triggering mutate after filter change" );
          mutate();
        }
      }, 200 );

    } catch ( error )
    {
      console.error( "Error in handleFilterChange:", error );
    }
  }, [ dispatch, mutate ] );

  // Enhanced sort change handler
  const handleSortChange = useCallback( ( value: string | null ) => {
    if ( !value ) return;

    console.log( "handleSortChange called with:", value );
    const sortValue = value.toLowerCase();

    try
    {
      // Update URL first (synchronous)
      const params = new URLSearchParams( searchParams.toString() );
      if ( sortValue === "all" )
      {
        params.delete( "status" );
      } else
      {
        params.set( "status", sortValue );
      }

      const newUrl = params.toString() ? `?${ params.toString() }` : window.location.pathname;
      console.log( "Updating URL to:", newUrl );

      // Use replace to update URL without navigation
      window.history.replaceState( {}, '', newUrl );

      // Update state and trigger filter change
      setSortBy( sortValue );

      // Use setTimeout to ensure state update is processed
      setTimeout( () => {
        handleFilterChange( { status: sortValue, page: 1 } );
      }, 50 );

    } catch ( error )
    {
      console.error( "Error in handleSortChange:", error );
    }
  }, [ searchParams, handleFilterChange ] );

  // Reset state when filters change - with better dependency management
  useEffect( () => {
    if ( !isInitialized ) return; // Don't run until initialized

    try
    {
      console.log( "Filter dependency effect triggered" );
      console.log( "Current values:", { sortBy, filter, selectedUser: selectedUser?.id, startDate, endDate } );

      setCurrentPage( 1 );
      setHasMoreData( true );
      dispatch( resetTickets() );

      // Add a delay before triggering mutate to ensure state is updated
      const timeoutId = setTimeout( () => {
        if ( mutate )
        {
          console.log( "Triggering mutate from dependency effect" );
          mutate();
        }
      }, 300 );

      return () => {
        clearTimeout( timeoutId );
      };
    } catch ( error )
    {
      console.error( "Error in filter dependency effect:", error );
    }
  }, [ sortBy, filter, selectedUser?.id, startDate, endDate, dispatch, mutate, isInitialized ] );

  // Update tickets in state
  useEffect( () => {
    if ( ticketData?.results?.length > 0 )
    {
      console.log( "Updating tickets with new data:", ticketData.results.length );
      console.log( "Total count:", ticketData.count );
      dispatch( setTickets( ticketData ) );
      setHasMoreData( ticketData.results.length === ITEMS_PER_PAGE );
    } else if ( ticketData?.results?.length === 0 )
    {
      console.log( "No tickets found in response" );
      setHasMoreData( false );
    }
  }, [ ticketData, dispatch ] );

  // Enhanced infinite scroll handler
  const handleScroll = useCallback(
    debounceScroll( () => {
      try
      {
        const nearBottom =
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

        if ( nearBottom && !swrLoading && hasMoreData && isInitialized )
        {
          console.log( "Loading more tickets - page:", currentPage + 1 );
          setCurrentPage( ( prevPage ) => prevPage + 1 );
        }
      } catch ( error )
      {
        console.error( "Error in scroll handler:", error );
      }
    }, 200 ),
    [ swrLoading, hasMoreData, debounceScroll, isInitialized, currentPage ]
  );

  useEffect( () => {
    if ( !isInitialized ) return;

    window.addEventListener( "scroll", handleScroll );
    return () => window.removeEventListener( "scroll", handleScroll );
  }, [ handleScroll, isInitialized ] );

  // Enhanced delete ticket handler
  const handleDeleteTicket = async ( ticketId: number ) => {
    try
    {
      console.log( "Deleting ticket:", ticketId );
      const deleteTicketResp = await deleteTicket( 'delete-ticket', ticketId );

      // Reset state and force refetch
      dispatch( resetTickets() );
      setCurrentPage( 1 );
      setHasMoreData( true );

      // Force refetch after deletion
      setTimeout( () => {
        if ( mutate )
        {
          console.log( "Triggering mutate after delete" );
          mutate();
        }
      }, 100 );

      return deleteTicketResp;
    } catch ( error )
    {
      console.error( "Error deleting ticket:", error );
      throw error;
    }
  };

  // Show loading while initializing
  if ( !isInitialized )
  {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <FilterPanel
        searchLabel="Search Tickets"
        sortBy={sortBy}
        filter={filter}
        setFilter={setFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleSortChange={handleSortChange}
        userData={{ data: userData }}
        userRole={userRole}
        ticketCount={ticketData?.count || 0}
        handleFilterChange={handleFilterChange}
      />

      <Box
        sx={{
          minWidth: "80vw",
          minHeight: "70vh",
          display: "flex",
          alignItems: isMobile ? "center" : isTab ? "center" : "flex-start",
          justifyContent: "space-between",
          paddingTop: "20px",
          marginBottom: "0",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: isMobile ? "column" : isTab ? "" : "",
          }}
        >
          {!ticket?.results?.length && !swrLoading ? (
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                mt: "20vh",
                color: "text.secondary",
              }}
            >
              {userRole === "admin" ? (
                "No Tickets Found"
              ) : (
                <Link href="/home">
                  No Tickets Found. Start Picking Some By Clicking Here!
                </Link>
              )}
            </Typography>
          ) : (
            <>
              {ticket?.results?.map( ( ticket, index ) => (
                <ApplicationCard
                  key={`${ ticket.ticketId }-${ index }-${ currentPage }`}
                  customerApplication={ticket}
                  userRole={userRole}
                  handleStartClick={() =>
                    router.push( `ticket/${ ticket.ticketId }` )
                  }
                  handleDeleteTicket={handleDeleteTicket}
                />
              ) )}

              {!hasMoreData && !swrLoading && ticket?.results?.length > 0 && (
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    mt: 5,
                    mb: 2,
                    color: "text.secondary",
                  }}
                >
                  No more tickets to load...
                </Typography>
              )}
            </>
          )}
        </Grid>
      </Box>
      {swrLoading && <Loader />}
    </Box>
  );
};

export default Ticket;
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";

import ApplicationCard from "../components/common/ApplicationCard";
import FilterPanel from "../components/common/FilterPanel";
import Loader from "../components/common/Loader";
import { useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import type { Ticket } from "@/types/ticket";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTickets, resetTickets } from "@/redux/features/ticketSlice";
import { Button } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";

const Ticket = () => {
  const [ filter, setFilter ] = useState<string>( "" );
  const [ selectedUser, setSelectedUser ] = useState<any | null>( null );
  const [ sortBy, setSortBy ] = useState<string>( "all" );
  const [ startDate, setStartDate ] = useState<string | null>( null );
  const [ endDate, setEndDate ] = useState<string | null>( null );

  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ hasMoreData, setHasMoreData ] = useState<boolean>( true );

  const { ticket } = useSelector( ( state: RootState ) => state.tickets );
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );
  const ITEMS_PER_PAGE = 6; // Number of tickets per page

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { debounceScroll, decodedToken } = Utility();
  const userRole = decodedToken()?.role;

  const apiEndpoint = selectedUser
    ? `get-all-tickets/${ selectedUser.id }`
    : userRole === "admin"
      ? sortBy === "all"
        ? `get-all-tickets`
        : `get-all-tickets?status=${ sortBy }`
      : userRole === "agent"
        ? sortBy === "all"
          ? `get-all-tickets/${ decodedToken()?.id }?isAgent=true`
          : `get-all-tickets/${ decodedToken()?.id }?isAgent=true&status=${ sortBy }`
        : userRole === "sales"
          ? sortBy === "all"
            ? `get-all-tickets`
            : `get-all-tickets?status=${ sortBy }`
          : `get-all-tickets`;

  const { value: ticketData, swrLoading } = useGetTickets(
    apiEndpoint,
    currentPage,
    ITEMS_PER_PAGE,
    filter,
    startDate,
    endDate
  );

  const [ userData, setUserData ] = useState( {} );
  useEffect( () => {
    if ( userRole === "admin" )
    {
      // Fetch user data only if user is admin
      const fetchUsers = async () => {
        try
        {
          const response = await fetcher( `get-users?page=${ 1 }&limit=${ 500 }` );
          setUserData( response || [] );
        } catch ( error )
        {
          console.error( "Error fetching users:", error );
        }
      };
      fetchUsers();
    }
  }, [ userRole ] );

  useEffect( () => {
    const queryStatus = searchParams.get( "status" );
    if ( queryStatus )
    {
      setSortBy( queryStatus );
    } else
    {
      setSortBy( "all" );
    }
  }, [ searchParams ] );

  // Reset ticket state and fetch when sortBy or other filters change
  useEffect( () => {
    setCurrentPage( 1 );
    dispatch( resetTickets() );
  }, [ sortBy, filter, selectedUser, startDate, endDate, dispatch ] );

  // Fetch and update state with new data
  useEffect( () => {
    if ( ticketData.results.length > 0 )
    {
      dispatch( setTickets( ticketData ) );
      setHasMoreData( ticketData.results.length === ITEMS_PER_PAGE );
    } else
    {
      setHasMoreData( false );
    }
  }, [ ticketData?.results, dispatch ] );

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll( () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400; // 400px threshold
      if ( nearBottom && !swrLoading && hasMoreData )
      {
        setCurrentPage( ( prevPage ) => prevPage + 1 ); // Increment page only once
      }
    }, 200 ), // Debounce delay: 200ms
    [ swrLoading, hasMoreData ]
  );

  useEffect( () => {
    window.addEventListener( "scroll", handleScroll );
    return () => window.removeEventListener( "scroll", handleScroll );
  }, [ handleScroll ] );

  const handleFilterChange = useCallback( () => {
    setCurrentPage( 1 );
    dispatch( resetTickets() );
  }, [ dispatch ] );

  const handleSortChange = ( value: string ) => {
    const sortValue = value.toLowerCase();
    setSortBy( sortValue );
    handleFilterChange();
    // Update query parameters in the URL
    const params = new URLSearchParams( searchParams );
    params.set( "status", sortValue );

    router.push( `?${ params.toString() }`, undefined, { shallow: true } );
  };

  useEffect( () => {
    return () => {
      dispatch( resetTickets() ) as unknown as void;
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
      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "row", width: "100%", justifyContent: "flex-start" }}>
        <Box>
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => router.back()}
            sx={{ mb: 2, }}
          >

          </Button>
        </Box>
        <Box sx={{ marginLeft: "13vw" }}>
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
            ticketCount={ticketData?.count}
            handleFilterChange={handleFilterChange}
          />
        </Box>
      </Box>

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
          {!ticket?.results?.length ? (
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
              {ticket.results.map( ( ticket, index ) => (
                <ApplicationCard
                  key={index}
                  customerApplication={ticket}
                  userRole={userRole}
                  handleStartClick={() =>
                    router.push( `ticket/${ ticket.ticketId }` )
                  }
                />
              ) )}

              {!hasMoreData && !swrLoading && (
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

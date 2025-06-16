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
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<string>("all");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const { ticket } = useSelector((state: RootState) => state.tickets);
  const { deleteTicket, error, loading } = useDeleteTicket();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const ITEMS_PER_PAGE = 6;

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { debounceScroll, decodedToken } = Utility();
  const userRole = decodedToken()?.role;

  // Memoize the API endpoint to prevent unnecessary re-renders
  const apiEndpoint = React.useMemo(() => {
    const formatStatus = (status: string) => {
      if (status === 'forwarded to me' || status === 'forwarded by me') {
        return status.replace(/\s+/g, "");
      }
      return status;
    };

    if (selectedUser) {
      return `get-all-tickets/${selectedUser.id}`;
    }

    const baseParams = new URLSearchParams();
    
    switch (userRole) {
      case "admin":
        if (sortBy !== "all") {
          baseParams.set("status", formatStatus(sortBy));
        }
        return `get-all-tickets${baseParams.toString() ? `?${baseParams.toString()}` : ''}`;
      
      case "agent":
        const agentUrl = `get-all-tickets/${decodedToken()?.id}`;
        baseParams.set("isAgent", "true");
        if (sortBy !== "all") {
          baseParams.set("status", formatStatus(sortBy));
        }
        return `${agentUrl}?${baseParams.toString()}`;
      
      case "sales":
        baseParams.set("appliedBy", decodedToken()?.id?.toString() || "");
        if (sortBy !== "all") {
          baseParams.set("status", formatStatus(sortBy));
        }
        return `get-all-tickets?${baseParams.toString()}`;
      
      default:
        return "get-all-tickets";
    }
  }, [selectedUser, userRole, sortBy, decodedToken]);

  // Add debug logging
  useEffect(() => {
    console.log("API Endpoint changed:", apiEndpoint);
    console.log("Current sortBy:", sortBy);
    console.log("User role:", userRole);
  }, [apiEndpoint, sortBy, userRole]);

  const { value: ticketData, swrLoading, mutate } = useGetTickets(
    apiEndpoint,
    currentPage,
    ITEMS_PER_PAGE,
    filter,
    startDate,
    endDate
  );

  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (userRole === "admin") {
      const fetchUsers = async () => {
        try {
          const response = await fetcher(`get-users?page=1&limit=500`);
          setUserData(response || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  // Handle URL search params
  useEffect(() => {
    const queryStatus = searchParams.get("status");
    console.log("Query status from URL:", queryStatus);
    
    if (queryStatus && queryStatus !== sortBy) {
      setSortBy(queryStatus);
    } else if (!queryStatus && sortBy !== "all") {
      setSortBy("all");
    }
  }, [searchParams]);

  // Reset state when filters change
  useEffect(() => {
    console.log("Resetting tickets due to filter change");
    setCurrentPage(1);
    setHasMoreData(true);
    dispatch(resetTickets());
  }, [sortBy, filter, selectedUser, startDate, endDate, dispatch]);

  // Update tickets in state
  useEffect(() => {
    if (ticketData?.results?.length > 0) {
      console.log("Updating tickets with new data:", ticketData.results.length);
      dispatch(setTickets(ticketData));
      setHasMoreData(ticketData.results.length === ITEMS_PER_PAGE);
    } else if (ticketData?.results?.length === 0) {
      console.log("No tickets found");
      setHasMoreData(false);
    }
  }, [ticketData, dispatch]);

  // Infinite scroll handler
  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
      if (nearBottom && !swrLoading && hasMoreData) {
        console.log("Loading more tickets...");
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }, 200),
    [swrLoading, hasMoreData, debounceScroll]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleFilterChange = useCallback(() => {
    console.log("Filter change triggered");
    setCurrentPage(1);
    setHasMoreData(true);
    dispatch(resetTickets());
    
    // Force SWR to revalidate
    if (mutate) {
      mutate();
    }
  }, [dispatch, mutate]);

  const handleSortChange = useCallback((value: string) => {
    console.log("Sort change triggered:", value);
    const sortValue = value.toLowerCase();
    
    // Update state
    setSortBy(sortValue);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (sortValue === "all") {
      params.delete("status");
    } else {
      params.set("status", sortValue);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
    
    // Reset and trigger refetch
    handleFilterChange();
  }, [searchParams, router, handleFilterChange]);

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      const deleteTicketResp = await deleteTicket('delete-ticket', ticketId);
      dispatch(resetTickets());
      
      // Force refetch after deletion
      if (mutate) {
        mutate();
      }
      
      return deleteTicketResp;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  };

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
        ticketCount={ticketData?.count}
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
              {ticket.results.map((ticket, index) => (
                <ApplicationCard
                  key={`${ticket.ticketId}-${index}`}
                  customerApplication={ticket}
                  userRole={userRole}
                  handleStartClick={() =>
                    router.push(`ticket/${ticket.ticketId}`)
                  }
                  handleDeleteTicket={handleDeleteTicket}
                />
              ))}

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
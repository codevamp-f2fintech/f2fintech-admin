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
  const [loanProvider, setLoanProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("all");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const { ticket } = useSelector((state: RootState) => state.tickets);
  const { deleteTicket, error, loading } = useDeleteTicket()
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const ITEMS_PER_PAGE = 6; // Number of tickets per page

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { debounceScroll, decodedToken } = Utility();
  const userRole = decodedToken()?.role;

  const apiEndpoint = selectedUser
    ? `get-all-tickets/${selectedUser.id}`
    : userRole === "admin" || userRole === "sub admin"
      ? sortBy === "all" && loanProvider === "all"
        ? `get-all-tickets`
        : `get-all-tickets?status=${sortBy == 'forwarded to me' || sortBy == 'forwarded by me' ? sortBy.replace(/\s+/g, "") : sortBy}&provider=${loanProvider}`
      : userRole === "operations" || userRole === "credit"
        ? sortBy === "all" && loanProvider === "all"
          ? `get-all-tickets/${decodedToken()?.id}`
          : `get-all-tickets/${decodedToken()?.id}?status=${sortBy == 'forwarded to me' || sortBy == 'forwarded by me' ? sortBy.replace(/\s+/g, "") : sortBy}&provider=${loanProvider}`
        : userRole === "sales"
          ? sortBy === "all" && loanProvider === "all"
            ? `get-all-tickets?appliedBy=${decodedToken()?.id}`
            : `get-all-tickets?appliedBy=${decodedToken()?.id}&status=${sortBy == 'forwarded to me' || sortBy == 'forwarded by me' ? sortBy.replace(/\s+/g, "") : sortBy}&provider=${loanProvider}`
          : `get-all-tickets`;

  const { value: ticketData, error: swrError, swrLoading } = useGetTickets(
    apiEndpoint,
    currentPage,
    ITEMS_PER_PAGE,
    filter,
    startDate,
    endDate,
  );

  const [userData, setUserData] = useState({});
  useEffect(() => {
    if (userRole === "admin") {
      // Fetch user data only if user is admin
      const fetchUsers = async () => {
        try {
          const { data } = await fetcher(`get-users?page=${1}&limit=${500}`);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  // Initialize state from URL params
  useEffect(() => {
    const queryStatus = searchParams.get("status");
    const queryProvider = searchParams.get("provider");
    const queryStartDate = searchParams.get("startDate");
    const queryEndDate = searchParams.get("endDate");
    const queryUserId = searchParams.get("userId");

    // Set all filters from URL
    setSortBy(queryStatus || "all");
    setLoanProvider(queryProvider || "all");
    setStartDate(queryStartDate || null);
    setEndDate(queryEndDate || null);

    // Set user (only for admin)
    if (queryUserId && userRole === "admin" && userData?.results) {
      const foundUser = userData.results.find(user => user.id === parseInt(queryUserId));
      setSelectedUser(foundUser || null);
    }
  }, [searchParams, userData?.results, userRole])

  // Reset ticket state and fetch when sortBy or other filters change
  useEffect(() => {
    setCurrentPage(1);
    dispatch(resetTickets());
  }, [sortBy, loanProvider, filter, selectedUser, startDate, endDate, dispatch]);

  // Fetch and update state with new data
  useEffect(() => {
    if (ticketData.results.length > 0) {
      dispatch(setTickets(ticketData));
      setHasMoreData(ticketData.results.length === ITEMS_PER_PAGE);

      // Set disbursed amount only if status is 'disbursed'
      if (sortBy === 'disbursed' && ticketData.totalDisbursedAmount) {
        setDisbursedAmount(ticketData.totalDisbursedAmount);
      } else {
        setDisbursedAmount(0);
      }
    } else {
      setHasMoreData(false);
      setDisbursedAmount(0);
      if (ticketData?.errorMessage) {
        console.error("API Error:", ticketData.errorMessage);
      }
    }
  }, [ticketData?.results, sortBy]);

  // Reset disbursed amount when status changes away from 'disbursed'
  useEffect(() => {
    if (sortBy !== 'disbursed') {
      setDisbursedAmount(0);
    }
  }, [sortBy]);

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400; // 400px threshold
      if (nearBottom && !swrLoading && hasMoreData) {
        setCurrentPage((prevPage) => prevPage + 1); // Increment page only once
      }
    }, 200), // Debounce delay: 200ms
    [swrLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // persist the filters in URL
  const handleFilterChange = useCallback((filterParams: any = {}) => {
    setCurrentPage(1);
    dispatch(resetTickets());

    // Reset disbursed amount if status is changing away from 'disbursed'
    if (filterParams.status && filterParams.status !== 'disbursed') {
      setDisbursedAmount(0);
    }

    // Update query parameters in the URL
    const params = new URLSearchParams(searchParams);

    // Handle status parameter - preserve existing if not being updated
    if (filterParams.status !== undefined) {
      if (filterParams.status && filterParams.status !== 'all') {
        params.set('status', filterParams.status);
      } else {
        params.delete('status');
      }
    }
    // If status is not being updated, preserve existing value
    else if (sortBy && sortBy !== 'all') {
      params.set('status', sortBy);
    }

    // Handle provider parameter - preserve existing if not being updated
    if (filterParams.provider !== undefined) {
      if (filterParams.provider && filterParams.provider !== 'all') {
        params.set('provider', filterParams.provider);
      } else {
        params.delete('provider');
      }
    }
    // If provider is not being updated, preserve existing value
    else if (loanProvider && loanProvider !== 'all') {
      params.set('provider', loanProvider);
    }

    // Handle startDate parameter - preserve existing if not being updated
    if (filterParams.startDate !== undefined) {
      if (filterParams.startDate) {
        params.set('startDate', filterParams.startDate);
      } else {
        params.delete('startDate');
      }
    }
    // If startDate is not being updated, preserve existing value
    else if (startDate) {
      params.set('startDate', startDate);
    }

    // Handle endDate parameter - preserve existing if not being updated
    if (filterParams.endDate !== undefined) {
      if (filterParams.endDate) {
        params.set('endDate', filterParams.endDate);
      } else {
        params.delete('endDate');
      }
    }
    // If endDate is not being updated, preserve existing value
    else if (endDate) {
      params.set('endDate', endDate);
    }

    // Handle user parameter - preserve existing if not being updated
    if (filterParams.user !== undefined) {
      if (filterParams.user) {
        params.set('userId', filterParams.user.id.toString());
      } else {
        params.delete('userId');
      }
    }
    // If user is not being updated, preserve existing value
    else if (selectedUser) {
      params.set('userId', selectedUser.id.toString());
    }

    // Handle clear all filters case
    if (Object.keys(filterParams).length === 0) {
      params.delete('status');
      params.delete('provider');
      params.delete('startDate');
      params.delete('endDate');
      params.delete('userId');
    }

    router.push(`?${params.toString()}`, { shallow: true });
  }, [searchParams, router, dispatch, sortBy, loanProvider, startDate, endDate, selectedUser]);


  const handleProviderChange = (value: string) => {
    const providerValue = value.toLowerCase();
    setLoanProvider(providerValue);
    handleFilterChange({ provider: providerValue });
  };

  const handleSortChange = (value: string) => {
    const sortValue = value.toLowerCase();
    console.log("sortValue", sortValue)
    setSortBy(sortValue);

    // Reset disbursed amount immediately if not disbursed status
    if (sortValue !== 'disbursed') {
      setDisbursedAmount(0);
    }
    handleFilterChange({ status: sortValue });
  };

  const handleDeleteTicket = async (ticketId: number) => {
    const deleteTicketResp = await deleteTicket('delete-ticket', ticketId);
    dispatch(resetTickets());
    return deleteTicketResp;
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
        loanProvider={loanProvider}
        filter={filter}
        setFilter={setFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleSortChange={handleSortChange}
        handleProviderChange={handleProviderChange}
        userData={userData}
        userRole={userRole}
        ticketCount={ticketData?.count}
        // bankCount={ticketData?.}
        disbursedAmount={disbursedAmount}
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
                  key={index}
                  customerApplication={ticket}
                  userRole={userRole}
                  handleStartClick={() =>
                    router.push(`ticket/${ticket.ticketId}`)
                  }
                  handleDeleteTicket={handleDeleteTicket}
                />
              ))}

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
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import TableViewIcon from "@mui/icons-material/TableView";

import ApplicationCard from "../components/common/ApplicationCard";
import FilterPanel from "../components/common/FilterPanel";
import Loader from "../components/common/Loader";
import { useDeleteTicket, useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import type { Ticket } from "@/types/ticket";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setTickets,
  resetTickets,
  removeTicket,
} from "@/redux/features/ticketSlice";
import { useDeleteCustomerApplication } from "@/hooks/customerApplication";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

const Ticket = () => {
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loanProvider, setLoanProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("all");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(0);
  const [toggleListView, setToggleListView] = useState('table');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const { ticket } = useSelector((state: RootState) => state.tickets);
  const { deleteTicket, error, loading } = useDeleteTicket();
  const { deleteCustomerApplication } = useDeleteCustomerApplication();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const ITEMS_PER_PAGE = 12;
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
        : `get-all-tickets?status=${sortBy == "forwarded to me" || sortBy == "forwarded by me"
          ? sortBy.replace(/\s+/g, "")
          : sortBy
        }&provider=${loanProvider}`
      : userRole === "operations" || userRole === "credit"
        ? sortBy === "all" && loanProvider === "all"
          ? `get-all-tickets/${decodedToken()?.id}`
          : `get-all-tickets/${decodedToken()?.id}?status=${sortBy == "forwarded to me" || sortBy == "forwarded by me"
            ? sortBy.replace(/\s+/g, "")
            : sortBy
          }&provider=${loanProvider}`
        : userRole === "sales"
          ? sortBy === "all" && loanProvider === "all"
            ? `get-all-tickets/${decodedToken()?.id}?appliedBy=sales`
            : `get-all-tickets/${decodedToken()?.id}?appliedBy=sales&status=${sortBy == "forwarded to me" || sortBy == "forwarded by me"
              ? sortBy.replace(/\s+/g, "")
              : sortBy
            }&provider=${loanProvider}`
          : `get-all-tickets`;

  const {
    value: ticketData,
    error: swrError,
    swrLoading,
    refetcher,
  } = useGetTickets(
    apiEndpoint,
    currentPage,
    ITEMS_PER_PAGE,
    filter,
    startDate,
    endDate
  );

  const [userData, setUserData] = useState([]);
  const pathname = usePathname();

  // Function to handle view toggle and save to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = sessionStorage.getItem('ticketViewPreference');
      if (savedView !== null) {
        try {
          const parsedView = JSON.parse(savedView);
          setToggleListView(parsedView);
        } catch (error) {
          console.error('Error parsing saved view preference:', error);
          // Fall back to default
          setToggleListView('list');
        }
      }
    }
  }, []);

  // Load view preference from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = sessionStorage.getItem('ticketViewPreference');
      if (savedView !== null) {
        setToggleListView(JSON.parse(savedView));
      }
    }
  }, []);


  useEffect(() => {
    // Fetch user data only if user is admin
    const fetchUsers = async () => {
      try {
        const { data } = await fetcher(`get-users?page=${1}&limit=${500}`);
        const sortedUsers = data?.results.sort((a, b) => {
          if (a.role < b.role) return -1;
          if (a.role > b.role) return 1;
          return 0;
        });

        setUserData(
          userRole === "admin" || userRole === "sub admin"
            ? sortedUsers
            : sortedUsers?.filter((user) => user.role === userRole)
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [userRole]);

  // Initialize state from URL params
  useEffect(() => {
    const queryStatus = searchParams.get("status");
    const queryProvider = searchParams.get("provider");
    const queryStartDate = searchParams.get("startDate");
    const queryEndDate = searchParams.get("endDate");
    const queryUserId = searchParams.get("userId");
    const queryMonth = searchParams.get("month");

    // Set all filters from URL
    setSortBy(queryStatus || "all");
    setLoanProvider(queryProvider || "all");
    setStartDate(queryStartDate || null);
    setEndDate(queryEndDate || null);

    // Set user (only for admin)
    if (queryUserId && userRole === "admin" && userData) {
      const foundUser = userData?.find(
        (user) => user.id === parseInt(queryUserId)
      );
      setSelectedUser(foundUser || null);
    }
  }, [searchParams, userData, userRole]);

  // Reset ticket state and fetch when sortBy or other filters change
  useEffect(() => {
    setCurrentPage(1);
    dispatch(resetTickets());
  }, [
    sortBy,
    loanProvider,
    filter,
    selectedUser,
    startDate,
    endDate,
    dispatch,
  ]);

  // Fetch and update state with new data
  useEffect(() => {
    if (ticketData.results.length > 0) {
      dispatch(setTickets({ ...ticketData, currentPage }));
      setHasMoreData(ticketData.results.length === ITEMS_PER_PAGE);

      // Set disbursed amount only if status is 'disbursed'
      if (sortBy === "disbursed" && ticketData.totalDisbursedAmount) {
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
  }, [ticketData.results, sortBy, ticketData]);

  // Reset disbursed amount when status changes away from 'disbursed'
  useEffect(() => {
    if (sortBy !== "disbursed") {
      setDisbursedAmount(0);
    }
  }, [sortBy]);

  // Handle infinite scrolling
  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
      if (nearBottom && !swrLoading && hasMoreData) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }, 200),
    [swrLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // persist the filters in URL
  const handleFilterChange = useCallback(
    (filterParams: any = {}) => {
      setCurrentPage(1);
      dispatch(resetTickets());

      // Reset disbursed amount if status is changing away from 'disbursed'
      if (filterParams.status && filterParams.status !== "disbursed") {
        setDisbursedAmount(0);
      }

      // Update query parameters in the URL
      const params = new URLSearchParams(searchParams);

      // Handle status parameter - preserve existing if not being updated
      if (filterParams.status !== undefined) {
        if (filterParams.status && filterParams.status !== "all") {
          params.set("status", filterParams.status);
        } else {
          params.delete("status");
        }
      }
      // If status is not being updated, preserve existing value
      else if (sortBy && sortBy !== "all") {
        params.set("status", sortBy);
      }

      // Handle provider parameter - preserve existing if not being updated
      if (filterParams.provider !== undefined) {
        if (filterParams.provider && filterParams.provider !== "all") {
          params.set("provider", filterParams.provider);
        } else {
          params.delete("provider");
        }
      }
      // If provider is not being updated, preserve existing value
      else if (loanProvider && loanProvider !== "all") {
        params.set("provider", loanProvider);
      }

      // Handle startDate parameter - preserve existing if not being updated
      if (filterParams.startDate !== undefined) {
        if (filterParams.startDate) {
          params.set("startDate", filterParams.startDate);
        } else {
          params.delete("startDate");
        }
      }
      // If startDate is not being updated, preserve existing value
      else if (startDate) {
        params.set("startDate", startDate);
      }

      // Handle endDate parameter - preserve existing if not being updated
      if (filterParams.endDate !== undefined) {
        if (filterParams.endDate) {
          params.set("endDate", filterParams.endDate);
        } else {
          params.delete("endDate");
        }
      }
      // If endDate is not being updated, preserve existing value
      else if (endDate) {
        params.set("endDate", endDate);
      }

      // Handle user parameter - preserve existing if not being updated
      if (filterParams.user !== undefined) {
        if (filterParams.user) {
          params.set("userId", filterParams.user.id.toString());
        } else {
          params.delete("userId");
        }
      }
      // If user is not being updated, preserve existing value
      else if (selectedUser) {
        params.set("userId", selectedUser.id.toString());
      }

      // Handle clear all filters case
      if (Object.keys(filterParams).length === 0) {
        params.delete("status");
        params.delete("provider");
        params.delete("startDate");
        params.delete("endDate");
        params.delete("userId");
      }

      router.push(`?${params.toString()}`, { shallow: true });
    },
    [
      searchParams,
      router,
      dispatch,
      sortBy,
      loanProvider,
      startDate,
      endDate,
      selectedUser,
    ]
  );

  const handleProviderChange = (value: string) => {
    const providerValue = value.toLowerCase();
    setLoanProvider(providerValue);
    handleFilterChange({ provider: providerValue });
  };

  const handleSortChange = (value: string) => {
    const sortValue = value.toLowerCase();
    setSortBy(sortValue);

    // Reset disbursed amount immediately if not disbursed status
    if (sortValue !== "disbursed") {
      setDisbursedAmount(0);
    }
    handleFilterChange({ status: sortValue });
  };

  const handleDeleteTicket = async (ticketId: number, reason: string) => {
    const currentUserId = decodedToken()?.id;
    const deleteTicketResp = await deleteTicket(
      "delete-ticket",
      ticketId,
      reason,
      currentUserId
    );
    setCurrentPage(1);
    window.location.reload();
    return deleteTicketResp;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        height: "100%",
        width: "100%",
        padding: { xs: "0 10px", sm: "0 15px", md: "0" },
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          p: 2,
          backgroundColor: "#cfd8dc",
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        {/* Filter Panel Container */}
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", md: "80%" },
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column-reverse",
                sm: "column-reverse",
                md: "row",
              },
              position: "relative",
              width: "100%",
              gap: 2,
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
              disbursedAmount={disbursedAmount}
              handleFilterChange={handleFilterChange}
            />
          </Box>
        </Box>

        {/* View Toggle Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            p: 0.5,
            backgroundColor: "background.default",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            width: "fit-content",
            height: { xs: "auto", md: "56px" },
            alignSelf: { xs: "flex-end", md: "center" },
            ml: "auto"
          }}
        >
          <Tooltip title="Grid View">
            <IconButton
              onClick={() => {
                setToggleListView('grid');
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('ticketViewPreference', JSON.stringify('grid'));
                }
              }}
              sx={{
                color: toggleListView === 'grid' ? "primary.main" : "action.disabled",
                backgroundColor: toggleListView === 'grid' ? "action.selected" : "transparent",
                borderRadius: "8px",
                p: 1,
                transition: "all 0.2s ease",
                '&:hover': {
                  backgroundColor: toggleListView === 'grid' ? "primary.light" : "action.hover",
                }
              }}
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="List View">
            <IconButton
              onClick={() => {
                setToggleListView('list');
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('ticketViewPreference', JSON.stringify('list'));
                }
              }}
              sx={{
                color: toggleListView === 'list' ? "primary.main" : "action.disabled",
                backgroundColor: toggleListView === 'list' ? "action.selected" : "transparent",
                borderRadius: "8px",
                p: 1,
                transition: "all 0.2s ease",
                '&:hover': {
                  backgroundColor: toggleListView === 'list' ? "primary.light" : "action.hover",
                }
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Table View">
            <IconButton
              onClick={() => {
                setToggleListView('table');
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('ticketViewPreference', JSON.stringify('table'));
                }
              }}
              sx={{
                color: toggleListView === 'table' ? "primary.main" : "action.disabled",
                backgroundColor: toggleListView === 'table' ? "action.selected" : "transparent",
                borderRadius: "8px",
                p: 1,
                transition: "all 0.2s ease",
                '&:hover': {
                  backgroundColor: toggleListView === 'table' ? "primary.light" : "action.hover",
                }
              }}
            >
              <TableViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Updated View Toggle Box with Session Storage */}

      <Box
        sx={{
          minWidth: "80vw",
          minHeight: "90vh",
          marginTop: "7vh",
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
              {toggleListView === 'table' ? (
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <TableContainer
                    component={Paper}
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      minWidth: '80vw',
                      margin: '0 auto'
                    }}
                  >
                    <Table sx={{
                      tableLayout: "auto",
                      '& .MuiTableCell-root': {
                        padding: '8px'
                      }
                    }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#3f50b5", }}>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Contact</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Provider</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Tenure</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word' }}>Created At</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: "white", fontSize: "1rem", wordWrap: 'break-word', display: 'flex', alignItems: 'center', justifyContent: 'center', border: "none" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ticket.results.map((ticket, index) => (
                          <ApplicationCard
                            key={index}
                            customerApplication={ticket}
                            userRole={userRole}
                            handleStartClick={() =>
                              router.push(`ticket/${ticket.ticketId}`)
                            }
                            handleDeleteTicket={handleDeleteTicket}
                            toggleListView={toggleListView}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {ticket.results.map((ticket, index) => (
                    <ApplicationCard
                      key={index}
                      customerApplication={ticket}
                      userRole={userRole}
                      handleStartClick={() =>
                        router.push(`ticket/${ticket.ticketId}`)
                      }
                      handleDeleteTicket={handleDeleteTicket}
                      toggleListView={toggleListView}
                    />
                  ))}
                </Grid>
              )}

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
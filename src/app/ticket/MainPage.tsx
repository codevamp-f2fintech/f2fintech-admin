"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { Dayjs } from "dayjs";

import ApplicationCard from "../components/ticket/ApplicationCard";
import FilterPanel from "../components/common/FilterPanel";
import { useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import type { Ticket } from "@/types/ticket";
import { CustomerData } from "@/types/customer";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTickets } from "@/redux/features/ticketSlice";

const Ticket = () => {
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState("to do");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { tickets } = useSelector((state: RootState) => state.ticket);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { decodedToken, setLocalStorage, remLocalStorage } = Utility();
  const userRole = decodedToken()?.role;

  const apiEndpoint = selectedUser
    ? `get-all-tickets/${selectedUser.id}`
    : userRole === "admin"
      ? sortBy === "all"
        ? `get-all-tickets`
        : `get-all-tickets?status=${sortBy}`
      : userRole === "agent"
        ? sortBy === "all"
          ? `get-all-tickets/${decodedToken()?.id}?isAgent=true`
          : `get-all-tickets/${decodedToken()?.id}?isAgent=true&status=${sortBy}`
        : `get-all-tickets`;

  const { value: ticketData } = useGetTickets(
    {} as Ticket,
    apiEndpoint,
    1, // We don't need pagination
    1000 // Fetch all tickets (or any large number)
  );

  const [userData, setUserData] = useState({});
  useEffect(() => {
    if (userRole === "admin") {
      // Fetch user data only if user is admin
      const fetchUsers = async () => {
        try {
          const response = await fetcher(`get-users?page=${1}&limit=${1000}`);
          setUserData(response || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  useEffect(() => {
    const queryStatus = searchParams.get("status");
    if (queryStatus) {
      setSortBy(queryStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    if (ticketData?.results) {
      dispatch(setTickets(ticketData));
      setFilteredApplications(ticketData?.results);
    }
  }, [ticketData?.results]);

  useEffect(() => {
    if (tickets?.results?.length) {
      dispatch(setTickets(tickets)); // Update Redux store with the latest tickets when sortBy changes
    }
  }, [sortBy, selectedUser, tickets?.results]);

  const handleStartClick = async (
    customerId: string | number,
    applicationId: string | number,
    ticketId: string | number
  ) => {
    const generatedTicketId = `F2FIN-${ticketId}`;
    remLocalStorage("ticketId");
    setLocalStorage("ticketId", generatedTicketId);
    router.push(
      `/progress?customerId=${customerId}&applicationId=${applicationId}`
    );
    console.error("Ticket not found:", customerId, applicationId);
  }

  const handleSortChange = (value: string) => {
    setSortBy(value.toLowerCase());
  };

  const filterTickets = () => {
    let filtered = filteredApplications;

    // Filter by search
    if (filter) {
      const regex = new RegExp(filter, "i");
      filtered = filtered.filter(
        (app: CustomerData) =>
          regex.test(app.Name) ||
          regex.test(app.Amount.toString()) ||
          app.Tenure.toString() === filter
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      filtered = filtered.filter((app) => {
        const selectedTicket = tickets?.results?.find(
          (ticket) => ticket.customer_application_id === app.applicationId
        );
        const createdAt = new Date(selectedTicket?.created_at);

        if (start && end) return createdAt >= start && createdAt <= end;
        if (start) return createdAt >= start;
        if (end) return createdAt <= end;
        return true;
      });
    }
    console.log(filtered, "filtered apps");
    return filtered;
  };

  const ticketCount = (status: string): number => {
    const ticketResults = tickets?.results || [];

    if (status === "all") {
      return ticketResults.length;
    }
    return ticketResults.filter((ticket) => ticket.ticketStatus === status).length;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
        userData={userData}
        userRole={userRole}
        ticketCount={ticketCount}
      />

      <Box
        sx={{
          minWidth: "80vw",
          minHeight: "70vh",
          display: "flex",
          alignItems: isMobile ? "center" : isTab ? "" : "flex-start",
          justifyContent: "space-between",
          paddingTop: "20px",
          marginBottom: "0",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            paddingLeft: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {filterTickets().length > 0 ? (
            filterTickets().map((application, index) => {
              return (
                <ApplicationCard
                  key={index}
                  contact={application}
                  handleStartClick={handleStartClick}
                  ticket={application}
                />
              );
            })
          ) : (
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
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Ticket;

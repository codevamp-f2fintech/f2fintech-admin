"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Pagination,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Dayjs } from "dayjs";

import ApplicationCard from "../components/ticket/ApplicationCard";
import FilterPanel from "../components/common/FilterPanel";
import { useGetTickets, useModifyTicket } from "@/hooks/ticket";
import { useCreateTicketHistory } from "@/hooks/tickethistory";
import { useGetUsers } from "@/hooks/user";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import type { Ticket } from "@/types/ticket";
import { CustomerData } from "@/types/customer";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTickets } from "@/redux/features/ticketSlice";

const ITEMS_PER_PAGE = 6;

const Ticket = () => {
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState("to do");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
    currentPage,
    ITEMS_PER_PAGE
  );

  const { modifyTicket } = useModifyTicket("update-ticket");
  const { createTicketHistory } = useCreateTicketHistory("create-ticket-history");
  const { value: userData } = useGetUsers({}, "get-users", 1, 100);

  useEffect(() => {
    const queryStatus = searchParams.get("status");
    if (queryStatus) {
      setSortBy(queryStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    if (ticketData?.results) {
      dispatch(setTickets(ticketData));
      const fetchApplications = async () => {
        const applicationIds = ticketData.results.map(ticket => ticket.customer_application_id);
        try {
          const fetchedApplications = await Promise.all(
            applicationIds.map(id => fetcher(`get-application-as-ticket/${id}`))
          );
          const combinedData = fetchedApplications.flatMap(item => item?.data || []);
          setFilteredApplications(combinedData);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
      fetchApplications();
    }
  }, [ticketData?.results]);

  useEffect(() => {
    if (tickets?.results?.length) {
      dispatch(setTickets(tickets));  // Update Redux store with the latest tickets when sortBy changes
    }
  }, [sortBy, tickets?.results]);

  const handleStartClick = async (customerId: string | number, applicationId: string | number, estimate: number, status: string) => {
    const selectedTicket = ticketData?.results.find(ticket =>
      ticket?.customer_application_id === applicationId
    );

    if (selectedTicket) {
      const { id: ticketId } = selectedTicket;
      const generatedTicketId = `F2FIN-${ticketId}`;
      remLocalStorage("ticketId");
      setLocalStorage("ticketId", generatedTicketId);

      if (status !== "forwarded") {
        const loggedInUser = decodedToken()?.username;
        const historyMessage = `<b>${loggedInUser}</b> started work`;
        await createTicketHistory({ ticket_id: ticketId, action: historyMessage });
        modifyTicket(ticketId, { status: "in progress" });
      }

      router.push(`/progress?customerId=${customerId}&applicationId=${applicationId}`);
    } else {
      console.error("Ticket not found:", customerId, applicationId);
    }
  };

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
          regex.test(app.Name) || regex.test(app.Amount.toString()) || app.Tenure.toString() === filter
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      filtered = filtered.filter(app => {
        const selectedTicket = tickets?.results?.find(ticket => ticket.customer_application_id === app.applicationId);
        const createdAt = new Date(selectedTicket?.created_at);

        if (start && end) return createdAt >= start && createdAt <= end;
        if (start) return createdAt >= start;
        if (end) return createdAt <= end;
        return true;
      });
    }
    console.log(filtered, 'filtered apps')
    return filtered;
  };

  const ticketCount = (status: string): number => {
    const ticketResults = tickets?.results || [];

    if (status === "all") {
      return ticketResults.length;
    }
    return ticketResults.filter((ticket) => ticket.status === status).length;
  };

  const paginatedApplications = filterTickets().slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
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
        <Grid container spacing={2} sx={{ paddingLeft: 0, justifyContent: "center", alignItems: "center" }}>
          {paginatedApplications.length > 0 ? (
            paginatedApplications.map((application, id) => {
              const ticket = tickets?.results?.find(ticket => ticket.customer_application_id === application.applicationId);
              return <ApplicationCard key={id} contact={application} ticket={ticket} handleStartClick={handleStartClick} />;
            })
          ) : (
            <Typography sx={{ width: "100%", textAlign: "center", mt: "20vh", color: "text.secondary" }}>
              {userRole === "admin" ? "No Tickets Found" : <Link href="/home">No Tickets Found. Start Picking Some By Clicking Here!</Link>}
            </Typography>
          )}
        </Grid>
      </Box>
      <Pagination
        count={Math.ceil(filterTickets().length / ITEMS_PER_PAGE)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ mt: 4 }}
      />
    </Box>
  );
};

export default Ticket;

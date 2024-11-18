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

const ITEMS_PER_PAGE = 6;

const Ticket = () => {
  const [customerApplications, setCustomerApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("to do");
  const [selectedUser, setSelectedUser] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const [currentPage, setCurrentPage] = useState(1); // For Pagination

  // date states
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams(); // To get the query parameters
  const { decodedToken, setLocalStorage, remLocalStorage } = Utility();
  const userRole = decodedToken()?.role;

  const { value: ticketData } = useGetTickets(
    [],
    `get-all-tickets/${selectedUser ? selectedUser.id : decodedToken()?.id}` // this is the selected user id or agent id
  );
  const { modifyTicket, error: updateError } = useModifyTicket("update-ticket");
  const { createTicketHistory } = useCreateTicketHistory(
    "create-ticket-history"
  );
  const { data: userData } = useGetUsers([], `get-users`);

  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== "undefined") {
        remLocalStorage("ids");
      }
    };
    handleRouteChange();
  }, [router]);

  useEffect(() => {
    if (ticketData?.data) {
      const fetchApplications = async () => {
        const applicationIds = ticketData.data.map(
          (ticket) => ticket.customer_application_id
        );
        try {
          const fetchedApplications = await Promise.all(
            applicationIds.map((id) =>
              fetcher(`get-application-as-ticket/${id}`)
            )
          );

          const combinedData = fetchedApplications.flatMap((item) => {
            if (item && item.data) {
              return item.data;
            } else {
              console.log("Invalid data format in fetched application:", item);
              return [];
            }
          });

          if (combinedData.length > 0) {
            setCustomerApplications(combinedData);
            console.log(combinedData, "combined applications");
          } else {
            console.log("No customer applications data available to set.");
          }

          const ticketStatus = ticketData.data.map((ticket) => ({
            status: ticket.status,
            customer_application_id: ticket.customer_application_id,
            original_estimate: ticket.original_estimate,
            due_date: ticket.due_date,
            created_at: ticket.created_at,
          }));
          setTickets(ticketStatus);
          console.log(tickets, "tickets");
        } catch (err) {
          console.log(err, "fetch application as ticket error");
        }
      };
      fetchApplications();
    }
  }, [ticketData?.data, selectedUser]);

  useEffect(() => {
    const queryStatus = searchParams.get("status");
    if (queryStatus) {
      console.log(queryStatus, "querystatus");
      setSortBy(queryStatus);
    }
  }, [searchParams]);

  // Initial filter to show only "to do" tickets by default
  useEffect(() => {
    if (customerApplications.length && tickets.length) {
      const initialFilteredApplications = customerApplications.filter(
        (customer) =>
          tickets.some((ticket) => {
            // If sortBy is not all, filter by the status provided in sortBy
            if (sortBy !== "all") {
              return (
                ticket?.customer_application_id === customer?.applicationId &&
                ticket?.status === sortBy
              );
            }
            // If sortBy is all, show all tickets (no filtering by status)
            return ticket?.customer_application_id === customer?.applicationId;
          })
      );
      console.log(initialFilteredApplications, "initial");
      setFilteredApplications(initialFilteredApplications);
    }
  }, [customerApplications, tickets, sortBy]);

  // Filter by search, date  and other criteria
  useEffect(() => {
    if (!filter && !startDate && !endDate && !sortBy) {
      console.log("get all applications filter");
      setFilteredApplications(customerApplications);
      return;
    } else if (filter || startDate || endDate) {
      let filtered = customerApplications;
      // Filter by Name, Amount, or Tenure
      if (filter) {
        const regex = new RegExp(filter, "i");
        filtered = filtered.filter(
          (app) =>
            regex.test(app.Name) ||
            regex.test(app.Amount.toString()) ||
            app.Tenure.toString() === filter
        );
      }

      // Filter by Date Range
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        filtered = filtered?.filter((app) => {
          const createdAt = new Date(
            tickets.find(
              (ticket) => ticket?.customer_application_id === app?.applicationId
            )?.created_at
          );

          if (start && end) {
            return createdAt >= start && createdAt <= end;
          } else if (start) {
            return createdAt >= start;
          } else if (end) {
            return createdAt <= end;
          }
          return true;
        });
      }

      setFilteredApplications(filtered);
    }
  }, [filter, startDate, endDate, customerApplications, tickets]);

  const handleStartClick = async (
    customerId,
    applicationId,
    estimate,
    status
  ) => {
    const selectedTicket = ticketData?.data?.find(
      (ticket) =>
        ticket?.user_id === decodedToken()?.id &&
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
        await createTicketHistory({
          ticket_id: ticketId,
          action: historyMessage,
        });
        modifyTicket(ticketId, { status: "in progress" });
      }
      setLocalStorage("ids", { customerId, applicationId, estimate });
      router.push(`/progress`);
    } else {
      console.error(
        "No ticket found for the given customerId and applicationId"
      );
    }
  };

  const handleSortChange = (value: string) => {
    const selectedStatus = value.toLowerCase();
    setSortBy(selectedStatus);

    if (selectedStatus === "all") {
      setFilteredApplications(customerApplications);
    } else {
      const filteredApplications = customerApplications.filter((customer) =>
        tickets.some((status) => {
          return (
            status?.customer_application_id === customer?.applicationId &&
            status?.status.toLowerCase() === selectedStatus
          );
        })
      );
      setFilteredApplications(filteredApplications);
    }
  };

  // Calculate the count of tickets for the selected status
  const ticketCount = (status: string): number => {
    if (status === "all") {
      return tickets.length;
    }
    return tickets.filter((ticket) => ticket.status === status).length;
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
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
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
            container
            spacing={2}
            paddingLeft={0}
          >
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((customer, id) => {
                const ticket = tickets.find(
                  (ticket) =>
                    ticket.customer_application_id === customer.applicationId
                );
                return (
                  <ApplicationCard
                    key={id}
                    contact={customer}
                    ticket={ticket}
                    handleStartClick={handleStartClick}
                  />
                );
              })
            ) : (
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  textAlign: "center",
                  color: "text.secondary",
                  mt: "20vh",
                }}
              >
                {userRole === "admin" ? (
                  "No Tickets Found"
                ) : (
                  <Link href="/home" passHref>
                    No Tickets Found. Start Picking Some By Clicking Here!
                  </Link>
                )}
              </Typography>
            )}
          </Grid>
        </Box>
        <Pagination
          count={Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{ mt: 4 }}
        />
      </Box>
    </>
  );
};

export default Ticket;

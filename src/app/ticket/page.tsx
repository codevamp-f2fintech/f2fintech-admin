"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";

import dayjs, { Dayjs } from "dayjs";

import Header from "../components/common/Header";
import { useGetTickets, useModifyTicket } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import ApplicationCard from "../components/ticket/ApplicationCard";

const Ticket = () => {
  const [customerApplications, setCustomerApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [ticketStatus, setTicketStatus] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("to do");

  // date states
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const router = useRouter();
  const { decodedToken, setLocalStorage, remLocalStorage } = Utility();

  const { value: ticketData } = useGetTickets(
    [],
    `get-all-tickets/${decodedToken()?.id}` // this is the logged in userId
  );

  const { modifyTicket, error: updateError } = useModifyTicket("update-ticket");

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
          const combinedData = fetchedApplications.flatMap((item) => item.data);
          setCustomerApplications(combinedData);

          const ticketStatus = ticketData.data.map((ticket) => ({
            status: ticket.status,
            customer_application_id: ticket.customer_application_id,
            original_estimate: ticket.original_estimate,
            due_date: ticket.due_date,
            created_at: ticket.created_at,
          }));
          setTicketStatus(ticketStatus);
        } catch (err) {
          console.log(err, "fetch application as ticket error");
        }
      };
      fetchApplications();
    }
  }, [ticketData?.data]);

  // Initial filter to show only "to do" tickets by default
  useEffect(() => {
    if (customerApplications.length && ticketStatus.length) {
      const initialFilteredApplications = customerApplications.filter(
        (customer) =>
          ticketStatus.some((status) => {
            console.log(status, "status");
            return (
              status.customer_application_id === customer.applicationId &&
              status.status === "to do" // Filter by "to do"
            );
          })
      );
      console.log(initialFilteredApplications, "initialfilter");
      setFilteredApplications(initialFilteredApplications);
    }
  }, [customerApplications, ticketStatus]);

  // Filter by search, date
  useEffect(() => {
    if (!filter && !startDate && !endDate) {
      setFilteredApplications(customerApplications);
      return;
    }

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

      filtered = filtered.filter((app) => {
        const createdAt = new Date(
          ticketStatus.find(
            (ticket) => ticket.customer_application_id === app.applicationId
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
  }, [filter, startDate, endDate, customerApplications, ticketStatus]);

  // Function to get status border color
  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case "in progress":
        return "LightSalmon";
      case "forwarded":
        return "Aqua";
      case "close":
        return "red";
      case "to do":
        return "blue";
      case "done":
        return "green";
      case "on hold":
        return "yellow";
      case "No status available":
        return "transparent";
      default:
        return "transparent";
    }
  };

  const handleStartClick = (customerId, applicationId, estimate, status) => {
    const selectedTicket = ticketData?.data.find(
      (ticket) =>
        ticket.user_id === decodedToken()?.id &&
        ticket.customer_application_id === applicationId
    );

    if (selectedTicket) {
      const { id: ticketId } = selectedTicket;
      const generatedTicketId = `F2FIN-${ticketId}`;
      remLocalStorage("ticketId");
      setLocalStorage("ticketId", generatedTicketId);

      if (status !== "forwarded") {
        modifyTicket(ticketId, { status: "in progress" });
      }
      setLocalStorage("ids", { customerId, applicationId, estimate });
      router.push(`/progress`);
    } else {
      console.log("No ticket found for the given customerId and applicationId");
    }
  };

  const handleSortChange = (event) => {
    const selectedStatus = event.target.value.toLowerCase();
    setSortBy(selectedStatus);

    if (selectedStatus === "all") {
      setFilteredApplications(customerApplications);
    } else {
      const filteredApplications = customerApplications.filter((customer) =>
        ticketStatus.some((status) => {
          return (
            status.customer_application_id === customer.applicationId &&
            status.status.toLowerCase() === selectedStatus
          );
        })
      );
      setFilteredApplications(filteredApplications);
    }
  };

  return (
    <>
      <Box
        sx={{
          // padding: 3,
          border: "2px solid black",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ border: "2px solid black", height: "8vh" }}>
          <Header
            searchTerm=""
            setSearchTerm={() => {}}
            customerLength={customerApplications.length}
            isLoggedIn={true}
            handleLogout={() => {}}
            handleLogin={() => {}}
            handleChooseMoreTickets={() =>
              console.log("Navigate to choose more tickets")
            }
            handleSortChange={handleSortChange}
            filter={filter}
            setFilter={setFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            notificationsCount={0}
            anchorEl={null}
            handleMenuClick={function (
              event: React.MouseEvent<HTMLElement>
            ): void {
              throw new Error("Function not implemented.");
            }}
            handleMenuClose={function (): void {
              throw new Error("Function not implemented.");
            }}
            sortBy={""}
          />
        </Box>
        <Grid container spacing={4} mt={3}>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((customer, id) => {
              const ticket = ticketStatus.find(
                (ticket) =>
                  ticket.customer_application_id === customer.applicationId
              );

              return (
                <ApplicationCard
                  contact={customer}
                  ticket={ticket}
                  handleStartClick={handleStartClick}
                />
              );
            })
          ) : (
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              No Tickets Found. Start Picking Some!
            </Typography>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default Ticket;

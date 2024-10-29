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
import Loader from "../components/common/Loader";

const Ticket = () => {
  const [customerApplications, setCustomerApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [ticketStatus, setTicketStatus] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const[statusCount,setStatusCount] = useState(0);

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
      setStatusCount(customerApplications.length); // Count of all tickets
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
      setStatusCount(filteredApplications.length); // Count of filtered tickets
    }
  };
  

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
        <Box
          sx={{
            height: "10vh",
            width: "80vw",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.1rem",
          }}
        >
           {sortBy === "all" ? (
            <Typography
              variant="h6"
              component="div"
              sx={{
               
                color: "#black",
                whiteSpace: "nowrap",
                fontSize: "2.1rem",
                marginLeft: "50px",
              }}
            >
             All Tickets: {customerApplications.length}
            </Typography>
          ) : (
            <Typography
              variant="h4"
              component="div"
              sx={{
                marginLeft: "20px",
                padding: "1.4rem",
              }}
            >
              <span style={{ marginRight: "0.5rem" }}>
                {sortBy === "all" ? "📊" : ""}
              </span>
              Tickets {sortBy}: {statusCount}
            </Typography>
          )}



          {/* Search Input */}
          <Box
            sx={{
              height: "6vh",
              width: "50vw",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name,amount,or tenure..."
              style={{
                width: "15vw",
                padding: ".8rem",
                border: "1px solid #ddd",
                borderRadius: "15px",
              }}
            />

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              style={{
                padding: ".8rem",
                border: "1px solid #ddd",
                borderRadius: "15px",
              }}
            >
              <option value="to do">To Do</option>
              <option value="in progress">In Progress</option>
              <option value="forwarded">Forwarded</option>
              <option value="done">Done</option>
              <option value="all">All</option>
            </select>

            {/* Date Filters */}

            <Typography variant="body2">Start Date:</Typography>
            <input
              type="date"
              value={startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""}
              onChange={(e) => setStartDate(dayjs(e.target.value))}
              style={{
                padding: ".8rem",
                border: "1px solid #ddd",
                borderRadius: "15px",
              }}
            />

            <Typography variant="body2">End Date:</Typography>
            <input
              type="date"
              value={endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""}
              onChange={(e) => setEndDate(dayjs(e.target.value))}
              style={{
                padding: ".8rem",
                border: "1px solid #ddd",
                borderRadius: "15px",
              }}
            />
          </Box>
        </Box>

        <Box
        sx={{
        minWidth: "80vw",
        minHeight: "70vh", 
        display: "flex",
        alignItems: "flex-start", 
        justifyContent: "space-between",
        paddingTop: "20px", 
        marginBottom: "0", 
      }}
    >
      <Grid container spacing={2} paddingLeft={7}>
        {filteredApplications.length > 0 ? (
          filteredApplications.map((customer, id) => {
            const ticket = ticketStatus.find(
              (ticket) => ticket.customer_application_id === customer.applicationId
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

      </Box>
    </>
  );
};

export default Ticket;

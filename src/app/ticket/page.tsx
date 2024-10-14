"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Grid,
  Typography,
  Button,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import dayjs, { Dayjs } from "dayjs";

import Header from "../components/common/Header";
import { useGetTickets, useModifyTicket } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";

const Ticket = () => {
  const [customerApplications, setCustomerApplications] = useState([]);

  const [filteredApplications, setFilteredApplications] = useState([]);

  const [ticketStatus, setTicketStatus] = useState([]);

  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("all");

  // date states
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const router = useRouter();
  const { setLocalStorage, remLocalStorage } = Utility();

  const { value: ticketData } = useGetTickets(
    [],
    `get-all-tickets/${1}` // this is userId
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
            applicationIds.map((id) => {
              return fetcher(`get-application-as-ticket/${id}`);
            })
          );
          const combinedData = fetchedApplications.flatMap((item) => item.data);
          setCustomerApplications(combinedData);
        } catch (err) {
          console.log(err);
        }
        const ticketStatus = ticketData.data.map((ticket) => ({
          status: ticket.status,
          customer_application_id: ticket.customer_application_id,
          created_at: ticket.created_at,
        }));
        setTicketStatus(ticketStatus);
      };
      fetchApplications();
    }
  }, [ticketData]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "to do":
        return "blue";
      case "in progress":
        return "gold";
      case "on hold":
        return "red";
      case "forwarded":
        return "yellow";
      case "close":
        return "voilet";
      case "done":
        return "blue";
      default:
        return "grey";
    }
  };
  useEffect(() => {
    if (filter || startDate || endDate) {
      let filtered = customerApplications;

      // Filter by Amount or Tenure
      if (filter) {
        const regex = new RegExp(filter, "i");
        filtered = filtered.filter(
          (app) =>
            app.Tenure.toString() === filter ||
            regex.test(app.Amount.toString())
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
    } else {
      setFilteredApplications(customerApplications);
    }
  }, [filter, customerApplications, startDate, endDate, ticketStatus]);

  const handleStartClick = (customerId, applicationId) => {
    const selectedTicket = ticketData?.data.find(
      (ticket) =>
        ticket.user_id === 1 && ticket.customer_application_id === applicationId
    );

    if (selectedTicket) {
      const { id: ticketId } = selectedTicket;
      // Update ticket status to 'in progress'
      modifyTicket(ticketId, { status: "in progress" });
    }
    setLocalStorage("ids", { customerId, applicationId });
    router.push("/progress");
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

  // const handleChooseMoreTickets = () => {
  //   router.push("/home");    Needs to be implemented
  //   console.log("Navigate to home");
  // };
  return (
    <>
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
      />
      <Box sx={{ padding: 3, backgroundColor: "grey.100", marginTop: "64px" }}>
        <Grid container spacing={4} mt={3}>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((customer, id) => {
              const status = ticketStatus.find(
                (ticket) =>
                  ticket.customer_application_id === customer.applicationId
              );
              return (
                <Grid item xs={12} sm={6} md={4} key={id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "12px",
                      border: "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: "#ffffff",
                      height: "100%",
                      borderTop: `4px solid ${getStatusColor(status.status)}`,
                    }}
                  >
                    <CardContent
                      sx={{ paddingBottom: "8px", paddingTop: "8px" }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Avatar
                            alt={customer.Name}
                            src={customer.Image}
                            sx={{
                              width: 70,
                              height: 70,
                              boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
                              border: "2px solid #fff",
                            }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Box display="flex" alignItems="center">
                            <PersonIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{
                                fontWeight: "bold",
                                color: "#1976d2",
                                fontSize: "18px",
                              }}
                            >
                              {customer.Name.toUpperCase()}
                            </Typography>
                          </Box>
                          <hr
                            style={{
                              border: "none",
                              height: "1px",
                              backgroundColor: "#ddd",
                              margin: "4px 0",
                            }}
                          />

                          <Box display="flex" alignItems="center">
                            <EmailIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                padding: "2px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1976d2",
                                  fontSize: "16px",
                                }}
                              >
                                Email:
                              </span>{" "}
                              {customer.Email}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center">
                            <PhoneIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                padding: "2px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1976d2",
                                  fontSize: "16px",
                                }}
                              >
                                Phone:
                              </span>{" "}
                              {customer.Contact}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center">
                            <AttachMoneyIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                padding: "2px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1976d2",
                                  fontSize: "16px",
                                }}
                              >
                                Amount:
                              </span>{" "}
                              {customer.Amount}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center">
                            <AccessTimeIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                padding: "2px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1976d2",
                                  fontSize: "16px",
                                }}
                              >
                                Tenure:
                              </span>{" "}
                              {customer.Tenure} months
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center">
                            <LocationOnIcon
                              sx={{ color: "#1976d2", marginRight: "8px" }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                padding: "2px",
                                borderRadius: "4px",
                                marginTop: "2px",
                                fontSize: "15px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#1976d2",
                                  fontSize: "16px",
                                }}
                              >
                                Location:
                              </span>{" "}
                              {customer.Location}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%", borderRadius: 0 }}
                      onClick={() =>
                        handleStartClick(customer.Id, customer.applicationId)
                      }
                    >
                      Start Work
                    </Button>
                  </Card>
                </Grid>
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
              No matching tickets found
            </Typography>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default Ticket;

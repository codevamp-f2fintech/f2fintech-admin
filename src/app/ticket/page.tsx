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
  MenuItem,
  Select,
} from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";

import Header from "../components/common/Header";
import { useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";

const Ticket: React.FC = () => {
  const [customerApplications, setCustomerApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(4);

  const router = useRouter();
  const { setLocalStorage, remLocalStorage } = Utility();

  // const filteredCustomers = pickedCustomers.filter((val) =>
  //   val.Name.toLowerCase().startsWith(searchTerm.toLowerCase());
  // );

  const { value: ticketData, error: ticketError } = useGetTickets(
    [],
    `api/v1/get-all-tickets/${1}`
  );

  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== "undefined") {
        remLocalStorage("ids");
      }
    };

    handleRouteChange();
  }, [router]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (ticketData?.data) {
        const applicationIds = ticketData.data.map(
          (ticket) => ticket.customer_application_id
        );
        try {
          setLoading(true);
          const fetchedApplications = await Promise.all(
            applicationIds.map((id) => {
              return fetcher(
                `/customer-applications/get-ticket-applications/${id}`
              );
            })
          );

          const combinedData = fetchedApplications.flatMap((item) => item.data);
          setCustomerApplications(combinedData);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [ticketData]);

  const handleStartClick = (customerId, applicationId) => {
    setLocalStorage("ids", { customerId, applicationId });
    router.push("/progress");
  };

  console.log("setCustomerApplications=>", customerApplications);

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customerLength={customerApplications.length}
        notificationsCount={notificationsCount}
        isLoggedIn={isLoggedIn}
        handleLogout={() => setIsLoggedIn(false)}
        handleLogin={() => setIsLoggedIn(true)}
        handleChooseMoreTickets={() =>
          console.log("Navigate to choose more tickets")
        }
      />
      <Box
        sx={{
          padding: 3,
          backgroundColor: "grey.100",
          marginTop: "64px",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "primary.main",
            textAlign: "center",
          }}
        >
          Your Picked Tickets
        </Typography>
        <Grid container spacing={4} mt={3}>
          {customerApplications.length > 0 ? (
            customerApplications.map((customer, id) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    border: "none",
                    position: "relative",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ paddingBottom: "8px", paddingTop: "8px" }}>
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
                          />{" "}
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
                          />{" "}
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
                          />{" "}
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
                          />{" "}
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
                          />{" "}
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
            ))
          ) : (
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              No tickets picked yet
            </Typography>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default Ticket;

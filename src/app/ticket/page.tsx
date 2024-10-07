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
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";

import Header from "../components/common/Header";
import { useGetTickets } from "@/hooks/ticket";
import { fetcher } from "@/apis/apiClient";

const Ticket: React.FC = () => {
  const [customerApplications, setCustomerApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(4);
  const router = useRouter();

  // const filteredCustomers = pickedCustomers.filter((val) =>
  //   val.Name.toLowerCase().startsWith(searchTerm.toLowerCase())
  // );

  const { value: ticketData, error: ticketError } = useGetTickets(
    [],
    `api/v1/get-all-tickets/${1}`
  );

  useEffect(() => {
    const fetchApplications = async () => {
      if (ticketData?.data) {
        const applicationIds = ticketData.data.map(
          (ticket) => ticket.customer_application_id
        );
        console.log(applicationIds, "application id");
        try {
          setLoading(true);
          const fetchedApplications = await Promise.all(
            applicationIds.map((id) => {
              console.log(id, "id");
              return fetcher(
                `/customer-applications/get-ticket-applications/${id}`
              );
            })
          );

          const combinedData = fetchedApplications.flatMap((item) => item.data);
          console.log(combinedData, "fetchapps");
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
          sx={{ color: "primary.main", textAlign: "center" }}
        >
          Your Picked Tickets
        </Typography>
        <Grid container spacing={4} mt={3}>
          {customerApplications.length > 0 ? (
            customerApplications.map((customer, id) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    "&:hover": { boxShadow: 6 },
                    borderRadius: 2,
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        src={customer.f2fintech}
                        sx={{ width: 56, height: 56 }}
                      />
                    }
                    title={customer.Name}
                    subheader={customer.Location}
                    titleTypographyProps={{
                      variant: "h6",
                      color: "primary.main",
                    }}
                    subheaderTypographyProps={{
                      variant: "body1",
                      color: "text.secondary",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <MailOutlineIcon /> Email: {customer.Email}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <PhoneIcon /> Contact: {customer.Contact}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <MonetizationOnIcon /> Amount: {customer.Amount}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <EventIcon /> Tenure: {customer.Tenure} months
                    </Typography>
                  </CardContent>

                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", borderRadius: 0 }}
                    onClick={() => {
                      localStorage.setItem("customerId", customer.Id);
                      localStorage.setItem(
                        "applicationId",
                        customer.applicationId
                      );
                      router.push(`/progress`);
                    }}
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

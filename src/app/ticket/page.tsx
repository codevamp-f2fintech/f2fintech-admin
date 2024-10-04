"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
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
import { RootState } from "@/redux/store";

const Ticket: React.FC = () => {
  const { pickedCustomers } = useSelector((state: RootState) => state.customer);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(4);

  // Filtering customers based on search term input
  const filteredCustomers = pickedCustomers.filter((val) =>
    val.Name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customerLength={pickedCustomers.length}
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
          marginTop: "64px", // Ensure enough top margin to not overlap with the fixed header
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <Grid item xs={12} sm={6} md={4} key={customer.Id}>
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
                        src={customer.Image}
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
                  <Link
                    href={`/progress?customerId=${customer.Id}&applicationId=${customer.applicationId}`}
                    passHref
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%", borderRadius: 0 }}
                    >
                      Start Work
                    </Button>
                  </Link>
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

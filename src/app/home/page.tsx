"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Badge,
  IconButton,
  Menu,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";

import { LocalizationProvider, DateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

// Define interfaces for your data types
interface Contact {
  id: number;
  name: string;
  role: string;
  address: string;
  email: string;
  avatar: string;
  popularity: number;
  loanAmount: string;
  tenure: string;
  addedDate: string;
}

// Mock data with typed contacts
const contacts: Contact[] = [
  {
    id: 1,
    name: "Prashant Kumar",
    role: "Senior Tech Lead",
    address: "Noida, Delhi",
    email: "it@f2fintech.com",
    avatar:
      "https://media.licdn.com/dms/image/C5603AQH_92_Dw7Ff_w/profile-displayphoto-shrink_800_800/0/1633158754592?e=1728518400&v=beta&t=2grvOiwrmqnGuwT_GCWaf307ZWd12UvH9wc302dUVlY",
    popularity: 2,
    loanAmount: "₹100,000",
    tenure: "5 years",
    addedDate: "2024-08-10",
  },

  {
    id: 2,
    name: "Ritu Anuragi",
    role: "Senior Tech Lead",
    address: "Noida, Delhi",
    email: "it@f2fintech.com",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAquJnmjA9udSc7HSpxJzTAHepjHI-NS7iTA&s",
    popularity: 2,
    loanAmount: "₹100,000",
    tenure: "5 years",
    addedDate: "2024-08-07",
  },
  {
    id: 3,
    name: "Ritu Anuragi",
    role: "Senior Tech Lead",
    address: "Noida, Delhi",
    email: "it@f2fintech.com",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAquJnmjA9udSc7HSpxJzTAHepjHI-NS7iTA&s",
    popularity: 2,
    loanAmount: "₹100,000",
    tenure: "5 years",
    addedDate: "2024-08-07",
  },
  {
    id: 4,
    name: "Tuba Khan",
    role: "AI Developer",
    address: "Noida, Delhi",
    email: "it@f2fintech.com",
    avatar:
      "https://media.licdn.com/dms/image/D5603AQEMixrGIC0orw/profile-displayphoto-shrink_800_800/0/1715094788444?e=1729123200&v=beta&t=B0cJ13t2qCWGZugiQ2XdeOq9yI8nRxwUfYAg8kE1wwg",
    popularity: 2,
    loanAmount: "₹100,000",
    tenure: "5 years",
    addedDate: "2024-08-11",
  },
];

// Function to calculate the number of days ago
const calculateDaysAgo = (date: string) => {
  const today = new Date();
  const addedDate = new Date(date);
  const diffTime = Math.abs(today.getTime() - addedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("");
  const [contactStatuses, setContactStatuses] = useState<{
    [key: number]: string;
  }>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsCount, setNotificationsCount] = useState<number>(4);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleMenuClose();
  };

  // Function to handle checkbox change
  const handleCheckboxChange = (contactId: number) => {
    setSelectedContacts((prevSelectedContacts) => {
      const updatedSelection = prevSelectedContacts.includes(contactId)
        ? prevSelectedContacts.filter((id) => id !== contactId)
        : [...prevSelectedContacts, contactId];
      return updatedSelection;
    });
  };

  // Function to handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setContactStatuses((prevStatuses) => {
      const updatedStatuses = { ...prevStatuses };
      selectedContacts.forEach((contactId) => {
        updatedStatuses[contactId] = newStatus;
      });
      return updatedStatuses;
    });
  };

  // Function to get status border color
  const getStatusBorderColor = (contactId: number): string => {
    switch (contactStatuses[contactId]) {
      case "to-do":
        return "black";
      case "progress":
        return " LightSalmon ";
      case "on-hold":
        return "orange";
      case "forwarded":
        return "Aqua";
      case "closed":
        return "green";
      default:
        return "transparent";
    }
  };

  // Filter contacts based on search term and selected date
  const filteredContacts = contacts.filter((contact) => {
    const matchesName = contact.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate
      ? contact.addedDate === selectedDate
      : true;
    return matchesName && matchesDate;
  });

  return (
    <Box
      sx={{
        backgroundColor: "#eeeeee",
        padding: 2,
        minHeight: "100vh",
        width: "100wv",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginBottom: "10px",
          padding: "10px 20px",
          background: "linear-gradient(to right, #5e0ecc, #1a69fc)",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.4)",
          marginTop: "-5px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundSize: "cover",
          color: "white",
          zIndex: 1000,
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        <Box display="flex" alignItems="center">
          <img
            src="https://www.f2fintech.com/img/F2-Fintech-logoblack.png"
            alt="Logo"
            style={{ width: "70px", height: "60px", marginRight: "10px" }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#fff",
            }}
          >
            Total Applicants: {filteredContacts.length}
          </Typography>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          flexGrow={1}
        >
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "160px",
              marginTop: "6px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              marginLeft: "370px",
              "& .MuiInputLabel-root": {
                color: "black",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#1976d2",
                },
                "&:hover fieldset": {
                  borderColor: "#1a69fc",
                },
              },
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" variant="outlined">
            <InputLabel
              sx={{
                marginTop: "7px",
              }}
            >
              Status
            </InputLabel>
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              label="Status"
              sx={{
                width: "160px",
                marginTop: "6px",
                borderRadius: "12px",
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="to-do">To Do</MenuItem>
              <MenuItem value="progress">In Progress</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
              <MenuItem value="forwarded">Forwarded</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: "flex",
            paddingLeft: "5px",
            overflow: "hidden",
          }}
        >
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: "220px",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              "& .MuiOutlinedInput-root": {
                height: "36px",
                padding: "0px",
                backgroundColor: "white",
                "& fieldset": {
                  borderColor: "#cfd8dc",
                },
                "&:hover fieldset": {
                  borderColor: "#64b5f6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e88e5",
                },
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateRangePicker"]}>
                <DateRangePicker
                  localeText={{ start: "", end: "" }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "8px",
                      padding: "1px",
                      "&:hover": {
                        borderColor: "#fff",
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cfd8dc",
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#fff",
                    },
                    maxHeight: "36px",
                    marginLeft: "5px",
                    overflow: "hidden",
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit">
            <Badge badgeContent={notificationsCount} color="secondary">
              <NotificationsIcon
                sx={{
                  color: "white",
                }}
              />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuClick}>
            <Avatar
              alt="User Profile"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAquJnmjA9udSc7HSpxJzTAHepjHI-NS7iTA&s"
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>

          <Menu
            id="avatar-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {isLoggedIn ? (
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            ) : (
              <MenuItem onClick={handleLogin}>Login</MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={4} padding={1}>
        {filteredContacts.map((contact, index) => (
          <Grid
            item
            xs={12}
            sm={1}
            md={4}
            key={contact.id}
            // Apply marginTop only to the first row
            sx={{
              marginTop: index < 3 ? "55px" : "-25px",
            }}
          >
            <Box
              sx={{
                borderRadius: "2px",
                overflow: "hidden",
                borderColor: getStatusBorderColor(contact.id),
                borderWidth: "2px",
                borderStyle: "double",
                marginBottom: "3px",
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  border: "none",
                  position: "relative",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  background: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: getStatusBorderColor(contact.id),
                    color: "#fff",
                    padding: "2px 4px",
                    borderBottomRightRadius: "8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {contactStatuses[contact.id] || "No Status"}
                </Box>
                <CardContent sx={{ paddingBottom: "4px" }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        alt={contact.name}
                        src={contact.avatar}
                        sx={{
                          width: 60,
                          height: 60,
                          marginBottom: "4px",
                          boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      />
                    </Grid>
                    <Grid item xs>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                        }}
                      >
                        {contact.name}
                      </Typography>
                      <hr
                        style={{
                          border: "none",
                          height: "1px",
                          backgroundColor: "#ddd",
                          marginTop: "4px",
                          marginLeft: "0",
                          marginRight: "0",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "14px" }}>
                          Designation:
                        </span>{" "}
                        {contact.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "14px" }}>
                          Address:
                        </span>{" "}
                        {contact.address}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "14px" }}>
                          Email:
                        </span>{" "}
                        {contact.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "14px" }}>
                          Loan Amount:
                        </span>{" "}
                        {contact.loanAmount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "14px" }}>
                          Tenure:
                        </span>{" "}
                        {contact.tenure}
                      </Typography>
                    </Grid>
                  </Grid>
                  <hr
                    style={{
                      border: "none",
                      height: "1px",
                      backgroundColor: "#ddd",
                      marginTop: "4px",
                      marginLeft: "70px",
                      marginRight: "0",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: "#1976d2",
                      borderRadius: "6px",
                      padding: "4px 6px",
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  >
                    <CalendarIcon
                      sx={{ marginRight: "4px", fontSize: "16px" }}
                    />
                    {calculateDaysAgo(contact.addedDate)} days ago
                  </Typography>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "18px",
                      right: "1px",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleCheckboxChange(contact.id)}
                          color="primary"
                        />
                      }
                      label="Pick"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

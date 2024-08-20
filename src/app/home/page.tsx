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
  MenuItem as DropdownItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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
  const [notificationsCount, setNotificationsCount] = useState<number>(12);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        return "gray";
      case "progress":
        return "blue";
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
    <Box padding={2} sx={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginBottom: "16px",
          padding: "5px 10px",
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
          backgroundSize: "cover",
          borderRadius: "10px",
          color: "white",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", fontSize: "1.25rem" }}
        >
          Total Applicants: {filteredContacts.length}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "150px", borderRadius: "10px", bgcolor: "white" }}
          />

          <FormControl size="small" variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              label="Status"
              sx={{ borderRadius: "10px", width: "200px", bgcolor: "white" }}
            >
              <MenuItem value="to-do">To Do</MenuItem>
              <MenuItem value="progress">In Progress</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
              <MenuItem value="forwarded">Forwarded</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" variant="outlined">
            <TextField
              label="Filter by Date"
              type="date"
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                borderRadius: "10px",
                width: "200px",
                bgcolor: "white",
                marginTop: "4px",
              }}
            />
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit">
            <Badge badgeContent={notificationsCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuClick}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
          </Menu>

          <Avatar
            alt="User Profile"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAquJnmjA9udSc7HSpxJzTAHepjHI-NS7iTA&s"
            sx={{ width: 40, height: 40 }}
          />
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            {isLoggedIn ? "Logged In" : "Logged Out"}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} padding={1}>
        {filteredContacts.map((contact) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={contact.id}
            sx={{ marginTop: "5px" }}
          >
            <Box
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.3)",
                },
                borderColor: getStatusBorderColor(contact.id),
                borderWidth: "2px",
                borderStyle: "solid",
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
                  background: "#fff",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: getStatusBorderColor(contact.id),
                    color: "#fff",
                    padding: "2px 6px",
                    borderBottomRightRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {contactStatuses[contact.id] || "No Status"}
                </Box>
                <CardContent sx={{ paddingBottom: "4px" }}>
                  <Grid container spacing={1} alignItems="center">
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
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
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
                      marginTop: "8px",
                      marginLeft: "0",
                      marginRight: "0",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: "#f0f0f0",
                      borderRadius: "6px",
                      padding: "4px 6px",
                      display: "inline-block",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#1976d2" }}>
                      {calculateDaysAgo(contact.addedDate)}
                    </span>{" "}
                    days ago
                  </Typography>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      padding: "4px",
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

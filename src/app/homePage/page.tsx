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
} from "@mui/material";

const contacts = [
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

const calculateDaysAgo = (date) => {
  const today = new Date();
  const addedDate = new Date(date);
  const diffTime = Math.abs(today - addedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [status, setStatus] = useState("");
  const [contactStatuses, setContactStatuses] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prevSelectedContacts) => {
      const updatedSelection = prevSelectedContacts.includes(contactId)
        ? prevSelectedContacts.filter((id) => id !== contactId)
        : [...prevSelectedContacts, contactId];
      return updatedSelection;
    });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setContactStatuses((prevStatuses) => {
      const updatedStatuses = { ...prevStatuses };
      selectedContacts.forEach((contactId) => {
        updatedStatuses[contactId] = newStatus;
      });
      return updatedStatuses;
    });
  };

  const getStatusBorderColor = (contactId) => {
    switch (contactStatuses[contactId]) {
      case "to-do":
        return "gray";
      case "progress":
        return "blue";
      case "on-hold":
        return "orange";
      case "forwarded":
        return "green";
      case "closed":
        return "red";
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
    <Box padding={3} sx={{ minHeight: "100vh" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginBottom: "10px",
          paddingLeft: "60px",
          paddingRight: "60px",
          marginTop: "10px",
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "10px",
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{ fontWeight: "bold", color: "black" }}
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
            sx={{ width: "150px", borderRadius: "10px" }}
          />

          <FormControl size="small" variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              label="Status"
              sx={{ borderRadius: "10px", width: "150px" }}
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
                width: "150px",
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <hr
        style={{
          border: "none",
          height: "1px",
          backgroundColor: "#ddd",
          marginTop: "5px",
          marginLeft: "60px",
          marginRight: "60px",
        }}
      />

      <Grid container spacing={2} padding={3}>
        {filteredContacts.map((contact) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={contact.id}
            sx={{ marginTop: "20px" }}
          >
            <Box
              sx={{
                borderRadius: "0px",
                overflow: "hidden",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
                },
                position: "relative",
                borderColor: getStatusBorderColor(contact.id),
                borderWidth: "2px",
                borderStyle: "solid",
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  width: "100%",
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  border: "none",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: getStatusBorderColor(contact.id),
                    color: "#fff",
                    padding: "2px 8px",
                    borderBottomRightRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {contactStatuses[contact.id] || "No Status"}
                </Box>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        alt={contact.name}
                        src={contact.avatar}
                        sx={{
                          width: 70,
                          height: 70,
                          marginBottom: "5px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
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
                          marginTop: "5px",
                          marginLeft: "60px",
                          marginRight: "60px",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "2px",
                          borderRadius: "5px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "15px" }}>
                          Designation:
                        </span>{" "}
                        {contact.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "5px",
                          borderRadius: "5px",
                          marginTop: "5px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "15px" }}>
                          Location:
                        </span>{" "}
                        {contact.address}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "5px",
                          borderRadius: "5px",
                          marginTop: "5px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "15px" }}>
                          Loan Amount:
                        </span>{" "}
                        {contact.loanAmount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: "5px",
                          borderRadius: "5px",
                          marginTop: "5px",
                        }}
                      >
                        <span style={{ color: "#1976d2", fontSize: "15px" }}>
                          Tenure:
                        </span>{" "}
                        {contact.tenure}
                      </Typography>
                      {contactStatuses[contact.id] && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            padding: "5px",
                            borderRadius: "5px",
                            marginTop: "10px",
                            textAlign: "center",
                          }}
                        ></Typography>
                      )}
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleCheckboxChange(contact.id)}
                            sx={{ position: "absolute", top: 0, right: 0 }}
                          />
                        }
                        label=""
                      />
                    </Grid>
                  </Grid>
                </CardContent>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    padding: "2px 8px",
                    borderTopRightRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {calculateDaysAgo(contact.addedDate)} days ago
                </Box>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

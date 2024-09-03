"use client";
import React, { useState, MouseEvent } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Select,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Bolt as BoltIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { ThemeProvider } from "@mui/material/styles";
import { useMode, ColorModeContext } from "../../../theme";

type Team = "Sales Team" | "Credit Team" | "Banker"; 

const Progress: React.FC = () => {
  const [theme, colorMode] = useMode();
  const [status, setStatus] = useState("WorkFlow");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<null | Date>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team>("Sales Team");
  const [activeSection, setActiveSection] = useState<string>("Comments");

  // const handleFileUpload = () => {
  //   if (selectedFile) {
  //     console.log("Uploading file:", selectedFile);
  //   }  for later use
  // };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (selectedStatus: string) => {
    setStatus(selectedStatus);
    setAnchorEl(null);
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  const handleChange = (event: React.ChangeEvent<{ value: String }>) => {
    setSelectedTeam(event.target.value as string);
  };

  // Function to determine the message based on selected team
  const getProcessMessage = (team: string): string => {
    switch (team) {
      case "Sales Team":
        return "Currently processed by the Sales Team.";
      case "Credit Team":
        return "Currently under review by the Credit Team.";
      case "Banker":
        return "Being managed by the Banker.";
      default:
        return "";
    }
  };

  const showComments = () => setActiveSection("Comments");
  const showHistory = () => setActiveSection("History");
  const showWorkLog = () => setActiveSection("WorkLog");

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container
            maxWidth={false}
            sx={{
              height: "100vh",
              width: "100vw",
              backgroundColor: "#f0f2f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 2,
            }}
          >
            <AppBar position="fixed" sx={{ boxShadow: "none" }}>
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ flexGrow: 1, textAlign: "center" }}
                >
                  F2 Fintech Sales Ticketing System
                </Typography>
                <Avatar
                  sx={{ bgcolor: "#ffffff", color: theme.palette.primary.main }}
                >
                  RA
                </Avatar>
              </Toolbar>
            </AppBar>

            <Grid
              container
              spacing={2}
              sx={{ width: "100%", maxWidth: 1600, mt: 10 }}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 4,
                    height: "75vh",
                    marginTop: "-50px",
                    background: "#fff",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#2c3ce3",
                        textDecoration: "underline",
                        fontSize: "24px",
                      }}
                    >
                      Customer Description:
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                        onChange={(e) =>
                          setSelectedFile(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                      />
                      <label htmlFor="file-upload">
                        <Button
                          component="span"
                          startIcon={<AttachFileIcon />}
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            mr: -2,
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                          }}
                        >
                          Attach
                        </Button>
                      </label>
                    </Box>
                  </Box>

                  {/* Customer Information */}
                  <Box
                    mt={2}
                    p={2}
                    border={1}
                    borderColor="rgba(0, 0, 0, 0.1)"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    sx={{ borderRadius: "14px" }}
                  >
                    {/* Larger Avatar */}
                    <Avatar
                      src="https://media.licdn.com/dms/image/v2/D5603AQFSY_iXVJkvJw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1718904998334?e=1730332800&v=beta&t=TmsbITCyqiQJfyvAbAtkY_dstleLe0YnZoRiA5B4OHE"
                      sx={{ width: 80, height: 80 }} // Increase size of Avatar
                    />

                    {/* Information Content */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Name and Email */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "blue", mr: 1 }}
                            >
                              Name:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "black" }}
                            >
                              Ritu Anuragi
                            </Typography>
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ mt: 1 }}
                          >
                            <Typography
                              component="span"
                              sx={{ color: "blue", mr: 1 }}
                            >
                              Email:
                            </Typography>
                            <Typography component="span" sx={{ color: "Onyx" }}>
                              ritu@gmail.com
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* Contact and Amount */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <Typography
                              component="span"
                              sx={{ color: "blue", mr: 1 }}
                            >
                              Contact:
                            </Typography>
                            <Typography component="span" sx={{ color: "Onyx" }}>
                              123-456-7890
                            </Typography>
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "blue", mr: 1 }}
                            >
                              Amount:
                            </Typography>
                            <Typography component="span" sx={{ color: "Onyx" }}>
                              ₹50,00,000
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Bank */}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <Typography
                          component="span"
                          sx={{ color: "blue", mr: 1 }}
                        >
                          Bank:
                        </Typography>
                        <Typography component="span" sx={{ color: "Onyx" }}>
                          Bank of India
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>

                  <Box mt={2} mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Activity:
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor:
                            activeSection === "Comments"
                              ? "lightblue"
                              : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showComments}
                      >
                        Comments
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor:
                            activeSection === "History"
                              ? "lightblue"
                              : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showHistory}
                      >
                        History
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor:
                            activeSection === "WorkLog"
                              ? "lightblue"
                              : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showWorkLog}
                      >
                        Work Log
                      </Typography>
                    </Typography>
                  </Box>

                  {activeSection === "Comments" && (
                    <Box mt={2} mb={3}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Add a comment..."
                        multiline
                        rows={3}
                        sx={{
                          mt: 1,
                          bgcolor: "#ffffff",
                          borderRadius: 1,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Box mt={2} display="flex" justifyContent="flex-start">
                        <Button
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                          }}
                          onClick={() => console.log("Comment button clicked")}
                        >
                          Comment
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {activeSection === "History" && (
                    <>
                      <Box mt={2}>
                        <Typography variant="h6" fontWeight="bold">
                          History:
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box mt={1}>
                          <Typography variant="body1">
                            <BoltIcon
                              fontSize="small"
                              sx={{
                                color: "#2c3ce3",
                                marginRight: "5px",
                              }}
                            />
                            <strong>16 Aug 2023:</strong> Action performed by
                            Rajiv.
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: "24px" }}
                          >
                            Updated customer information.
                          </Typography>
                        </Box>
                        <Box mt={1}>
                          <Typography variant="body1">
                            <BoltIcon
                              fontSize="small"
                              sx={{
                                color: "#2c3ce3",
                                marginRight: "5px",
                              }}
                            />
                            <strong>15 Aug 2023:</strong> Action performed by
                            Anjali.
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: "24px" }}
                          >
                            Approved loan application.
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {activeSection === "WorkLog" && (
                    <Box
                      mt={2}
                      mb={3}
                      p={3}
                      borderRadius={2}
                      bgcolor="background.paper"
                      boxShadow={3}
                      textAlign="center"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        background:
                          "linear-gradient(to right, #f5f5f5, #e0e0e0)",
                        width: "300px",
                        height: "140px",
                        maxWidth: "100%",
                        marginLeft: "200px",
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 40, mb: 0 }} />
                      <Typography
                        variant="body2"
                        mt={2}
                        sx={{ padding: "0 20px" }}
                      >
                        No work has been logged for this issue yet. Logging work
                        lets you track and report on the time spent on issues.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                      >
                        Log Work
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    height: "65vh",
                    marginTop: "-50px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 1,
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      {status}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(status)}
                    >
                      <MenuItem onClick={() => handleClose("In Progress")}>
                        In Progress
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("LOGIN")}>
                        Login
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("HOLD")}>
                        Hold
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("APPROVED")}>
                        Approved
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("REJECTED")}>
                        Rejected
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("DISBURSED")}>
                        Disbursed
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("FORWARDED")}>
                        Forwarded
                      </MenuItem>
                    </Menu>
                    <IconButton>
                      <BoltIcon color="action" />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight="bold">
                    {/* Display the process message based on selected team */}
                    <Box mt={1}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#2c3ce3", fontSize: "14px" }}
                      >
                        {getProcessMessage(selectedTeam)}
                      </Typography>
                    </Box>
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Assignee
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>RA</Avatar>
                      <Typography variant="body2">Ritu Anuragi</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        marginTop: "20px",
                        padding: "0px 1px",
                      }}
                    >
                      TimeLog
                    </Typography>
                    <DateTimePicker
                      label="Choose Date & Time"
                      value={selectedDateTime}
                      onChange={(newValue) => setSelectedDateTime(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      )}
                    />
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Process Under:
                    </Typography>
                    <Select
                      value={selectedTeam}
                      onChange={handleChange}
                      sx={{
                        backgroundColor: "#e8eaf6",
                        fontSize: "12px",
                        borderRadius: "4px",
                        padding: "-10px 1px",

                        minWidth: "70px",
                      }}
                      variant="outlined"
                    >
                      <MenuItem value="Sales Team">Sales Team</MenuItem>
                      <MenuItem value="Credit Team">Credit Team</MenuItem>
                      <MenuItem value="Banker">Banker</MenuItem>
                    </Select>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" fontWeight="bold">
                      Original estimate:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#e8eaf6",
                        fontSize: "12px",
                        borderRadius: "4px",
                        padding: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      2d
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </LocalizationProvider>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default Progress;

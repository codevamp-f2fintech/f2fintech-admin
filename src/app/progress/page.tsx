"use client";

import React, { useState, MouseEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";
import { useMode, ColorModeContext } from "../../../theme";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchStatusAndDocuments,
  fetchEmployeeStatus,
} from "../../redux/features/employeeSlice";
import { RootState } from "../../redux/store";

const Progress: React.FC = () => {
  const [theme, colorMode] = useMode();
  const dispatch = useDispatch();

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [employeeAnchorEl, setEmployeeAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedDateTime, setSelectedDateTime] = useState<null | Date>(null);
  const [activeSection, setActiveSection] = useState<string>("Comments");

  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const applicationId = searchParams.get("applicationId");
  console.log(customerId, "id is:");
  // Access pickedCustomers from Redux store
  const { pickedCustomers } = useSelector((state: RootState) => state.customer);
  console.log(pickedCustomers);

  const {
    status: employeeStatus,
    loanStatus,
    documents,
  } = useSelector((state: RootState) => state.employee);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  // Fetch employee status and loan status and documents
  useEffect(() => {
    dispatch(fetchStatusAndDocuments({ customerId, applicationId }));
    console.log(applicationId, "applicationId is:");
    dispatch(fetchEmployeeStatus(applicationId));
  }, [dispatch, applicationId, customerId]);

  useEffect(() => {
    if (customerId) {
      const customer = pickedCustomers.find(
        (cust) => String(cust.Id) === customerId
      );
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [customerId, pickedCustomers]);

  const handleBack = () => {
    window.history.back();
  };

  if (!selectedCustomer) {
    return <div>Loading customer data...</div>;
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(newFiles);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEmployeeClick = (event: MouseEvent<HTMLButtonElement>) => {
    setEmployeeAnchorEl(event.currentTarget);
  };

  const handleClose = (selectedStatus: string) => {
    setAnchorEl(null);
  };

  const handleEmployeeClose = (selectedStatus: string) => {
    setEmployeeAnchorEl(null);
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
              paddingTop: 7,
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
              sx={{ width: "100%", maxWidth: 1900, mt: 5, position: "fixed" }}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 4,
                    height: "auto",
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
                    <Box display="flex" alignItems="center" ml={2}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          component="span"
                          startIcon={<AttachFileIcon />}
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                          }}
                        >
                          Attach Files
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
                    <Avatar
                      src={selectedCustomer.Image}
                      sx={{ width: 80, height: 80 }}
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
                              sx={{ color: "black", mr: 1 }}
                            >
                              Name:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Name}
                            </Typography>
                          </Typography>

                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Email:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Email}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* Contact and Amount */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Contact:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Contact}
                            </Typography>
                          </Typography>

                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Designation:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Designation}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Location:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Location}
                            </Typography>
                          </Typography>

                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              tenure:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Tenure}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            component="span"
                            sx={{ color: "black", mr: 1 }}
                          >
                            Amount:
                          </Typography>
                          <Typography component="span" sx={{ color: "blue" }}>
                            {selectedCustomer.Amount}
                          </Typography>

                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Application Date:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.applicationDate}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                  <Grid item xs={12} md={8}>
                    <Paper
                      elevation={5}
                      sx={{
                        padding: 2,
                        marginTop: "30px",
                        background: "#fff",
                        display: "flex",
                        width: "auto",
                        flexDirection: "row",
                      }}
                    >
                      {/* Loan Status Section */}

                      {/* Documents Section */}
                      <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
                        Documents:
                      </Typography>

                      {documents.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            gap: 1,
                          }}
                        >
                          {documents.map((doc, index) => (
                            <Box
                              key={index}
                              sx={{
                                mt: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px", // Increased padding for better spacing
                                backgroundColor: "#f5f5f5", // Light grey background
                                borderRadius: "8px", // Rounded corners
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)", // Subtle shadow for a nice effect
                                transition: "transform 0.2s ease", // Add smooth transition
                                "&:hover": {
                                  transform: "scale(1.02)", // Slight zoom on hover
                                },
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{ color: "#2c3ce3", flexGrow: 1 }}
                              >
                                {doc.type}
                              </Typography>
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#2c3ce3",
                                  fontWeight: "bold",
                                }}
                              >
                                Open
                              </a>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography>No documents available.</Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Section to display documents based on customer ID */}
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      width: "50%",
                      maxWidth: 1600,
                      mt: 5,
                      position: "fixed",
                      flexDirection: "row", // Make the container row-wise
                      alignItems: "flex-start", // Align items to the top
                    }}
                  ></Grid>

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

                  {/* History Section */}
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
                    marginTop: "-45px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* Display current loan status */}
                    <Typography
                      variant="h6"
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      Loan Status:
                    </Typography>

                    {/* Button to change status */}
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 1,
                        backgroundColor: theme.palette.primary.main,
                        overflow: "hidden",
                      }}
                    >
                      {loanStatus}
                    </Button>

                    {/* Dropdown menu for status options */}
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(loanStatus)}
                    >
                      <MenuItem onClick={() => handleClose("submitted")}>
                        Submitted
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("under_review")}>
                        Under Review
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("approved")}>
                        Approved
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("hold")}>
                        Hold
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("disbursed")}>
                        Disbursed
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("rejected")}>
                        Rejected
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      Employee Status:
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleEmployeeClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 1,
                        backgroundColor: theme.palette.primary.main,
                        marginRight: "2px",
                        marginTop: "5px",
                      }}
                    >
                      {employeeStatus}
                    </Button>
                    <Menu
                      anchorEl={employeeAnchorEl}
                      open={Boolean(employeeAnchorEl)}
                      onClose={() => handleEmployeeClose(employeeStatus)}
                    >
                      <MenuItem onClick={() => handleEmployeeClose("hold")}>
                        Hold
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleEmployeeClose("forwarded")}
                      >
                        Forwarded
                      </MenuItem>
                      <MenuItem onClick={() => handleEmployeeClose("close")}>
                        Closed
                      </MenuItem>
                      <MenuItem onClick={() => handleEmployeeClose("done")}>
                        Done
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" flexDirection="column">
                    <label htmlFor="file-upload"></label>
                    <input
                      accept="image/*, .pdf"
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                    />

                    {/* Files Display */}
                    {selectedFiles.length > 0 && (
                      <Box mt={2}>
                        {selectedFiles.map((file, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 1, bgcolor: "#f0f0f0", p: 1 }}
                          >
                            <Typography variant="body2">{file.name}</Typography>
                            <IconButton
                              onClick={() => removeFile(index)}
                              size="small"
                            >
                              <DeleteIcon
                                sx={{
                                  color: "red",
                                }}
                              />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

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

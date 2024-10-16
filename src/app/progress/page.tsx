"use client";

import React, { useState, MouseEvent, useEffect } from "react";

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
  Autocomplete,
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
import { useGetCustomers } from "@/hooks/customer";
import { useGetUsers } from "@/hooks/user";
import {
  fetchStatusAndDocuments,
  fetchEmployeeStatus,
} from "../../redux/features/employeeSlice";

import { setUsers } from "@/redux/features/userSlice";

import { RootState } from "../../redux/store";
import { Utility } from "@/utils";
import { setCustomers } from "@/redux/features/customerSlice";
import Loader from "../components/common/Loader";
import TrackingForm from "./trackingForm";

const Progress: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false); // for tracking form to open

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
  const [loading, setLoading] = useState(true);
  const [ticketId, setTicketId] = useState("");
  const { getLocalStorage } = Utility();
  const ids = getLocalStorage("ids");

  const [currentAssignee, setCurrentAssignee] = useState(null);

  const { customer } = useSelector((state: RootState) => state.customer);

  const { data } = useGetCustomers([], `get-loan-applications`);
  const { user } = useGetUsers([], `get-users`);

  // Log the fetched user data to the console
  useEffect(() => {
    if (user) {
      console.log("Fetched Users from API:", user);
    } else {
      console.log("No users fetched or still loading...");
    }
  }, [user]);

  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  useEffect(() => {
    if (data?.success === true) {
      dispatch(setCustomers(data.data));
    }
  }, [data]);

  useEffect(() => {
    const storedTicketId = getLocalStorage("ticketId");
    if (storedTicketId) {
      setTicketId(storedTicketId);
    }
  }, []);

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

  useEffect(() => {
    if (ids) {
      dispatch(
        fetchStatusAndDocuments({
          applicationId: ids.applicationId,
          customerId: ids.customerId,
        })
      );
      dispatch(fetchEmployeeStatus(ids.applicationId));
    }
  }, [ids.applicationId, ids.customerId]);

  useEffect(() => {
    if (ids.customerId) {
      const selectdCustomer = customer.find(
        (cust) => cust.Id === ids.customerId
      );

      if (selectdCustomer) {
        setSelectedCustomer(selectdCustomer);
      }
    }
  }, [ids.customerId, customer]);

  const handleBack = () => {
    window.history.back();
  };

  if (!selectedCustomer) {
    return <Loader />;
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
                  sx={{
                    bgcolor: "#ffffff",
                    color: theme.palette.primary.main,
                  }}
                  alt={selectedCustomer.Name}
                  src={selectedCustomer.Image}
                />
              </Toolbar>
            </AppBar>

            <Grid
              container
              spacing={2}
              sx={{ width: "100%", maxWidth: 1600, mt: 5, position: "fixed" }}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 4,
                    height: "auto",
                    marginTop: "-50px",
                    background: "#fff",
                    marginLeft: "-60px",
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
                      <Typography variant="h6">
                        Ticket ID: {ticketId}
                      </Typography>
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
                    {/* Larger Avatar */}
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
                        width: "145%",
                        flexDirection: "row",
                        borderRadius: "10px",
                      }}
                    >
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
                                padding: "10px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.02)",
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
                            <strong>16 Aug 2003:</strong> Action performed by
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
                            <strong>15 Aug 2003:</strong> Action performed by
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
                    position: "fixed",
                    width: "500px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      padding: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        flexGrow: 1,
                        marginLeft: "-18px",
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
                    >
                      Loan Status:
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 2,
                        minWidth: "100px",
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        fontWeight: "bold",
                        ":hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      {selectedCustomer.status}
                    </Button>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(selectedCustomer.status)}
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
                    sx={{
                      width: "100%",
                      padding: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        flexGrow: 1,
                        marginLeft: "-18px",
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
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
                        paddingX: 2, // Consistent padding for better spacing
                        minWidth: "100px", // Fixed minWidth for consistent button size
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff", // White text for better contrast
                        fontWeight: "bold",
                        ":hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
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
                              sx={{
                                color: "red",
                              }}
                              onClick={() => removeFile(index)}
                              size="small"
                            >
                              <DeleteIcon />
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
                    <Autocomplete
                      options={assignees}
                      getOptionLabel={(option) => option.name}
                      style={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Assignee"
                          variant="outlined"
                        />
                      )}
                      value={selectedCustomer}
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
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        marginTop: "20px",
                        padding: "0px 1px",
                      }}
                    >
                      Time tracking
                    </Typography>

                    {/* TextField with a placeholder */}
                    <TextField
                      placeholder="Lock Your TimeLog"
                      onClick={() => setOpenDialog(true)}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
          <TrackingForm openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </LocalizationProvider>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default Progress;

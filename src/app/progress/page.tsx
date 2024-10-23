"use client";

import React, { useState, MouseEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
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
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Autocomplete,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import {
  Bolt as BoltIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";

import { useMode, ColorModeContext } from "../../../theme";
import { useGetUsers } from "@/hooks/user";

import { useGetTickets, useModifyTicket } from "@/hooks/ticket";
import {
  fetchStatusAndDocuments,
  fetchEmployeeStatus,
} from "../../redux/features/employeeSlice";

import Loader from "../components/common/Loader";
import ProgressBar from "../components/common/ProgressBar";
import Comments from "./Comments";
import WorkLogList from "./Worklog";
import TrackingForm from "./trackingForm";
import Toast from "../components/common/Toast";
import { RootState } from "../../redux/store";
import { Utility } from "@/utils";

const Progress: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [theme, colorMode] = useMode();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<string>("Comments");
  const [ticketId, setTicketId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [progress, setProgress] = useState(0); // State to store progress percentage
  const [overage, setOverage] = useState(0); // Orange part (exceeding estimated time)
  const [newLoanStatus, setNewLoanStatus] = useState('');
  const [newEmployeeStatus, setNewEmployeeStatus] = useState('');
  const {
    status: employeeStatus,
    loanStatus,
    documents,
  } = useSelector((state: RootState) => state.employee);
  const { toast } = useSelector((state: RootState) => state.toast);

  const dispatch = useDispatch();
  const { getLocalStorage, setSessionStorage, getSessionStorage, toastAndNavigate } = Utility();
  const original_estimate = getLocalStorage("ids")?.estimate;
  const ids = getLocalStorage("ids");
  const forwardedUserId = getSessionStorage("forwardedUserId");
  const storedTicketId = ticketId?.split("-")[1];

  const [timeLoggingEstimate, setTimeLoggingEstimate] = useState({
    isHovered: false,
    originalEstimate: original_estimate,
    timeSpent: 0,
  });

  const { data: userData } = useGetUsers([], `get-users`);

  const { value: ticketData } = useGetTickets(
    [],
    `get-ticket-logs/${storedTicketId}`
  );
  const { value: applicationData } = useGetTickets(
    [],
    `get-application-as-ticket/${ids.applicationId}`
  );
  const { modifyTicket } = useModifyTicket("update-ticket");

  useEffect(() => {
    if (userData?.data) {
      setAllUsers(userData.data);

      if (forwardedUserId) {
        const forwardedUser = userData.data.find(user => user.id === parseInt(forwardedUserId, 10));
        setSelectedUser(forwardedUser || null);
      }
    }
  }, [userData?.data, forwardedUserId]);

  useEffect(() => {
    if (ids.applicationId && ids.customerId) {
      dispatch(fetchStatusAndDocuments({
        applicationId: ids.applicationId,
        customerId: ids.customerId,
      }));
      dispatch(fetchEmployeeStatus(ids.applicationId));

      setNewLoanStatus(loanStatus);
      setNewEmployeeStatus(employeeStatus);
    }
    const selectedCustomer = applicationData?.data?.find(cust => cust.Id === ids.customerId);
    if (selectedCustomer) {
      setSelectedCustomer(selectedCustomer);
    }
  }, [ids?.applicationId, ids?.customerId, loanStatus, employeeStatus, applicationData?.data]);


  useEffect(() => {
    const storedTicketId = getLocalStorage("ticketId");
    if (storedTicketId && !ticketId) {
      setTicketId(storedTicketId);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketData?.data) {
      const totalHours = ticketData.data.reduce((acc: number, ticket: any) => {
        return acc + parseTimeSpent(ticket.time_spent);
      }, 0);

      const finalTime = convertHoursToDaysAndHours(totalHours);
      console.log(finalTime, "final total time");
      setTimeLoggingEstimate({
        ...timeLoggingEstimate,
        timeSpent: finalTime,
      });
      const originalEstimate = parseTimeSpent(timeLoggingEstimate.originalEstimate);

      // Only recalculate progress if originalEstimate and totalHours are valid
      if (originalEstimate > 0) {
        const calculatedProgress = Math.min((totalHours / originalEstimate) * 100, 100); // max 100%
        const calculatedOverage = totalHours > originalEstimate
          ? ((totalHours - originalEstimate) / originalEstimate) * 100
          : 0;

        setProgress(calculatedProgress); // Blue bar
        setOverage(calculatedOverage); // Orange bar
      }
    }
  }, [ticketData?.data, timeLoggingEstimate.originalEstimate]);

  const parseTimeSpent = (timeSpent: string): number => {
    const timeRegex = /^(\d+)([hdm])$/;
    const match = timeSpent.match(timeRegex);

    if (!match) return 0; // Return 0 if the format is invalid

    const [, value, unit] = match;
    const numericValue = parseInt(value, 10);

    switch (unit) {
      case "h": // hours
        return numericValue;
      case "d": // days (assuming 1 day = 8 working hours)
        return numericValue * 8;
      case "m": // minutes (convert to hours)
        return numericValue / 60;
      default:
        return 0;
    }
  };

  // Function to convert hours back into 'Xd Yh' format
  const convertHoursToDaysAndHours = (totalHours: number): string => {
    const totalMinutes = Math.round(totalHours * 60); // Convert total hours to total minutes
    const days = Math.floor(totalMinutes / (8 * 60)); // 1 day = 8 hours = 480 minutes
    const remainingMinutesAfterDays = totalMinutes % (8 * 60); // Remaining minutes after accounting for days
    const hours = Math.floor(remainingMinutesAfterDays / 60); // Convert remaining minutes to hours
    const minutes = remainingMinutesAfterDays % 60; // Get remaining minutes

    let formattedTime = "";

    if (days > 0) {
      formattedTime += `${days}d`;
    }
    if (hours > 0 || days === 0) {
      // Show hours if there are any, or if there are no days
      formattedTime += `${days > 0 ? " " : ""}${hours}h`;
    }
    if (minutes > 0) {
      formattedTime += `${days > 0 || hours > 0 ? " " : ""}${minutes}m`; // Add space if days or hours exist
    }
    return formattedTime || "0h";
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setTimeLoggingEstimate((prevState) => ({
      ...prevState,
      originalEstimate: value,
    }));
  };

  const handleChangeLoanStatus = async (event) => {
    setNewLoanStatus(event.target.value);
    try {
      const { data } = await axios.patch(
        'http://localhost:8080/api/v1/update-loan-tracking',
        {
          customer_application_id: ids.applicationId,
          status: event.target.value,
        }
      );
      toastAndNavigate(dispatch, true, "info", "Status Changed Successfully");
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Changing Status");
      console.log('Error updating loan tracking:', error);
    }
  };

  const handleChangeEmployeeStatus = async (event) => {
    setNewEmployeeStatus(event.target.value);
    try {
      const updateData = event.target.value !== 'forwarded'
        ? { status: event.target.value }
        : { status: event.target.value, forwarded_to: null };

      await modifyTicket(+storedTicketId, updateData);
      if (event.target.value !== 'forwarded') {
        toastAndNavigate(dispatch, true, "info", "Status Changed Successfully");
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Changing Status");
      console.log('Error updating loan tracking:', error);
    }
  };

  const handleForwardAutocomplete = async (value) => {
    setSelectedUser(value);
    setSessionStorage("forwardedUserId", value.id);
    try {
      await modifyTicket(+storedTicketId,
        { forwarded_to: value.id }
      );
      toastAndNavigate(dispatch, true, "info", "User Assigned Successfully");
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Assigning User");
      console.log('Error updating loan tracking:', error);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const showComments = () => setActiveSection("Comments");
  const showHistory = () => setActiveSection("History");
  const showWorkLog = () => setActiveSection("WorkLog");

  if (!selectedCustomer) {
    return <Loader />;
  }

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container
            maxWidth={false}
            sx={{
              height: "auto",
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

            <Grid container spacing={2} sx={{ width: "100%", mt: 5 }}>
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
                      variant="h5"
                      sx={{
                        color: "#2c3ce3",
                        textDecoration: "underline",
                        fontSize: "24px",
                      }}
                    >
                      Ticket ID: {ticketId}
                    </Typography>
                  </Box>

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
                                backgroundColor: "#F5F5F5",
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
                                sx={{ color: "#2C3CE3", flexGrow: 1 }}
                              >
                                {doc.type}
                              </Typography>
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#2C3CE3",
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
                    <Comments storedTicketId={storedTicketId} theme={theme} />
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
                    <WorkLogList ticketData={ticketData?.data} />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={2}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    height: "60vh",
                    marginTop: "-50px",
                    width: "400px",
                    mb: 7,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ width: "100%", padding: 1 }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
                    >
                      Loan Status:
                    </Typography>

                    <Grid item xs={6} md={4} mt={1}>
                      <FormControl
                        variant="filled"
                        sx={{ minWidth: 140 }}
                      >
                        <InputLabel>
                          Loan Status
                        </InputLabel>
                        <Select
                          label="Loan Status"
                          variant="filled"
                          value={newLoanStatus}
                          onChange={handleChangeLoanStatus}
                        >
                          <MenuItem value="submitted">Submitted</MenuItem>
                          <MenuItem value="under_review">Under Review</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="hold">Hold</MenuItem>
                          <MenuItem value="disbursed">Disbursed</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Box>

                  {/* Employee Status FormControl */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ width: "100%", padding: 1 }}
                  >
                    {/* Left side: Typography */}
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
                    >
                      Employee Status:
                    </Typography>

                    {/* Right side: FormControl in Grid */}
                    <Grid item xs={6} md={4} mt={2}>
                      <FormControl
                        variant="filled"
                        sx={{ minWidth: 140 }}
                      >
                        <InputLabel>
                          Employee Status
                        </InputLabel>
                        <Select
                          label="Employee Status"
                          variant="filled"
                          value={newEmployeeStatus}
                          onChange={handleChangeEmployeeStatus}
                        >
                          <MenuItem value="to do">To Do</MenuItem>
                          <MenuItem value="in progress">In Progress</MenuItem>
                          <MenuItem value="on hold">On Hold</MenuItem>
                          <MenuItem value="forwarded">Forwarded</MenuItem>
                          <MenuItem value="close">Close</MenuItem>
                          <MenuItem value="done">Done</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Box>

                  {/* Conditionally render the dropdown if the status is forwarded */}
                  <Box>
                    {newEmployeeStatus === "forwarded" && (
                      <Autocomplete
                        options={allUsers || []}
                        getOptionLabel={(option) => option.username}
                        value={selectedUser}
                        onChange={(event, value) => handleForwardAutocomplete(value)}
                        sx={{ width: '400px' }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Select User"
                            variant="filled"
                            type="text"
                          />
                        )}
                      />
                    )}
                  </Box>
                  <Divider sx={{ my: 1 }} />
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
                      <Avatar
                        sx={{
                          bgcolor: "#fff",

                          color: theme.palette.primary.main,
                        }}
                        alt={selectedCustomer.Name}
                        src={selectedCustomer.Image}
                      />
                      <Typography variant="body2">
                        {selectedCustomer.Name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={2}
                    onMouseEnter={() =>
                      setTimeLoggingEstimate((prevState) => ({
                        ...prevState,
                        isHovered: true,
                      }))
                    }
                    onMouseLeave={() =>
                      setTimeLoggingEstimate((prevState) => ({
                        ...prevState,
                        isHovered: false,
                      }))
                    }
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Original estimate:
                    </Typography>

                    {!timeLoggingEstimate.isHovered ? (
                      <Typography
                        variant="body2"
                        sx={{
                          borderRadius: "50%",
                          backgroundColor: "#DFE1E6",
                          padding: "6px",
                        }}
                      >
                        {timeLoggingEstimate.originalEstimate}
                      </Typography>
                    ) : (
                      <TextField
                        // variant="outlined"
                        value={timeLoggingEstimate.originalEstimate}
                        onChange={handleInputChange}
                        onFocus={() =>
                          setTimeLoggingEstimate((prevState) => ({
                            ...prevState,
                            isHovered: true,
                          }))
                        }
                        onBlur={() =>
                          setTimeLoggingEstimate((prevState) => ({
                            ...prevState,
                            isHovered: false,
                          }))
                        }
                        sx={{
                          width: "60%",
                          border: "none !important",
                          height: "20% !important",
                          backgroundColor: timeLoggingEstimate.isHovered
                            ? "#e0e0e0"
                            : "transparent",
                          // borderRadius: "4px",
                          visibility: timeLoggingEstimate.isHovered
                            ? "show"
                            : "hidden",
                        }}
                      />
                    )}
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

                    <Box display="flex" width="60%" mt={2}>
                      <ProgressBar
                        setOpenDialog={setOpenDialog}
                        timeLoggingEstimate={timeLoggingEstimate}
                        progress={progress}
                        overage={overage}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
          <TrackingForm
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            timeLoggingEstimate={timeLoggingEstimate}
            setTimeLoggingEstimate={setTimeLoggingEstimate}
            progress={progress}
            setProgress={setProgress}
            overage={overage}
            setOverage={setOverage}
          />
        </LocalizationProvider>
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default Progress;

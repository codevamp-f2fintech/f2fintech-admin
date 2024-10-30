"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Container,
  Box,
  Grid,
  Typography,
  Divider,
  TextField,
  Paper,
  Avatar,
  MenuItem,
  Autocomplete,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";

import { useMode, ColorModeContext } from "../../../theme";
import { useGetUsers } from "@/hooks/user";
import { useGetTickets, useModifyTicket } from "@/hooks/ticket";
import {
  useGetTicketHistory,
  useCreateTicketHistory,
} from "@/hooks/tickethistory";
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
import History from "./History";

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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
  const [newLoanStatus, setNewLoanStatus] = useState("");
  const [newEmployeeStatus, setNewEmployeeStatus] = useState("");
  const {
    status: employeeStatus,
    loanStatus,
    documents,
  } = useSelector((state: RootState) => state.employee);
  const { toast } = useSelector((state: RootState) => state.toast);

  const dispatch = useDispatch();
  const {
    decodedToken,
    getLocalStorage,
    setSessionStorage,
    getSessionStorage,
    toastAndNavigate,
  } = Utility();
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
    `get-application-as-ticket/${ids?.applicationId}`
  );
  const { modifyTicket } = useModifyTicket("update-ticket");

  // Fetch ticket history data
  const { value: ticketHistory, refetch } = useGetTicketHistory(
    [],
    `get-ticket-histories/${storedTicketId}`
  );

  // Hook for creating new ticket history
  const { createTicketHistory } = useCreateTicketHistory(
    "create-ticket-history"
  );

  useEffect(() => {
    if (userData?.data) {
      setAllUsers(userData.data);

      if (forwardedUserId) {
        const forwardedUser = userData.data.find(
          (user) => user.id === parseInt(forwardedUserId, 10)
        );
        setSelectedUser(forwardedUser || null);
      }
    }
  }, [userData?.data, forwardedUserId]);

  useEffect(() => {
    if (ids?.applicationId && ids?.customerId) {
      dispatch(
        fetchStatusAndDocuments({
          applicationId: ids.applicationId,
          customerId: ids.customerId,
        })
      );
      dispatch(fetchEmployeeStatus(ids?.applicationId));
    }
    const selectedCustomer = applicationData?.data?.find(
      (cust) => cust.Id === ids.customerId
    );
    if (selectedCustomer) {
      setSelectedCustomer(selectedCustomer);
    }
  }, [ids?.applicationId, ids?.customerId, applicationData?.data]);

  useEffect(() => {
    if (loanStatus) {
      setNewLoanStatus(loanStatus);
    }

    if (employeeStatus) {
      setNewEmployeeStatus(employeeStatus);
    }
  }, [loanStatus, employeeStatus]);

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
      setTimeLoggingEstimate({
        ...timeLoggingEstimate,
        timeSpent: finalTime,
      });
      const originalEstimate = parseTimeSpent(
        timeLoggingEstimate.originalEstimate
      );

      // Only recalculate progress if originalEstimate and totalHours are valid
      if (originalEstimate > 0) {
        const calculatedProgress = Math.min(
          (totalHours / originalEstimate) * 100,
          100
        ); // max 100%
        const calculatedOverage =
          totalHours > originalEstimate
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
    const oldStatus = newLoanStatus; // Capture the old status before changing
    const newStatus = event.target.value;
    setNewLoanStatus(newStatus);

    try {
      await axios.patch(`${process.env.WEB_URL}/update-loan-tracking`, {
        customer_application_id: ids?.applicationId,
        status: newStatus,
      });
      const loggedInUser = decodedToken()?.username;
      const historyMessage = `<b>${loggedInUser}</b> changed status from ${oldStatus} to ${newStatus}`;

      await createTicketHistory({
        ticket_id: storedTicketId,
        action: historyMessage,
      });

      toastAndNavigate(dispatch, true, "info", "Status Changed Successfully");
      await refetch();
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Changing Status");
    }
  };

  const handleChangeEmployeeStatus = async (event) => {
    const oldStatus = newEmployeeStatus;
    const newStatus = event.target.value;
    setNewEmployeeStatus(newStatus);

    try {
      const updateData =
        newStatus !== "forwarded"
          ? { status: newStatus }
          : { status: newStatus, forwarded_to: null };
      await modifyTicket(+storedTicketId, updateData);

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `<b>${loggedInUser}</b> changed status from ${oldStatus} to ${newStatus}`;
      await createTicketHistory({
        ticket_id: storedTicketId,
        action: historyMessage,
      });

      if (newStatus !== "forwarded") {
        toastAndNavigate(dispatch, true, "info", "Status Changed Successfully");
      }
      await refetch();
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Changing Status");
    }
  };

  const handleForwardAutocomplete = async (value) => {
    setSelectedUser(value);
    setSessionStorage("forwardedUserId", value.id);
    try {
      await modifyTicket(+storedTicketId, { forwarded_to: value.id });

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `<b>${loggedInUser}</b> forwarded the ticket to <b>${value.username}</b>`;
      await createTicketHistory({
        ticket_id: storedTicketId,
        action: historyMessage,
      });

      toastAndNavigate(dispatch, true, "info", "User Forwarded Successfully");
      await refetch();
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Forwarding User");
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
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Grid
              container
              spacing={3}
              sx={{ mt: 0, display: "flex", alignItems: "center" }}
              padding={0}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 4,
                    background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                    borderRadius: "20px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                    sx={{}}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "white",
                        textDecoration: "none",
                        fontSize: "1.5rem",
                        fontFamily: "monospace",
                        fontStyle: "revert-layer",
                        fontWeight: "bold",
                      }}
                    >
                      Ticket ID: {ticketId}
                    </Typography>
                  </Box>

                  <Box
                    mt={2}
                    p={2}
                    border={1}
                    borderColor="white"
                    display="flex"
                    alignItems="center"
                    justifyContent={"space-between"}
                    gap={2}
                    sx={{
                      borderRadius: "14px",
                    }}
                  >
                    <Avatar
                      src={selectedCustomer.Image}
                      sx={{ width: 80, height: 80 }}
                    />

                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#212121",
                        "&:hover": {
                          transform: "scale(1.02)",
                          transition: "transform 0.3s ease",
                        },
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Name and Email */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Name:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Name}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Email:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Email}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* Contact and Amount */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Contact:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Contact}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Designation:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Designation}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Location:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Location}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              tenure:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
                              {selectedCustomer.Tenure}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            component="span"
                            sx={{ color: "white", mr: 1 }}
                          >
                            Amount:
                          </Typography>
                          <Typography component="span" sx={{ color: "white" }}>
                            {selectedCustomer.Amount}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "white", mr: 1 }}
                            >
                              Application Date:
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "white" }}
                            >
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
                        marginTop: "5vh",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: "10px",
                        width: "41vw",
                        background: `
                          linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
                        `,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 0,
                          mt: 0,
                          color: "white",
                          fontSize: "1rem",
                        }}
                      >
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
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: ".8rem",
                                background: "white",
                                borderRadius: "8px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease",
                                width: "30vw",
                                marginLeft: "1.5rem",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                  transition: "transform 0.3s ease",
                                },
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{ color: "black", flexGrow: 1 }}
                              >
                                {doc.type}
                              </Typography>
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "black",
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

                  <Box
                    mt={4}
                    mb={4}
                    sx={{
                      height: "7vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      borderRadius: "15px",
                      width: "20vw",
                      background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                    }}
                  >
                    <Typography
                      variant="h6"
                      // fontWeight="bold"
                      sx={{
                        ml: 2,
                        mt: 0,
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
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
                          color: "black",
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
                          color: "black",
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
                          color: "black",
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
                    <History ticketHistory={ticketHistory?.data} />
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
                    height: "72vh",
                    width: "400px",
                    borderRadius: "20px",
                    position: "fixed",
                    top: "20vh",
                    background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      padding: 2,
                      border: "1px solid white",
                      borderRadius: "15px",
                      fontSize: "1rem",
                      background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Loan Status:
                    </Typography>

                    <Grid item xs={6} md={5} mt={0}>
                      <FormControl
                        variant="filled"
                        sx={{
                          background: "white",
                          borderRadius: "15px",
                          "&:hover": {
                            transform: "scale(1.02)",
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        <InputLabel>Loan Status</InputLabel>
                        <Select
                          label="Loan Status"
                          variant="filled"
                          disableUnderline
                          value={newLoanStatus}
                          onChange={handleChangeLoanStatus}
                          sx={{ borderRadius: "15px", width: "8vw" }}
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
                    sx={{
                      padding: 2,
                      border: "1px solid white",
                      borderRadius: "15px",
                      fontSize: "1rem",
                      mt: "1rem",
                      background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    {/* Left side: Typography */}
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        "&:hover": {
                          transform: "scale(1.02)",
                          transition: "transform 0.3s ease",
                        },
                      }}
                    >
                      Employee Status:
                    </Typography>

                    {/* Right side: FormControl in Grid */}
                    <Grid item xs={6} md={5} mt={0}>
                      <FormControl
                        variant="filled"
                        sx={{
                          background: "white",
                          borderRadius: "15px",
                        }}
                      >
                        <InputLabel>Employee Status</InputLabel>
                        <Select
                          label="Employee Status"
                          variant="filled"
                          disableUnderline
                          value={newEmployeeStatus}
                          onChange={handleChangeEmployeeStatus}
                          sx={{ borderRadius: "15px", width: "8vw" }}
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
                  <Box
                    sx={{
                      borderRadius: "20px",
                      height: "7vh",
                      mt: "1vw",
                      width: "20.5vw",
                    }}
                  >
                    {newEmployeeStatus === "forwarded" && (
                      <Autocomplete
                        options={allUsers || []}
                        getOptionLabel={(option) => option.username}
                        value={selectedUser}
                        onChange={(event, value) =>
                          handleForwardAutocomplete(value)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select User"
                            variant="outlined"
                            type="text"
                            sx={{
                              borderRadius: "20px",
                              "& .MuiOutlinedInput-root": {
                                color: "black",
                                backgroundColor: "#eeeeee",
                                "& fieldset": {
                                  borderColor: "lightblue",
                                },
                                "&:hover fieldset": {
                                  borderColor: "white",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "white",
                                },
                              },
                              "& .MuiInputLabel-root": {
                                color: "black",
                              },
                            }}
                          />
                        )}
                      />
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "white",
                          marginLeft: ".5rem",
                        }}
                      >
                        Assignee
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{ mr: "1vw", color: "white" }}
                      >
                        {capitalizeFirstLetter(decodedToken()?.username)}
                      </Typography>
                      <Avatar
                        sx={{
                          bgcolor: "#fff",
                          mr: ".8rem",

                          color: theme.palette.primary.main,
                        }}
                        alt={capitalizeFirstLetter(decodedToken()?.username)}
                        src={selectedCustomer.Image}
                      />
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
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "white",
                        marginLeft: ".5rem",
                      }}
                    >
                      Original Estimate
                    </Typography>

                    {!timeLoggingEstimate.isHovered ? (
                      <Typography
                        variant="body2"
                        sx={{
                          borderRadius: "50px",
                          backgroundColor: "#fff",
                          padding: ".8rem",
                          mr: ".8rem",
                          fontSize: ".8rem",
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
                          width: "5vw",
                          border: "none !important",
                          backgroundColor: timeLoggingEstimate.isHovered
                            ? "#e0e0e0"
                            : "transparent",
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
                        marginTop: "3vh",
                        ml: ".5rem",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Time Tracking
                    </Typography>

                    <Box
                      display="flex"
                      width="12vw"
                      mt={2}
                      sx={{
                        color: "white",
                        mr: ".5vw",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
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

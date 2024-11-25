"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  useMediaQuery,
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

const ITEMS_PER_PAGE = 6; // Number of items per page

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

  const searchParams = useSearchParams(); // To get the query parameters
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const [limit] = useState<number>(ITEMS_PER_PAGE); // For backend pagination

  const {
    status: employeeStatus,
    loanStatus,
    documents,
  } = useSelector((state: RootState) => state.employee);
  const { toast } = useSelector((state: RootState) => state.toast);

  const dispatch = useDispatch();
  const {
    capitalizeFirstLetter,
    convertHoursToDaysAndHours,
    decodedToken,
    formatTenure,
    formatDate,
    formatAmount,
    getLocalStorage,
    parseTimeSpent,
    setSessionStorage,
    getSessionStorage,
    toastAndNavigate,
  } = Utility();
  const original_estimate = "1d";
  const ids = {
    customerId: searchParams.get("customerId") || null,
    applicationId: searchParams.get("applicationId") || null,
  };
  const forwardedUserId = getSessionStorage("forwardedUserId");
  const storedTicketId = ticketId?.split("-")[1];

  const [timeLoggingEstimate, setTimeLoggingEstimate] = useState({
    isHovered: false,
    originalEstimate: original_estimate,
    timeSpent: 0,
  });

  const { value: userData } = useGetUsers({}, "get-users", 1, 50);

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
    if (userData?.results) {
      setAllUsers(userData.results);

      if (forwardedUserId) {
        const forwardedUser = userData.results?.find(
          (user) => user.id == forwardedUserId
        );
        setSelectedUser(forwardedUser || null);
      }
    }
  }, [userData?.results, forwardedUserId]);

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
      (cust) => cust.Id == ids.customerId
    );
    if (selectedCustomer) {
      setSelectedCustomer(selectedCustomer);
    }
  }, [ids?.applicationId, ids?.customerId, applicationData?.data]);
  console.log("kya hai status", employeeStatus);

  useEffect(() => {
    if (loanStatus) {
      console.log("mai hoon", loanStatus);
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
      await axios.patch(
        `https://web.f2fintech.in/api/v1/update-loan-tracking`,
        {
          //external server API
          customer_application_id: ids?.applicationId,
          status: newStatus,
        }
      );
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
              justifyContent: "center",
              alignItems: "center",
              width: isMobile ? "95vw" : isTab ? "92vw" : "76vw",
              height: isMobile ? "" : isTab ? "80vh" : "",
            }}
          >
            <Grid
              container
              spacing={3}
              sx={{ mt: 0, display: "flex" }}
              padding={0}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: isMobile ? 3 : isTab ? 3 : 4,
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
                    justifyContent={"center"}
                    gap={2}
                    sx={{
                      borderRadius: "14px",
                    }}
                  >
                    <Avatar
                      src={selectedCustomer.Image}
                      sx={{
                        width: isMobile ? "2rem" : isTab ? "" : "4rem",
                        height: isMobile ? "2rem" : isTab ? "" : "4rem",
                        marginBottom: isMobile ? "40vh" : isTab ? "" : "",
                      }}
                    />

                    <Box
                      sx={{
                        flex: 1,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: "#1e1e1e",
                        border: "1px solid #fff",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                    >
                      <Grid container spacing={3}>
                        {/* Name and Email */}
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Name:</strong> {selectedCustomer.Name}
                          </Typography>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Email:</strong> {selectedCustomer.Email}
                          </Typography>
                        </Grid>

                        {/* Contact and Designation */}
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Contact:</strong> +91{" "}
                            {selectedCustomer.Contact}
                          </Typography>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Designation:</strong>{" "}
                            {selectedCustomer.Designation}
                          </Typography>
                        </Grid>

                        {/* Location and Tenure */}
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Location:</strong>{" "}
                            {selectedCustomer.Location}
                          </Typography>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Tenure:</strong>{" "}
                            {formatTenure(selectedCustomer.Tenure)}
                          </Typography>
                        </Grid>

                        {/* Amount and Application Date */}
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: "white", mb: 1 }}>
                            <strong>Amount:</strong>{" "}
                            {formatAmount(selectedCustomer.Amount)}
                          </Typography>
                          <Typography sx={{ color: "white" }}>
                            <strong>Application Date:</strong>{" "}
                            {formatDate(selectedCustomer.applicationDate)}
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
                        marginTop: isMobile ? "2vh" : isTab ? "2rem" : "5vh",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: "10px",
                        width: isMobile ? "73vw" : isTab ? "52vw" : "43.5vw",
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
                          fontSize: isMobile
                            ? ".7rem"
                            : isTab
                            ? "1rem"
                            : "1rem",
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
                      justifyContent: "space-between",
                      borderRadius: "10px",
                      width: isMobile ? "73vw" : isTab ? "52vw" : "43.5vw",
                      background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
                      pr: "7vw",
                    }}
                  >
                    <Typography
                      variant="h6"
                      // fontWeight="bold"
                      sx={{
                        ml: 2,
                        mt: 0,
                        color: "white",
                        fontSize: isMobile ? ".7rem" : isTab ? "1rem" : "1rem",
                      }}
                    >
                      Activity:
                    </Typography>

                    <Typography
                      component="span"
                      sx={{
                        backgroundColor:
                          activeSection === "Comments"
                            ? "lightblue"
                            : "#e8eaf6",
                        fontSize: isMobile ? ".7rem" : isTab ? ".9rem" : "12px",
                        borderRadius: "4px",
                        marginLeft: "10px",
                        padding: ".5rem",
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
                          activeSection === "History" ? "lightblue" : "#e8eaf6",
                        fontSize: isMobile ? ".7rem" : isTab ? ".9rem" : "12px",
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
                          activeSection === "WorkLog" ? "lightblue" : "#e8eaf6",
                        fontSize: isMobile ? ".7rem" : isTab ? ".9rem" : "12px",
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
                    padding: isMobile ? 2 : isTab ? 2 : 3,
                    height: isMobile ? "60vh" : isTab ? "42vh" : "75vh",
                    width: isMobile ? "85vw" : isTab ? "30vw" : "25vw",
                    borderRadius: "20px",
                    position: isMobile ? "" : isTab ? "fixed" : "fixed",
                    top: isTab ? "" : "20vh",
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
                          width: isMobile ? "30vw" : "8vw",
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
                          value={newLoanStatus}
                          onChange={handleChangeLoanStatus}
                          sx={{
                            borderRadius: "5px",
                            width: isMobile ? "30vw" : "8vw",
                          }}
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
                          value={newEmployeeStatus}
                          onChange={handleChangeEmployeeStatus}
                          sx={{
                            borderRadius: "15px",
                            width: isMobile ? "30vw" : "8vw",
                          }}
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
                      height: isMobile ? "5vh" : isTab ? "4vh" : "7vh",
                      mt: isMobile ? "3vw" : isTab ? "2vw" : "1vw",
                      width: isMobile ? "75vw" : isTab ? "26vw" : "20.5vw",
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
                          fontSize: isMobile
                            ? ".8rem"
                            : isTab
                            ? ".9rem"
                            : "14px",
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
                        fontSize: isMobile ? ".8rem" : "14px",
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
                        fontSize: isMobile ? ".8rem" : "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Time Tracking
                    </Typography>

                    <Box
                      display="flex"
                      mt={2}
                      sx={{
                        width: isMobile ? "25vh" : isTab ? "20vw" : "25vh",
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

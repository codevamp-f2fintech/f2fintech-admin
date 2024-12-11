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
  InputLabel,
  Select,
  FormControl,
  useMediaQuery,
  Button,
} from "@mui/material";
import { ArrowForwardRounded } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";

import Loader from "../components/common/Loader";
import ProgressBar from "../components/common/ProgressBar";
import Comments from "./Comments";
import History from "./History";
import WorkLogList from "./Worklog";
import TrackingForm from "./trackingForm";
import TicketDetail from "./TicketDetail";
import TicketDocuments from "./TicketDocuments";
import TicketVoiceNotes from "./TicketVoiceNotes";
import Toast from "../components/common/Toast";
import UserAutocomplete from "../components/common/UserAutocomplete";

import type { RootState } from "../../redux/store";
import { useMode, ColorModeContext } from "../../../theme";
import { useModifyTicket } from "@/hooks/ticket";
import { useGetTicketLogs } from "@/hooks/ticketLogs";
import {
  fetchStatusAndDocuments,
  fetchEmployeeStatus,
} from "../../redux/features/employeeSlice";
import { useGetUsers } from "@/hooks/user";
import { Utility } from "@/utils";
import {
  useCreateTicketHistory,
  useGetTicketHistory,
} from "@/hooks/tickethistory";

const employeeStatusObj = [
  { value: "under credit review", label: "Under Credit Review" },
  { value: "to be login", label: "To Be Login" },
  { value: "pendency in file", label: "Pendency in File" },
  { value: "to be approved", label: "To Be Approved" },
  { value: "to be disbursed", label: "To Be Disbursed" },
  { value: "file send to banker", label: "File Send to Banker" },
  { value: "tvr done", label: "TVR Done" },
  { value: "cam report done", label: "CAM Report Done" },
  { value: "relook", label: "Relook" }
];

const Progress: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [theme, colorMode] = useMode();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<string>("Comments");
  const [ticketId, setTicketId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0); // State to store progress percentage
  const [overage, setOverage] = useState(0); // Orange part (exceeding estimated time)
  const [newLoanStatus, setNewLoanStatus] = useState("");
  const [newEmployeeStatus, setNewEmployeeStatus] = useState("");

  const searchParams = useSearchParams(); // To get the query parameters
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const {
    status: employeeStatus,
    loanStatus,
    documents,
    voiceNoteUrl,
    notes,
  } = useSelector((state: RootState) => state.employee);
  const { toast } = useSelector((state: RootState) => state.toast);

  const dispatch = useDispatch();
  const {
    capitalizeFirstLetter,
    convertHoursToDaysAndHours,
    decodedToken,
    getLocalStorage,
    parseTimeSpent,
    toastAndNavigate,
  } = Utility();
  const original_estimate = "1d";
  const ids = {
    customerId: searchParams.get("customerId") || null,
    applicationId: searchParams.get("applicationId") || null,
  };
  const storedTicketId = ticketId?.split("-")[1];

  const [timeLoggingEstimate, setTimeLoggingEstimate] = useState({
    isHovered: false,
    originalEstimate: original_estimate,
    timeSpent: 0,
  });

  const { value: workLog } = useGetTicketLogs(
    [],
    `get-ticket-logs/${storedTicketId}`
  );

  const { value: applicationData } = useGetTicketLogs(
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

  const { value: userData } = useGetUsers({}, "get-users", 1, 100);

  useEffect(() => {
    if (workLog?.data) {
      const totalHours = workLog.data.reduce((acc: number, ticket: any) => {
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
  }, [workLog?.data, timeLoggingEstimate.originalEstimate]);

  useEffect(() => {
    if (
      ids?.applicationId &&
      ids?.customerId &&
      (!documents?.length || !loanStatus || !employeeStatus)
    ) {
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
      const historyMessage = `${loggedInUser} changed status from ${oldStatus} to ${newStatus}`;

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
      await modifyTicket(+storedTicketId, { status: newStatus });

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${loggedInUser} changed status from ${oldStatus} to ${newStatus}`;
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

  const handleForwardAutocomplete = async (value) => {
    setSelectedUser(value);
    try {
      await modifyTicket(+storedTicketId, {
        forwarded_to: value.id,
        is_forwarded: 1
      });

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${loggedInUser} forwarded the ticket to ${value.username}`;
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
              justifyContent: isMobile ? "" : isTab ? "" : "center",
              alignItems: isMobile ? "" : isTab ? "" : "center",
              width: isMobile ? "95vw" : isTab ? "92vw" : "76vw",
              height: isMobile ? "" : isTab ? "100vh" : "",
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
                  <TicketDetail
                    ticketId={ticketId}
                    selectedCustomer={selectedCustomer}
                    isMobile={isMobile}
                    isTab={isTab}
                  />

                  <TicketDocuments
                    isMobile={isMobile}
                    isTab={isTab}
                    documents={documents}
                  />
                  <TicketVoiceNotes
                    isMobile={isMobile}
                    isTab={isTab}
                    notes={notes}
                    storedTicketId={storedTicketId}
                    voiceNoteUrl={voiceNoteUrl}
                  />
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
                    <Comments storedTicketId={storedTicketId} theme={theme} userData={userData} />
                  )}

                  {/* History Section */}
                  {activeSection === "History" && (
                    <History ticketHistory={ticketHistory?.data} />
                  )}

                  {activeSection === "WorkLog" && (
                    <WorkLogList workLog={workLog} userData={userData} />
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
                          {employeeStatusObj.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Box>

                  <Grid item xs={6} md={5} mt={0}>
                    <Button
                      color="info"
                      endIcon={<ArrowForwardRounded />}
                      size="small"
                      variant="contained"
                      onClick={() => setNewEmployeeStatus('forwarded')}
                      sx={{
                        margin: '20px 0 0 5px'
                      }}
                    >
                      Forward
                    </Button>
                  </Grid>
                  {/* Conditionally render the dropdown if the status is forwarded */}
                  <UserAutocomplete
                    isMobile={isMobile}
                    isTab={isTab}
                    newEmployeeStatus={newEmployeeStatus}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    handleForwardAutocomplete={handleForwardAutocomplete}
                    userData={userData}
                  />
                  <Divider sx={{ my: 2 }} />

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

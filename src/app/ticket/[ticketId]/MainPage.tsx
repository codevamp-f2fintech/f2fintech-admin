"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Container,
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  Avatar,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  useMediaQuery,
  Button,
} from "@mui/material";
import { ArrowBackRounded, ArrowForwardRounded } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

import Loader from "../../components/common/Loader";
import Comments from "./Comments";
import OriginalEstimateField from "./OriginalEstimate";
import History from "./History";
import ProgressBar from "../../components/common/ProgressBar";
import WorkLogList from "./Worklog";
import TrackingForm from "./trackingForm";
import TicketDetail from "./TicketDetail";
import TicketDocuments from "./TicketDocuments";
import TicketVoiceNotes from "./TicketVoiceNotes";
import Toast from "../../components/common/Toast";
import UserAutocomplete from "../../components/common/UserAutocomplete";

import type { AppDispatch, RootState } from "@/redux/store";
import { useMode, ColorModeContext } from "../../../../theme";
import { useCreateTicketHistory } from "@/hooks/tickethistory";
import { useModifyTicket } from "@/hooks/ticket";
import { useGetUsers } from "@/hooks/user";
import { Utility } from "@/utils";

import { User } from "@/types/user";
import { fetcher } from "@/apis/apiClient";
import { useGetTicketLogs } from "@/hooks/ticketLogs";
import useIntersectionObserver from "@/hooks/IntersectionObserver";
import { TicketLogs } from "@/types/ticketLogs";

const employeeStatusObj = [
  { value: "under credit review", label: "Under Credit Review" },
  { value: "operations", label: "Operations" },
  { value: "pendency in file", label: "Pendency In File" },
  { value: "file send to banker", label: "File Send To Banker" },
  { value: "to be approved", label: "To Be Approved" },
  { value: "to be disbursed", label: "To Be Disbursed" },
  { value: "approved", label: "Approved" },
  { value: "disbursed", label: "Disbursed" },
  { value: "carry forward", label: "Carry Forward" },
  // { value: "to be login", label: "To Be Login" },
  // { value: "tvr done", label: "TVR Done" },
  // { value: "cam report done", label: "CAM Report Done" },
  // { value: "relook", label: "Relook" },
];

export interface TicketDetail {
  ticketId: number | string;
  userId: number | string;
  employeeStatus: string;
  voiceNoteUrl: string;
  forwardedTo: number | string;
  forwardedBy: number | string;
  isForwarded: number | null;
  originalEstimate: string;
  applicationProvider: string;
  applicationAmount: string | number;
  applicationTenure: number | string;
  applicationDate: Date | string;
  applicationId: number | string;
  customerId: number | string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  customerDocuments: string[];
  customerDesignation: string;
  customerLocation: string;
  loanStatus: string;
}

interface TicketDetailResponse {
  statusCode: string | number;
  message: string | "Ticket with Details retrieved successfully";
  data: {
    ticketId: number | string;
    userId: number | string;
    employeeStatus: string;
    voiceNoteUrl: string;
    forwardedTo: number | string;
    forwardedBy: number | string;
    isForwarded: number | null;
    originalEstimate: string;
    applicationProvider: string;
    applicationAmount: string | number;
    applicationTenure: number | string;
    applicationDate: Date | string;
    applicationId: number | string;
    customerId: number | string;
    customerName: string;
    customerEmail: string;
    customerContact: string;
    customerDocuments: string[];
    customerDesignation: string;
    customerLocation: string;
    loanStatus: string;
  };
}

const Progress: React.FC = () => {
  const [ ticketDetailData, setTicketDetailData ] = useState<TicketDetail>();
  const [ loading, setLoading ] = useState<boolean>( false );
  const [ openDialog, setOpenDialog ] = useState<boolean>( false );
  const [ activeSection, setActiveSection ] = useState<string>( "Comments" );
  const [ selectedUser, setSelectedUser ] = useState<User>();
  const [ theme, colorMode ] = useMode();

  const [ progress, setProgress ] = useState( 0 ); // State to store progress percentage
  const [ overage, setOverage ] = useState( 0 ); // Orange part (exceeding estimated time)
  const [ newLoanStatus, setNewLoanStatus ] = useState( "" );
  const [ newEmployeeStatus, setNewEmployeeStatus ] = useState( "" );
  const [ timeLoggingEstimate, setTimeLoggingEstimate ] = useState( {
    originalEstimate: '',
    timeSpent: '0',
  } );
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const [ hasFetched, setHasFetched ] = useState( false );   // New state to track if data is already fetched
  const workLogRef = useRef( null );
  const isVisible = useIntersectionObserver( workLogRef );

  const dispatch: AppDispatch = useDispatch();
  const params = useParams();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );
  const ticketId = params?.ticketId;
  const {
    capitalizeFirstLetter,
    convertHoursToDaysAndHours,
    decodedToken,
    parseTimeSpent,
    toastAndNavigate,
  } = Utility();

  const { createTicketHistory } = useCreateTicketHistory( "create-ticket-history" );
  const { modifyTicket } = useModifyTicket( "update-ticket" );
  const { value: userData } = useGetUsers( {} as User, "get-users", 1, 100 );
  const { value: workLog, refetch } = useGetTicketLogs(
    {} as TicketLogs,
    hasFetched ? `get-ticket-logs/${ ticketId }` : ''
  );

  useEffect( () => {
    if ( isVisible && !hasFetched )
    {
      refetch();
      setHasFetched( true );
    }
  }, [ isVisible, hasFetched ] );

  useEffect( () => {
    if ( ticketId )
    {
      setLoading( true );
      const fetchTicketDetails = async () => {
        try
        {
          const response: TicketDetailResponse = await fetcher(
            `get-ticket-with-detail/${ ticketId }`
          );
          if ( response.statusCode === 200 )
          {
            setTicketDetailData( response.data );
            setTimeLoggingEstimate( {
              ...timeLoggingEstimate,
              originalEstimate: response.data.originalEstimate,
            } );
            setNewLoanStatus( response.data.loanStatus );
            setNewEmployeeStatus( response.data.employeeStatus );
            setLoading( false );
          }
        } catch ( error )
        {
          setLoading( false );
          console.log( "Error fetching users:", error );
        }
      };
      fetchTicketDetails();
    }
  }, [ ticketId ] );

  useEffect( () => {
    if ( workLog?.data )
    {
      const totalHours = workLog?.data?.reduce(
        ( acc: number, ticket: any ) => {
          return acc + parseTimeSpent( ticket.time_spent ?? 0 );
        }, 0 );

      const finalTime = convertHoursToDaysAndHours( totalHours );
      setTimeLoggingEstimate( {
        ...timeLoggingEstimate,
        timeSpent: finalTime,
      } );
      const originalEstimate = parseTimeSpent(
        timeLoggingEstimate.originalEstimate
      );

      if ( originalEstimate > 0 )
      {
        const calculatedProgress = Math.min(
          ( totalHours / originalEstimate ) * 100,
          100
        );
        const calculatedOverage =
          totalHours > originalEstimate
            ? ( ( totalHours - originalEstimate ) / originalEstimate ) * 100
            : 0;

        setProgress( calculatedProgress );
        setOverage( calculatedOverage );
      }
    }
  }, [ workLog?.data, timeLoggingEstimate.originalEstimate ] );

  const handleChangeLoanStatus = async ( event: any ) => {
    const oldStatus = newLoanStatus;
    const newStatus = event.target.value;
    setNewLoanStatus( newStatus );

    try
    {
      await axios.patch(
        `${ process.env.NEXT_PUBLIC_WEB_URL }/update-loan-tracking`,
        {
          customer_application_id: ticketDetailData?.applicationId,
          status: newStatus,
        }
      );
      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } changed status from ${ oldStatus } to ${ newStatus }`;

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      toastAndNavigate( dispatch, true, "info", "Status Changed Successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Changing Status" );
    }
  };

  const handleChangeEmployeeStatus = async ( event: any ) => {
    const oldStatus = newEmployeeStatus;
    const newStatus = event.target.value;
    setNewEmployeeStatus( newStatus );

    try
    {
      await modifyTicket( +ticketId, { status: newStatus } );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } changed status from ${ oldStatus } to ${ newStatus }`;
      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );
      toastAndNavigate( dispatch, true, "info", "Status Changed Successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Changing Status" );
    }
  };

  const handleForwardAutocomplete = async ( value: any ) => {
    setSelectedUser( value );
    try
    {
      await modifyTicket( +ticketId, {
        forwarded_to: value.id,
        forwarded_by: decodedToken()?.id,
        is_forwarded: 1,
      } );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } forwarded the ticket to ${ value.username }`;
      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      toastAndNavigate( dispatch, true, "info", "Ticket Forwarded Successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Forwarding Ticket" );
    }
  };

  const showComments = () => setActiveSection( "Comments" );
  const showHistory = () => setActiveSection( "History" );
  const showWorkLog = () => setActiveSection( "WorkLog" );


  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>

        <Container
          sx={{
            display: "flex",
            justifyContent: isMobile ? "" : isTab ? "" : "center",
            alignItems: isMobile ? "" : isTab ? "" : "center",
            width: isMobile ? "95vw" : isTab ? "92vw" : "76vw",
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
                  backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
                  backgroundBlendMode: "multiply, screen, normal",
                  borderRadius: "20px",
                  boxShadow:
                    "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
                }}
              >
                <TicketDetail
                  ticketDetailData={ticketDetailData}
                  isMobile={isMobile}
                  isTab={isTab}
                />

                <TicketDocuments
                  isMobile={isMobile}
                  isTab={isTab}
                  documents={ticketDetailData?.customerDocuments ?? []}
                />
                <TicketVoiceNotes
                  isMobile={isMobile}
                  isTab={isTab}
                  ticketDetailData={ticketDetailData}
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
                    bgcolor: "#9575cd",
                  }}
                >
                  <Box
                    sx={{
                      width: "10vw",
                      height: "7vh",
                      borderRadius: "10px 0px 0px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      // fontWeight="bold"
                      sx={{
                        ml: 2,
                        mt: 0,
                        color: "white",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? "1rem"
                            : "1.1rem",
                      }}
                    >
                      Activity:
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: isMobile ? "60vw" : isTab ? "30vw" : "20vw",
                      height: "7vh",
                      borderRadius: "0px 10px 10px 0px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        backgroundColor:
                          activeSection === "Comments" ? "#f06292" : "white",
                        color:
                          activeSection === "Comments" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? ".9rem"
                            : "12px",
                        borderRadius: "4px",
                        marginLeft: "10px",
                        padding: ".4rem",
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
                          activeSection === "History" ? "#f06292" : "white",
                        color:
                          activeSection === "History" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? ".9rem"
                            : "12px",
                        borderRadius: "4px",
                        marginLeft: "10px",
                        padding: "6px",
                        cursor: "pointer"
                      }}
                      onClick={showHistory}
                    >
                      History
                    </Typography>
                    <Typography
                      component="span"
                      ref={workLogRef}
                      sx={{
                        backgroundColor:
                          activeSection === "WorkLog" ? "#f06292" : "white",
                        color:
                          activeSection === "WorkLog" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? ".9rem"
                            : "12px",
                        borderRadius: "4px",
                        marginLeft: "10px",
                        padding: "6px",
                        cursor: "pointer",
                      }}
                      onClick={showWorkLog}
                    >
                      Work Log
                    </Typography>
                  </Box>
                </Box>

                {activeSection === "Comments" && (
                  <Comments
                    storedTicketId={ticketId}
                    userData={userData}
                  />
                )}

                {/* History Section */}
                {activeSection === "History" && (
                  <History ticketId={ticketId} activeSection={activeSection} />
                )}

                {activeSection === "WorkLog" && (
                  <WorkLogList
                    userData={userData}
                    workLog={workLog?.data}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper
                elevation={4}
                sx={{
                  padding: isMobile ? 2 : isTab ? 2 : 3,
                  height: isMobile ? "64vh" : isTab ? "40vh" : "78vh",
                  width: isMobile ? "85vw" : isTab ? "30vw" : "25vw",
                  borderRadius: "20px",
                  position: isMobile ? "" : isTab ? "fixed" : "fixed",
                  top: isTab ? "" : "20vh",
                  backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
                }}
              >
                <Grid item xs={6} md={5} mt={0}>
                  <Button
                    color="info"
                    endIcon={<ArrowForwardRounded />}
                    size="small"
                    variant="contained"
                    onClick={() => setNewEmployeeStatus( "forwarded" )}
                    sx={{
                      bgcolor: "#f06292",
                      textAlign: "center",
                      textTransform: "uppercase",
                      backgroundSize: "200% auto",
                      color: "white",
                      borderRadius: "10px",
                      margin: ".4rem",
                    }}
                  >
                    Forward
                  </Button>
                </Grid>
                {/* Conditionally render the dropdown if the status is forwarded */}
                {newEmployeeStatus === "forwarded" && (
                  <UserAutocomplete
                    isMobile={isMobile}
                    isTab={isTab}
                    newEmployeeStatus={newEmployeeStatus}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    handleForwardAutocomplete={handleForwardAutocomplete}
                    userData={userData}
                    ticketId={ticketId}
                    userId={ticketDetailData?.userId}
                    isForwarded={ticketDetailData?.isForwarded}
                  />
                )}
                <Divider sx={{ my: 1 }} />

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
                    bgcolor: "#9575cd",
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
                        "& .MuiFilledInput-underline:before": {
                          borderBottom: "none", // Removes the underline in normal state
                        },
                        "& .MuiFilledInput-underline:after": {
                          borderBottom: "none", // Removes the underline in focused state
                        },

                        "& .MuiFilledInput-underline:hover:before": {
                          borderBottom: "none !important", // Remove underline on hover
                        },
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
                        {employeeStatusObj.map( ( status ) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ) )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>

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
                    bgcolor: "#9575cd",

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

                        "& .MuiFilledInput-underline:before": {
                          borderBottom: "none", // Removes the underline in normal state
                        },
                        "& .MuiFilledInput-underline:after": {
                          borderBottom: "none", // Removes the underline in focused state
                        },

                        "& .MuiFilledInput-underline:hover:before": {
                          borderBottom: "none !important", // Remove underline on hover
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
                        <MenuItem value="under credit review">
                          Under Credit Review
                        </MenuItem>
                        <MenuItem value="login">Login</MenuItem>
                        <MenuItem value="carry forward">
                          Carry Forward
                        </MenuItem>
                        <MenuItem value="drop">Drop</MenuItem>
                        <MenuItem value="relook">Relook</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
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
                      {capitalizeFirstLetter( decodedToken()?.username )}
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: "#fff",
                        mr: ".8rem",

                        color: theme.palette.primary.main,
                      }}
                      alt={capitalizeFirstLetter( decodedToken()?.username )}
                      src={capitalizeFirstLetter( decodedToken()?.username )}
                    />
                  </Box>
                </Box>
                <OriginalEstimateField
                  ticketId={ticketId}
                  initialEstimate={ticketDetailData?.originalEstimate}
                  userRole={decodedToken()?.role}
                />
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
                      timeLoggingEstimate={{
                        timeSpent: timeLoggingEstimate.timeSpent,
                        originalEstimate: timeLoggingEstimate.originalEstimate,
                      }}
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
          ticketDetailData={workLog?.data}
          ticketId={ticketId}
          originalEstimate={ticketDetailData?.originalEstimate}
        />
        <Toast
          alerting={toast.toastAlert}
          severity={toast.toastSeverity}
          message={toast.toastMessage}
        />
        {loading && <Loader />}
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default React.memo( Progress );

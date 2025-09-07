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
  TextField,
} from "@mui/material";
import { ArrowForwardRounded } from "@mui/icons-material";
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
  { value: "rejected", label: "Rejected" },
  { value: "drop", label: "Drop" },
  { value: "hold", label: "Hold" },
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
  provider: string;
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
  customerState: string;
  loanStatus: string;
  userRole: string;
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
    provider: string;
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
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String( today.getMonth() + 1 ).padStart( 2, '0' );
    const day = String( today.getDate() ).padStart( 2, '0' );
    return `${ year }-${ month }-${ day }`;
  };

  const [ disbursedDate, setDisbursedDate ] = useState( () => {
    // Only set saved date if ticket already has disbursed_at date
    return ticketDetailData?.disbursed_at
      ? new Date( ticketDetailData.disbursed_at ).toISOString().split( 'T' )[ 0 ]
      : "";
  } );

  const [ isDisbursedDateSaved, setIsDisbursedDateSaved ] = useState( () => {
    // If ticket already has disbursed_at date, consider it as saved
    return !!ticketDetailData?.disbursed_at;
  } );

  // Disbursed Amount States
  const [ disbursedAmount, setDisbursedAmount ] = useState( () => {
    return ticketDetailData?.disbursed_amount
      ? ticketDetailData.disbursed_amount.toString()
      : "";
  } );

  const [ isDisbursedAmountSaved, setIsDisbursedAmountSaved ] = useState( () => {
    return !!ticketDetailData?.disbursed_amount;
  } );


  const [ progress, setProgress ] = useState( 0 ); // State to store progress percentage
  const [ overage, setOverage ] = useState( 0 ); // Orange part (exceeding estimated time)
  const [ newLoanStatus, setNewLoanStatus ] = useState( "" );
  const [ newEmployeeStatus, setNewEmployeeStatus ] = useState( "" );
  const [ timeLoggingEstimate, setTimeLoggingEstimate ] = useState( {
    originalEstimate: "",
    timeSpent: "0",
  } );
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const [ hasFetched, setHasFetched ] = useState( false ); // New state to track if data is already fetched
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

  const { createTicketHistory } = useCreateTicketHistory(
    "create-ticket-history"
  );
  const { modifyTicket } = useModifyTicket( "update-ticket" );
  const { value: userData } = useGetUsers( {} as User, "get-users", 1, 200 );
  const { value: workLog, refetch } = useGetTicketLogs(
    {} as TicketLogs,
    hasFetched ? `get-ticket-logs/${ ticketId }` : ""
  );

  useEffect( () => {
    if ( isVisible && !hasFetched )
    {
      refetch();
      setHasFetched( true );
    }
  }, [ isVisible, hasFetched ] );

  // Updated useEffect for fetching ticket details
  useEffect( () => {
    if ( ticketId )
    {
      setLoading( true );
      const fetchTicketDetails = async () => {
        try
        {
          const response = await fetcher( `get-ticket-with-detail/${ ticketId }` );
          if ( response.statusCode === 200 )
          {
            setTicketDetailData( response.data );
            setTimeLoggingEstimate( {
              ...timeLoggingEstimate,
              originalEstimate: response.data.originalEstimate,
            } );
            setNewLoanStatus( response.data.loanStatus );
            setNewEmployeeStatus( response.data.employeeStatus );

            // Set disbursed date if ticket has one, otherwise keep empty
            if ( response.data.disbursed_at )
            {
              setDisbursedDate( new Date( response.data.disbursed_at ).toISOString().split( 'T' )[ 0 ] );
              setIsDisbursedDateSaved( true );
            } else if ( response.data.employeeStatus === "disbursed" )
            {
              // If status is disbursed but no date saved, set today's date
              setDisbursedDate( getTodayLocalDate() );
              setIsDisbursedDateSaved( false );
            }

            if ( response.data.disbursed_amount )
            {
              setDisbursedAmount( response.data.disbursed_amount.toString() );
              setIsDisbursedAmountSaved( true );
            } else if ( response.data.employeeStatus === "disbursed" )
            {
              setDisbursedAmount( response.data.applicationAmount?.toString() || "" );
              setIsDisbursedAmountSaved( false );
            }

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
      const totalHours = workLog?.data?.reduce( ( acc: number, ticket: any ) => {
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

  // Update your handleChangeEmployeeStatus function

  const handleChangeEmployeeStatus = async ( event: any ) => {
    const oldStatus = newEmployeeStatus;
    const newStatus = event.target.value;
    setNewEmployeeStatus( newStatus );

    if ( newStatus === "disbursed" && !disbursedDate )
    {
      setDisbursedDate( getTodayLocalDate() );
    }
    // Clear disbursed date if status is not disbursed
    if ( newStatus !== "disbursed" )
    {
      setDisbursedDate( "" );
    }

    try
    {
      let updatePayload = { status: newStatus };

      // If disbursed status is selected and date is provided, include it in payload
      if ( newStatus === "disbursed" && disbursedDate && disbursedAmount )
      {
        updatePayload.disbursed_at = disbursedDate;
        updatePayload.disbursed_amount = parseFloat( disbursedAmount );
        await modifyTicket( +ticketId, updatePayload );
      }

      if ( newStatus !== "disbursed" )
      {
        await modifyTicket( +ticketId, updatePayload );
      }

      const loggedInUser = decodedToken()?.username;
      let historyMessage = `${ loggedInUser } changed File Status from ${ oldStatus } to ${ newStatus }`;

      // Add date info to history message if disbursed
      if ( newStatus === "disbursed" && disbursedDate && disbursedAmount )
      {
        historyMessage += ` with disbursement date: ${ disbursedDate } and amount: ${ disbursedAmount }`;
      }

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      if ( newStatus === "disbursed" && disbursedDate && disbursedAmount )
      { toastAndNavigate( dispatch, true, "info", "Status Changed Successfully" ); }
      else
      {
        toastAndNavigate( dispatch, true, "info", "Status Changed to Disbursed. Please save the disbursement date." );
      }
      if ( newStatus !== "disbursed" )
      {
        toastAndNavigate( dispatch, true, "info", "Status Changed Successfully" );
      }
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Changing Status" );
    }
  };

  // Combined handler for disbursed date and amount
  const handleCombinedDisbursementSubmit = async () => {
    if ( !disbursedDate )
    {
      toastAndNavigate( dispatch, true, "error", "Please enter disbursement date" );
      return;
    }

    if ( !disbursedAmount || parseFloat( disbursedAmount ) <= 0 )
    {
      toastAndNavigate( dispatch, true, "error", "Please enter a valid disbursement amount" );
      return;
    }

    try
    {
      const updatePayload = {
        status: "disbursed",
        disbursed_at: disbursedDate,
        disbursed_amount: parseFloat( disbursedAmount )
      };

      await modifyTicket( +ticketId, updatePayload );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } set disbursement details - Date: ${ disbursedDate }, Amount: ${ disbursedAmount }`;

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      setIsDisbursedDateSaved( true );
      setIsDisbursedAmountSaved( true );

      toastAndNavigate( dispatch, true, "info", "Disbursement details saved successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error saving disbursement details" );
    }
  };

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
      const historyMessage = `${ loggedInUser } changed Loan Status from ${ oldStatus } to ${ newStatus }`;

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
      const employeeRole = decodedToken()?.role;
      const loggedInUser = decodedToken()?.username;
      const userId = decodedToken()?.id;

      let updatePayload: any = {
        forwarded_to: value.id,
        forwarded_by: userId,
        is_forwarded: 1,
      };

      let historyMessage = `${ loggedInUser } forwarded the ticket to ${ value.username }`;

      if ( employeeRole === "credit" )
      {
        updatePayload.status = "operations";
        historyMessage += " and status is set to operations";
      } else if ( employeeRole === "operations" )
      {
        updatePayload.status = "under credit review";
      }
      await modifyTicket( +ticketId, updatePayload );

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );
      toastAndNavigate( dispatch, true, "info", "File Forwarded Successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Forwarding File" );
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
                  backgroundImage:
                    "linear-gradient(135deg, #fff 0%, #f8f8f8 100%)",
                  backgroundBlendMode: "multiply, screen, normal",
                  borderRadius: "20px",
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
                  customerId={ticketDetailData?.customer_id || ticketDetailData?.customerId}

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
                    width: isMobile ? "73vw" : isTab ? "65vw" : "43.5vw", // Adjusted tab width
                    bgcolor: "#e9ecef",
                  }}
                >
                  <Box
                    sx={{
                      width: isMobile ? "10vw" : isTab ? "15vw" : "10vw", // Adjusted tab width
                      height: "7vh",
                      borderRadius: "10px 0px 0px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        ml: 2,
                        mt: 0,
                        color: "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? "0.9rem" // Slightly smaller for tab
                            : "1.1rem",
                      }}
                    >
                      Activity:
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: isMobile ? "60vw" : isTab ? "48vw" : "20vw", // Adjusted tab width
                      height: "7vh",
                      borderRadius: "0px 10px 10px 0px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-evenly", // Better spacing for tab
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        backgroundColor:
                          activeSection === "Comments" ? "#155fcc" : "white",
                        color: activeSection === "Comments" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? "0.8rem"
                            : "12px", // Adjusted tab font
                        borderRadius: "4px",
                        marginLeft: isTab ? "0" : "10px", // Remove extra margin on tab
                        padding: isTab ? "0.3rem" : ".4rem", // Adjusted padding for tab
                        cursor: "pointer",
                        whiteSpace: "nowrap", // Prevent text wrapping
                      }}
                      onClick={showComments}
                    >
                      Comments
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        backgroundColor:
                          activeSection === "History" ? "#155fcc" : "white",
                        color: activeSection === "History" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? "0.8rem"
                            : "12px", // Adjusted tab font
                        borderRadius: "4px",
                        marginLeft: isTab ? "0" : "10px", // Remove extra margin on tab
                        padding: isTab ? "0.3rem" : "6px", // Adjusted padding for tab
                        cursor: "pointer",
                        whiteSpace: "nowrap", // Prevent text wrapping
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
                          activeSection === "WorkLog" ? "#155fcc" : "white",
                        color: activeSection === "WorkLog" ? "white" : "black",
                        fontSize: isMobile
                          ? ".7rem"
                          : isTab
                            ? "0.8rem"
                            : "12px", // Adjusted tab font
                        borderRadius: "4px",
                        marginLeft: isTab ? "0" : "10px", // Remove extra margin on tab
                        padding: isTab ? "0.3rem" : "6px", // Adjusted padding for tab
                        cursor: "pointer",
                        whiteSpace: "nowrap", // Prevent text wrapping
                      }}
                      onClick={showWorkLog}
                    >
                      Work Log
                    </Typography>
                  </Box>
                </Box>

                {activeSection === "Comments" && (
                  <Comments storedTicketId={ticketId} userData={userData} />
                )}

                {/* History Section */}
                {activeSection === "History" && (
                  <History ticketId={ticketId} activeSection={activeSection} />
                )}

                {activeSection === "WorkLog" && (
                  <WorkLogList userData={userData} workLog={workLog?.data} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper
                elevation={4}
                sx={{
                  padding: isMobile ? 2 : isTab ? 2 : 5,
                  minHeight: "auto",
                  height: isMobile ? "70vh" : isTab ? "60vh" : "75vh",
                  maxHeight: "90vh",
                  width: isMobile ? "85vw" : isTab ? "85vw" : "25vw",
                  borderRadius: "20px",
                  position: isMobile || isTab ? "relative" : "fixed",
                  boxShadow: "0px 4px 20px rgba(149, 117, 205, 0.3)",
                  backgroundImage: "linear-gradient(135deg, #fff 0%, #fff 100%)",
                  overflowY: isMobile ? "none" : isTab ? "none" : "auto", "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  "-ms-overflow-style": "none",
                  "scrollbar-width": "none",
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
                      bgcolor: "#155fcc",
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
                    ticketDetailData={ticketDetailData}
                    currentUserRole={decodedToken()?.role}
                  />
                )}
                <Divider sx={{ my: 1 }} />

                {/* Employee Status FormControl */}
                {decodedToken()?.role !== "credit" && (
                  <>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        padding: 2,
                        border: "1px solid white",
                        borderRadius: "15px",
                        fontSize: "1rem",
                        bgcolor: "#b39ddb",
                        boxShadow: "0px 4px 20px rgba(149, 117, 205, 0.3)",
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
                          fontFamily: "",
                          "&:hover": {
                            transform: "scale(1.02)",
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        File Status:
                      </Typography>

                      {/* Right side: FormControl in Grid */}
                      <Grid item xs={6} md={5} mt={0}>
                        <FormControl
                          variant="filled"
                          sx={{
                            background: "white",
                            borderRadius: "15px",
                            "& .MuiFilledInput-underline:before": {
                              borderBottom: "none",
                            },
                            "& .MuiFilledInput-underline:after": {
                              borderBottom: "none",
                            },
                            "& .MuiFilledInput-underline:hover:before": {
                              borderBottom: "none !important",
                            },
                          }}
                        >
                          <InputLabel>File Status</InputLabel>
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

                    {/* Combined Disbursed Date and Amount Field - Shows only when status is "disbursed" */}
                    {/* Combined Disbursed Date and Amount Field - Shows only when status is "disbursed" */}
                    {newEmployeeStatus === "disbursed" && (
                      <Box
                        sx={{
                          padding: 2,
                          border: "1px solid white",
                          borderRadius: "15px",
                          fontSize: "1rem",
                          mt: "1rem",
                          bgcolor: ( isDisbursedDateSaved && isDisbursedAmountSaved ) ? "#b39ddb" : "#b39ddb",
                          boxShadow: ( isDisbursedDateSaved && isDisbursedAmountSaved )
                            ? "0px 4px 20px rgba(76, 175, 80, 0.3)"
                            : "0px 4px 20px rgba(255, 152, 0, 0.3)",
                          "&:hover": {
                            transform: "scale(1.02)",
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        {/* Title */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                            mb: 2,
                            fontSize: isMobile ? "0.9rem" : "1rem",
                          }}
                        >
                          Disbursement Details
                        </Typography>

                        {/* Fields Container */}
                        <Box
                          display="flex"
                          flexDirection="column"
                          gap={2}
                          alignItems="center"
                        >
                          {/* Date and Amount Fields Row */}
                          <Box
                            display="flex"
                            gap={isMobile ? 1 : 2}
                            flexDirection={isMobile ? "column" : "row"}
                            width="100%"
                            justifyContent="center"
                          >
                            {/* Date Field */}
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Date
                              </Typography>
                              <TextField
                                type="date"
                                value={disbursedDate}
                                onChange={( e ) => setDisbursedDate( e.target.value )}
                                size="small"
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: "5px",
                                  width: isMobile ? "70vw" : isTab ? "10vw" : "7vw",
                                  minWidth: "120px",
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "5px",
                                  },
                                  "& input": {
                                    padding: "8px",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                  },
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Box>

                            {/* Amount Field */}
                            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Amount
                              </Typography>
                              <TextField
                                type="number"
                                value={disbursedAmount}
                                onChange={( e ) => setDisbursedAmount( e.target.value )}
                                size="small"
                                placeholder="Enter amount"
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: "5px",
                                  width: isMobile ? "70vw" : isTab ? "10vw" : "7vw",
                                  minWidth: "120px",
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "5px",
                                  },
                                  "& input": {
                                    padding: "8px",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                  },
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Single Save Button */}
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleCombinedDisbursementSubmit}
                            disabled={!disbursedDate || !disbursedAmount || parseFloat( disbursedAmount ) <= 0}
                            sx={{
                              width: isMobile ? "60vw" : isTab ? "12vw" : "8vw",
                              minWidth: "100px",
                              bgcolor: "#2e7d32",
                              fontSize: "0.8rem",
                              "&:hover": {
                                bgcolor: "#1b5e20",
                              },
                              "&:disabled": {
                                bgcolor: "#ccc",
                                color: "#666",
                              },
                            }}
                          >
                            Save Details
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}


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
                    bgcolor: "#b39ddb",

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
                      fontFamily: "",
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
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="disbursed">Disbursed</MenuItem>
                        <MenuItem value="carry forward">Carry Forward</MenuItem>
                        <MenuItem value="hold">Hold</MenuItem>
                        <MenuItem value="drop">Drop</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="relook">Relook</MenuItem>
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
                        fontSize: isMobile ? ".8rem" : isTab ? ".9rem" : "16px",
                        fontWeight: "bold",
                        color: "black",
                        marginLeft: ".5rem",
                        fontFamily: "",
                      }}
                    >
                      Assignee
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{ mr: "1vw", color: "black", fontFamily: "" }}
                    >
                      {capitalizeFirstLetter( decodedToken()?.username )}
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: "#ADB5BD",
                        mr: ".8rem",
                        color: "white",
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
                      fontSize: isMobile ? ".8rem" : isTab ? ".9rem" : "16px",
                      fontWeight: "bold",
                      color: "black",
                      marginLeft: ".5rem",
                      fontFamily: "",
                    }}
                  >
                    Time Tracking
                  </Typography>

                  <Box
                    display="flex"
                    mt={2}
                    sx={{
                      width: isMobile ? "25vh" : isTab ? "20vw" : "25vh",
                      color: "black",
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

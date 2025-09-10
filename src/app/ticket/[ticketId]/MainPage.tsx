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
import { ArrowForwardRounded } from "@mui/icons-material";
import { ThemeProvider, useTheme } from "@mui/material/styles";

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
  const muiTheme = useTheme();

  const dispatch: AppDispatch = useDispatch();
  const params = useParams();
  const isMobile = useMediaQuery( muiTheme.breakpoints.down( 'sm' ) ); // 0-599px
  const isTablet = useMediaQuery( muiTheme.breakpoints.between( 'sm', 'md' ) ); // 600-899px
  const isIpad = useMediaQuery( muiTheme.breakpoints.between( 'md', 'lg' ) ); // 900-1199px
  const isDesktop = useMediaQuery( muiTheme.breakpoints.up( 'lg' ) ); // 1200px+
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

  const handleChangeEmployeeStatus = async ( event: any ) => {
    const oldStatus = newEmployeeStatus;
    const newStatus = event.target.value;
    setNewEmployeeStatus( newStatus );

    try
    {
      await modifyTicket( +ticketId, { status: newStatus } );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } changed File Status from ${ oldStatus } to ${ newStatus }`;
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
          maxWidth={false}
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 1, sm: 2 },
            minHeight: '100vh',
          }}
        >
          <Grid
            container
            spacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            {/* Main Content Section */}
            <Grid
              item
              xs={12}
              lg={8}
              sx={{
                order: { xs: 1, lg: 1 },
              }}
            >
              <Paper
                elevation={5}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  backgroundImage: "linear-gradient(135deg, #fff 0%, #f8f8f8 100%)",
                  backgroundBlendMode: "multiply, screen, normal",
                  borderRadius: 3,
                  width: '100%',
                }}
              >
                <TicketDetail
                  ticketDetailData={ticketDetailData}
                  isMobile={isMobile}
                  isTab={isTablet}
                  isIpad={isIpad}
                />

                <TicketDocuments
                  isMobile={isMobile}
                  isTab={isTablet}
                  isIpad={isIpad}
                  documents={ticketDetailData?.customerDocuments ?? []}
                  customerId={
                    ticketDetailData?.customer_id ||
                    ticketDetailData?.customerId
                  }
                />

                <TicketVoiceNotes
                  isMobile={isMobile}
                  isTab={isTablet}
                  isIpad={isIpad}
                  ticketDetailData={ticketDetailData}
                />

                {/* Activity Section */}
                <Box
                  sx={{
                    mt: 4,
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    bgcolor: '#e9ecef',
                    p: { xs: 2, sm: 1 },
                    gap: { xs: 2, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // minWidth: { xs: 'auto', sm: 120 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'black',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                        fontWeight: 'bold',
                      }}
                    >
                      Activity:
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: { xs: 'center', sm: 'flex-end' },
                      gap: { xs: 1, sm: 2 },
                      flexWrap: 'wrap',
                    }}
                  >
                    {[ 'Comments', 'History', 'WorkLog' ].map( ( section ) => (
                      <Typography
                        key={section}
                        component="span"
                        sx={{
                          backgroundColor: activeSection === section ? '#155fcc' : 'white',
                          color: activeSection === section ? 'white' : 'black',
                          fontSize: { xs: '0.5rem', sm: '0.85rem' },
                          borderRadius: 1,
                          px: { xs: 2, sm: 2.5 },
                          py: { xs: 1, sm: 1.2 },
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                        onClick={section === 'Comments' ? showComments :
                          section === 'History' ? showHistory : showWorkLog}
                        ref={section === 'WorkLog' ? workLogRef : null}
                      >
                        {section === 'WorkLog' ? 'Work Log' : section}
                      </Typography>
                    ) )}
                  </Box>
                </Box>

                {/* Content Sections */}
                {activeSection === "Comments" && (
                  <Comments storedTicketId={ticketId} userData={userData} />
                )}

                {activeSection === "History" && (
                  <History ticketId={ticketId} activeSection={activeSection} />
                )}

                {activeSection === "WorkLog" && (
                  <WorkLogList userData={userData} workLog={workLog?.data} />
                )}
              </Paper>
            </Grid>

            {/* Sidebar Section */}
            <Grid
              item
              xs={12}
              lg={4}
              sx={{
                order: { xs: 2, lg: 2 },
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 1.5, sm: 2, md: 3 },
                  borderRadius: { xs: 2, sm: 3 },
                  position: { xs: 'static', lg: 'sticky' },
                  top: { lg: 24 },
                  height: {
                    xs: "70vh",
                    sm: "62vh",
                    md: "50vh",
                    lg: "100vh"
                  },
                  maxHeight: {
                    xs: "70vh",
                    sm: "75vh",
                    md: "80vh",
                    lg: "100vh"
                  },
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  boxShadow: {
                    xs: '0px 2px 10px rgba(149, 117, 205, 0.2)',
                    sm: '0px 4px 20px rgba(149, 117, 205, 0.3)'
                  },
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
                  width: '100%',
                  // Custom scrollbar styles for webkit browsers
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(149, 117, 205, 0.3)",
                    borderRadius: "3px",
                    "&:hover": {
                      background: "rgba(149, 117, 205, 0.5)",
                    },
                  },
                  // Hide scrollbar for Firefox
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(149, 117, 205, 0.3) transparent",
                  // Smooth scrolling
                  scrollBehavior: 'smooth',
                }}
              >
                {/* Forward Button */}
                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                  <Button
                    color="info"
                    endIcon={<ArrowForwardRounded />}
                    size={isMobile ? "small" : "medium"}
                    variant="contained"
                    onClick={() => setNewEmployeeStatus( "forwarded" )}
                    sx={{
                      bgcolor: '#155fcc',
                      textTransform: 'uppercase',
                      borderRadius: { xs: 1.5, sm: 2 },
                      py: { xs: 1, sm: 1.5, md: 1 },
                      px: { xs: 1, sm: 2 },
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.8rem',
                        md: '0.85rem'
                      },
                      minHeight: { xs: '36px', sm: '42px' },
                      '&:hover': {
                        bgcolor: '#1248a8',
                      },
                    }}
                  >
                    Forward
                  </Button>
                </Box>

                {/* User Autocomplete */}
                {newEmployeeStatus === "forwarded" && (
                  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <UserAutocomplete
                      isMobile={isMobile}
                      isTab={isTablet}
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
                  </Box>
                )}

                <Divider sx={{
                  my: { xs: 1.5, sm: 2 },
                  borderColor: '#e0e0e0'
                }} />

                {/* File Status */}
                {decodedToken()?.role !== "credit" && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: { xs: 1.5, sm: 2 },
                      bgcolor: '#b39ddb',
                      boxShadow: '0px 4px 20px rgba(149, 117, 205, 0.3)',
                      mb: { xs: 1.5, sm: 2 },
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: {
                          xs: '0.8rem',
                          sm: '0.9rem',
                          md: '1rem'
                        },
                        lineHeight: 1.2,
                      }}
                    >
                      File Status:
                    </Typography>

                    <FormControl
                      variant="filled"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: { xs: 1.5, sm: 2 },
                        '& .MuiFilledInput-root': {
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          minHeight: { xs: '48px', sm: '56px' },
                          paddingTop: { xs: '24px', sm: '.4rem' },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          transform: isMobile ? 'translate(12px, 8px) scale(1)' : 'translate(12px, 10px) scale(1)',
                          top: { xs: '-4px', sm: '-2px' },
                        },
                        '& .MuiInputLabel-shrink': {
                          transform: isMobile ? 'translate(12px, 2px) scale(0.75)' : 'translate(12px, 4px) scale(0.75)',
                          top: 0,
                        },
                        '& .MuiFilledInput-input': {
                          paddingTop: { xs: '8px', sm: '12px' },
                          paddingBottom: { xs: '8px', sm: '12px' },
                        },
                        '& .MuiSelect-select': {
                          paddingTop: { xs: '8px', sm: '12px' } + ' !important',
                          paddingBottom: { xs: '8px', sm: '12px' } + ' !important',
                        },
                        '& .MuiFilledInput-underline:before': {
                          borderBottom: 'none',
                        },
                        '& .MuiFilledInput-underline:after': {
                          borderBottom: 'none',
                        },
                        '& .MuiFilledInput-underline:hover:before': {
                          borderBottom: 'none !important',
                        },
                      }}
                    >
                      <InputLabel>File Status</InputLabel>
                      <Select
                        value={newEmployeeStatus}
                        onChange={handleChangeEmployeeStatus}
                        sx={{
                          borderRadius: 1,
                          '& .MuiSelect-select': {
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            py: { xs: 1, sm: 1.5 },
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 200,
                              '& .MuiMenuItem-root': {
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                minHeight: { xs: '36px', sm: '48px' },
                              }
                            }
                          }
                        }}
                      >
                        {employeeStatusObj.map( ( status ) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ) )}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Loan Status */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 1.5, md: 2 },
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    bgcolor: '#b39ddb',
                    mb: { xs: 1.5, sm: 2 },
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: {
                        xs: '0.8rem',
                        sm: '0.9rem',
                        md: '1rem'
                      },
                      lineHeight: 1.2,
                    }}
                  >
                    Loan Status:
                  </Typography>

                  <FormControl
                    variant="filled"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: { xs: 1.5, sm: 2 },
                      '& .MuiFilledInput-root': {
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        minHeight: { xs: '40px', sm: '48px' },
                        paddingTop: { xs: '24px', sm: '.4rem' },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        transform: isMobile ? 'translate(12px, 12px) scale(1)' : 'translate(12px, 16px) scale(1)',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: isMobile ? 'translate(12px, 4px) scale(0.75)' : 'translate(12px, 6px) scale(0.75)',
                      },
                      '& .MuiFilledInput-underline:before': {
                        borderBottom: 'none',
                      },
                      '& .MuiFilledInput-underline:after': {
                        borderBottom: 'none',
                      },
                      '& .MuiFilledInput-underline:hover:before': {
                        borderBottom: 'none !important',
                      },
                    }}
                  >
                    <InputLabel>Loan Status</InputLabel>
                    <Select
                      value={newLoanStatus}
                      onChange={handleChangeLoanStatus}
                      sx={{
                        borderRadius: 1,
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          py: { xs: 1, sm: 1.5 },
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 200,
                            '& .MuiMenuItem-root': {
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              minHeight: { xs: '36px', sm: '48px' },
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="under credit review">Under Credit Review</MenuItem>
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
                </Box>

                {/* Assignee */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: { xs: 0.5, sm: 1 },
                    mb: { xs: 1.5, sm: 2 },
                    bgcolor: { xs: '#f5f5f5', sm: 'transparent' },
                    borderRadius: { xs: 1, sm: 0 },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.8rem',
                        md: '0.9rem',
                        lg: '1rem'
                      },
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                  >
                    Assignee
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    flexShrink: 0,
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'black',
                        fontSize: {
                          xs: '0.7rem',
                          sm: '0.75rem',
                          md: '0.8rem'
                        },
                        maxWidth: { xs: '80px', sm: '120px' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {capitalizeFirstLetter( decodedToken()?.username )}
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: '#ADB5BD',
                        color: 'white',
                        width: { xs: 28, sm: 32, md: 40 },
                        height: { xs: 28, sm: 32, md: 40 },
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      }}
                      alt={capitalizeFirstLetter( decodedToken()?.username )}
                      src={capitalizeFirstLetter( decodedToken()?.username )}
                    />
                  </Box>
                </Box>

                {/* Original Estimate Field */}
                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                  <OriginalEstimateField
                    ticketId={ticketId}
                    initialEstimate={ticketDetailData?.originalEstimate}
                    userRole={decodedToken()?.role}
                  />
                </Box>

                {/* Time Tracking */}
                <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.8rem',
                        md: '0.9rem',
                        lg: '.9rem'
                      },
                      ml: ".6vw",
                      fontWeight: 'bold',
                      color: 'black',
                      // mb: { xs: 0.5, sm: 1 },
                    }}
                  >
                    Time Tracking
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      mt: { xs: 0.5, sm: 1, lg: 2 },
                      px: { xs: 0, sm: 1 },
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

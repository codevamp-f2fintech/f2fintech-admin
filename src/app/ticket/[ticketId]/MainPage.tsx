"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "@/apis/config/axiosConfig";
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
  loanCategory: string;
  userRole: string;
  approved_at?: string | Date;
  approved_amount?: number | string;
  disbursed_at?: string | Date;
  disbursed_amount?: number | string;
  cashback_amount?: number | string;
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
    loanCategory: string;
    cashback_amount?: number | string;
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


  // Add these state variables near your existing disbursed states
  const [ approvedDate, setApprovedDate ] = useState( () => {
    return ticketDetailData?.approved_at
      ? new Date( ticketDetailData.approved_at ).toISOString().split( 'T' )[ 0 ]
      : "";
  } );

  const [ isApprovedDateSaved, setIsApprovedDateSaved ] = useState( () => {
    return !!ticketDetailData?.approved_at;
  } );

  const [ cashbackAmount, setCashbackAmount ] = useState( () => {
    return ticketDetailData?.cashback_amount
      ? ticketDetailData.cashback_amount.toString()
      : "";
  } );

  const [ isCashbackAmountSaved, setIsCashbackAmountSaved ] = useState( () => {
    return !!ticketDetailData?.cashback_amount;
  } );

  // Format amount for display (removes unnecessary decimals)
  const formatDisplayAmount = ( amount: string ): string => {
    if ( !amount ) return "";

    const numAmount = parseFloat( amount );
    if ( isNaN( numAmount ) ) return amount;

    // If it's a whole number, return without decimals
    if ( numAmount % 1 === 0 )
    {
      return numAmount.toString();
    }

    // Otherwise return with 2 decimal places
    return numAmount.toFixed( 2 );
  };

  // Format amount for storage (ensures proper number format)
  const formatDecimalAmount = ( amount: string ): string => {
    if ( !amount ) return "";

    const numAmount = parseFloat( amount );
    if ( isNaN( numAmount ) ) return "";

    // Always return as number, letting toFixed handle the formatting
    return numAmount.toString();
  };

  const [ approvedAmount, setApprovedAmount ] = useState( () => {
    return ticketDetailData?.approved_amount
      ? ticketDetailData.approved_amount.toString()
      : "";
  } );
  console.log( "approvedAmount>>>>>>>>>>>>>", approvedAmount )
  const [ isApprovedAmountSaved, setIsApprovedAmountSaved ] = useState( () => {
    return !!ticketDetailData?.approved_amount;
  } );

  const [ progress, setProgress ] = useState( 0 );
  const [ overage, setOverage ] = useState( 0 );
  const [ newLoanStatus, setNewLoanStatus ] = useState( "" );
  const [ newEmployeeStatus, setNewEmployeeStatus ] = useState( "" );
  const [ timeLoggingEstimate, setTimeLoggingEstimate ] = useState( {
    originalEstimate: "",
    timeSpent: "0",
  } );
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const [ hasFetched, setHasFetched ] = useState( false );
  const workLogRef = useRef( null );
  const isVisible = useIntersectionObserver( workLogRef );
  const muiTheme = useTheme();

  const dispatch: AppDispatch = useDispatch();
  const params = useParams();
  const isMobile = useMediaQuery( muiTheme.breakpoints.down( 'sm' ) ); // 0-599px
  const isTablet = useMediaQuery( muiTheme.breakpoints.between( 'sm', 'md' ) ); // 600-899px
  const isTab = useMediaQuery( muiTheme.breakpoints.between( 'sm', 'md' ) ); // 600-899px
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

            // Set disbursed date/amount if ticket has them
            if ( response.data.disbursed_at )
            {
              setDisbursedDate( new Date( response.data.disbursed_at ).toISOString().split( 'T' )[ 0 ] );
              setIsDisbursedDateSaved( true );
            } else if ( response.data.employeeStatus === "disbursed" )
            {
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

            // Set approved date/amount if ticket has them
            if ( response.data.approved_at )
            {
              setApprovedDate( new Date( response.data.approved_at ).toISOString().split( 'T' )[ 0 ] );
              setIsApprovedDateSaved( true );
            } else if ( response.data.employeeStatus === "approved" )
            {
              setApprovedDate( getTodayLocalDate() );
              setIsApprovedDateSaved( false );
            }

            if ( response.data.approved_amount )
            {
              setApprovedAmount( response.data.approved_amount.toString() );
              setIsApprovedAmountSaved( true );
            } else if ( response.data.employeeStatus === "approved" )
            {
              setApprovedAmount( response.data.applicationAmount?.toString() || "" );
              setIsApprovedAmountSaved( false );
            }

            // Set cashback amount if ticket has it
            if ( response.data.cashback_amount )
            {
              setCashbackAmount( response.data.cashback_amount.toString() );
              setIsCashbackAmountSaved( true );
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
      // } );
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

  useEffect( () => {
    if ( ticketDetailData?.disbursed_amount )
    {
      setDisbursedAmount(
        Number( ticketDetailData.disbursed_amount ) % 1 === 0
          ? parseInt( ticketDetailData.disbursed_amount, 10 ).toString()
          : ticketDetailData.disbursed_amount.toString()
      );
    } else if ( ticketDetailData?.applicationAmount )
    {
      setDisbursedAmount(
        Number( ticketDetailData.applicationAmount ) % 1 === 0
          ? parseInt( ticketDetailData.applicationAmount, 10 ).toString()
          : ticketDetailData.applicationAmount.toString()
      );
    }
  }, [ ticketDetailData ] );

  const handleChangeEmployeeStatus = async ( event: any ) => {
    const oldStatus = newEmployeeStatus;
    const newStatus = event.target.value;
    setNewEmployeeStatus( newStatus );

    // Set dates and amounts for both approved and disbursed statuses
    if ( newStatus === "disbursed" )
    {
      if ( !disbursedDate )
      {
        setDisbursedDate( getTodayLocalDate() );
      }
      if ( !disbursedAmount && ticketDetailData?.applicationAmount )
      {
        setDisbursedAmount( ticketDetailData.applicationAmount.toString() );
      }
    }

    if ( newStatus === "approved" )
    {
      if ( !approvedDate )
      {
        setApprovedDate( getTodayLocalDate() );
      }
      // Set default approved amount from application amount
      if ( !approvedAmount && ticketDetailData?.applicationAmount )
      {
        setApprovedAmount( ticketDetailData.applicationAmount.toString() );
      }
    }

    // Clear dates when switching from these statuses
    if ( newStatus !== "disbursed" )
    {
      setDisbursedDate( "" );
      setDisbursedAmount( "" );
    }
    if ( newStatus !== "approved" )
    {
      setApprovedDate( "" );
      setApprovedAmount( "" );
    }

    try
    {
      let updatePayload = { status: newStatus };

      // If disbursed status is selected and date/amount are provided, include them
      if ( newStatus === "disbursed" && disbursedDate && disbursedAmount )
      {
        updatePayload.disbursed_at = disbursedDate;
        updatePayload.disbursed_amount = parseFloat( disbursedAmount );
        await modifyTicket( +ticketId, updatePayload );
      }

      // If approved status is selected and date/amount are provided, include them
      if ( newStatus === "approved" && approvedDate && approvedAmount )
      {
        updatePayload.approved_at = approvedDate;
        updatePayload.approved_amount = parseFloat( approvedAmount );
        await modifyTicket( +ticketId, updatePayload );
      }

      // If no special handling needed, just update status
      if ( newStatus !== "disbursed" && newStatus !== "approved" )
      {
        await modifyTicket( +ticketId, updatePayload );
      }

      const loggedInUser = decodedToken()?.username;
      let historyMessage = `${ loggedInUser } changed File Status from ${ oldStatus } to ${ newStatus }`;

      // Add date/amount info to history message
      if ( newStatus === "disbursed" && disbursedDate && disbursedAmount )
      {
        historyMessage += ` with disbursement date: ${ disbursedDate } and amount: ${ disbursedAmount }`;
      }
      if ( newStatus === "approved" && approvedDate && approvedAmount )
      {
        historyMessage += ` with approval date: ${ approvedDate } and amount: ${ approvedAmount }`;
      }

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      // Show appropriate success messages
      if ( ( newStatus === "disbursed" && disbursedDate && disbursedAmount ) ||
        ( newStatus === "approved" && approvedDate && approvedAmount ) )
      {
        toastAndNavigate( dispatch, true, "info", "Status Changed Successfully" );
      } else if ( newStatus === "disbursed" || newStatus === "approved" )
      {
        toastAndNavigate( dispatch, true, "info", "Status Changed. Please save the details." );
      } else
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

    if ( !disbursedAmount || parseInt( disbursedAmount, 10 ) <= 0 )
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
      // Add cashback amount to payload if provided
      if ( cashbackAmount && parseFloat( cashbackAmount ) >= 0 )
      {
        updatePayload.cashback_amount = parseFloat( cashbackAmount );
      }

      await modifyTicket( +ticketId, updatePayload );

      const loggedInUser = decodedToken()?.username;
      // Build history message dynamically
      let historyMessage = `${ loggedInUser } set disbursement details - Date: ${ disbursedDate }, Amount: ${ disbursedAmount }`;

      // Add cashback to history message if provided
      if ( cashbackAmount && parseFloat( cashbackAmount ) >= 0 )
      {
        historyMessage += `, Cashback: ${ cashbackAmount }`;
      }

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      setIsDisbursedDateSaved( true );
      setIsDisbursedAmountSaved( true );
      // Set cashback as saved if provided
      if ( cashbackAmount && parseFloat( cashbackAmount ) >= 0 )
      {
        setIsCashbackAmountSaved( true );
      }

      toastAndNavigate( dispatch, true, "info", cashbackAmount ? "Disbursement details saved successfully" : "Disbursement details saved successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error saving disbursement details" );
    }
  };

  // Handler for approved date and amount
  const handleCombinedApprovalSubmit = async () => {
    if ( !approvedDate )
    {
      toastAndNavigate( dispatch, true, "error", "Please enter approval date" );
      return;
    }

    if ( !approvedAmount || parseInt( approvedAmount, 10 ) <= 0 )
    {
      toastAndNavigate( dispatch, true, "error", "Please enter a valid approval amount" );
      return;
    }

    try
    {
      const updatePayload = {
        status: "approved",
        approved_at: approvedDate,
        approved_amount: parseFloat( approvedAmount )
      };

      await modifyTicket( +ticketId, updatePayload );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } set approval details - Date: ${ approvedDate }, Amount: ${ approvedAmount }`;

      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      setIsApprovedDateSaved( true );
      setIsApprovedAmountSaved( true );

      toastAndNavigate( dispatch, true, "info", "Approval details saved successfully" );
      await refetch();
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error saving approval details" );
    }
  };

  const handleChangeLoanStatus = async ( event: any ) => {
    const oldStatus = newLoanStatus;
    const newStatus = event.target.value;
    setNewLoanStatus( newStatus );

    try
    {
      await axiosInstance.patch(
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
                  position: { xs: 'static', lg: 'Fixed' },
                  top: { lg: "7.5rem" },
                  pb: { xs: "5vh", sm: "5vh", md: "5vh", lg: "10vh" },
                  height: {
                    xs: "70vh",
                    sm: "62vh",
                    md: "50vh",
                    lg: "75vh"
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
                  width: { xs: '100%', lg: '28vw' },
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
                    // onClick={() => setNewEmployeeStatus( "forwarded" )}
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
                  <>
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

                    {newEmployeeStatus === "approved" && (
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
                        {/* Title */}
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: {
                              xs: '0.8rem',
                              sm: '0.9rem',
                              md: '1rem',
                            },
                            lineHeight: 1.2,
                          }}
                        >
                          Approval Details
                        </Typography>

                        {/* Date Field */}
                        <TextField
                          fullWidth
                          type="date"
                          label="Date"
                          value={approvedDate}
                          onChange={( e ) => setApprovedDate( e.target.value )}
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
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
                              transform: 'translate(12px, 10px) scale(1)',
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(12px, 4px) scale(0.75)',
                              top: 0,
                            },
                            '& .MuiFilledInput-input': {
                              paddingTop: { xs: '8px', sm: '12px' },
                              paddingBottom: { xs: '8px', sm: '12px' },
                            },
                            '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                              borderBottom: 'none',
                            },
                            '& .MuiFilledInput-underline:hover:before': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />

                        {/* Amount Field */}
                        <TextField
                          fullWidth
                          type="number"
                          label="Amount"
                          value={formatDisplayAmount( approvedAmount )}
                          placeholder="Enter amount"
                          onChange={( e ) => {
                            // Store the raw value but display formatted
                            const rawValue = e.target.value;
                            setApprovedAmount( rawValue );
                          }}
                          onBlur={( e ) => {
                            // Format the amount when field loses focus
                            if ( e.target.value )
                            {
                              const formatted = formatDecimalAmount( e.target.value );
                              setApprovedAmount( formatted );
                            }
                          }}
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
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
                              transform: 'translate(12px, 10px) scale(1)',
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(12px, 4px) scale(0.75)',
                              top: 0,
                            },
                            '& .MuiFilledInput-input': {
                              paddingTop: { xs: '8px', sm: '12px' },
                              paddingBottom: { xs: '8px', sm: '12px' },
                            },
                            '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                              borderBottom: 'none',
                            },
                            '& .MuiFilledInput-underline:hover:before': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />

                        {/* Save Button */}
                        <Box display="flex" justifyContent="center" mt={1}>
                          <Button
                            variant="contained"
                            size="medium"
                            onClick={handleCombinedApprovalSubmit}
                            disabled={
                              !approvedDate ||
                              !( approvedAmount || ticketDetailData?.applicationAmount ) ||
                              parseFloat( approvedAmount || ticketDetailData?.applicationAmount || 0 ) <= 0
                            }
                            sx={{
                              bgcolor: "#2e7d32",
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              borderRadius: { xs: 1.5, sm: 2 },
                              px: { xs: 2, sm: 4 },
                              py: { xs: 0.8, sm: 1.2 },
                              '&:hover': { bgcolor: "#1b5e20" },
                              '&:disabled': { bgcolor: "#ccc", color: "#666" },
                            }}
                          >
                            Save Details
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {newEmployeeStatus === "disbursed" && (
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
                        {/* Title */}
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: {
                              xs: '0.8rem',
                              sm: '0.9rem',
                              md: '1rem',
                            },
                            lineHeight: 1.2,
                          }}
                        >
                          Disbursement Details
                        </Typography>

                        {/* Date Field */}
                        <TextField
                          fullWidth
                          type="date"
                          label="Date"
                          value={disbursedDate}
                          onChange={( e ) => setDisbursedDate( e.target.value )}
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
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
                              transform: 'translate(12px, 10px) scale(1)',
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(12px, 4px) scale(0.75)',
                              top: 0,
                            },
                            '& .MuiFilledInput-input': {
                              paddingTop: { xs: '8px', sm: '12px' },
                              paddingBottom: { xs: '8px', sm: '12px' },
                            },
                            '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                              borderBottom: 'none',
                            },
                            '& .MuiFilledInput-underline:hover:before': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />

                        {/* Amount Field */}
                        <TextField
                          fullWidth
                          type="number"
                          label="Amount"
                          placeholder="Enter amount"
                          value={disbursedAmount}
                          onChange={( e ) => setDisbursedAmount( e.target.value )}
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
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
                              transform: 'translate(12px, 10px) scale(1)',
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(12px, 4px) scale(0.75)',
                              top: 0,
                            },
                            '& .MuiFilledInput-input': {
                              paddingTop: { xs: '8px', sm: '12px' },
                              paddingBottom: { xs: '8px', sm: '12px' },
                            },
                            '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                              borderBottom: 'none',
                            },
                            '& .MuiFilledInput-underline:hover:before': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />
                        {/* Add Cashback Field Here */}
                        <TextField
                          fullWidth
                          type="number"
                          label="Cashback Amount"
                          placeholder="Enter cashback amount"
                          value={cashbackAmount}
                          onChange={( e ) => setCashbackAmount( e.target.value )}
                          variant="filled"
                          InputLabelProps={{ shrink: true }}
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
                              transform: 'translate(12px, 10px) scale(1)',
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(12px, 4px) scale(0.75)',
                              top: 0,
                            },
                            '& .MuiFilledInput-input': {
                              paddingTop: { xs: '8px', sm: '12px' },
                              paddingBottom: { xs: '8px', sm: '12px' },
                            },
                            '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                              borderBottom: 'none',
                            },
                            '& .MuiFilledInput-underline:hover:before': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />


                        {/* Save Button */}
                        <Box display="flex" justifyContent="center" mt={1}>
                          <Button
                            variant="contained"
                            size="medium"
                            onClick={handleCombinedDisbursementSubmit}
                            disabled={
                              !disbursedDate ||
                              !( disbursedAmount || ticketDetailData?.applicationAmount ) ||
                              parseFloat( disbursedAmount || ticketDetailData?.applicationAmount || 0 ) <= 0
                            }
                            sx={{
                              bgcolor: "#2e7d32",
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              borderRadius: { xs: 1.5, sm: 2 },
                              px: { xs: 2, sm: 4 },
                              py: { xs: 0.8, sm: 1.2 },
                              '&:hover': { bgcolor: "#1b5e20" },
                              '&:disabled': { bgcolor: "#ccc", color: "#666" },
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
                        // height: { xs: 28, sm: 32, md: 40 },
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                      }}
                      alt={capitalizeFirstLetter( decodedToken()?.username )}
                      src={capitalizeFirstLetter( decodedToken()?.username )}
                    // alt={capitalizeFirstLetter( decodedToken()?.username )}
                    // src={capitalizeFirstLetter( decodedToken()?.username )}
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
// export default React.memo( Progress );

"use client";

import Link from "next/link";
import {
  AccountBalanceRounded,
  CancelRounded,
  DeleteForeverRounded,
  PauseCircleOutlineRounded,
  ReportRounded,
  SendRounded,
  FilterListRounded,
  ThumbUpRounded,
  LoginRounded,
  ForwardRounded,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2";
import ArchiveIcon from "@mui/icons-material/Archive";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SendTimeExtensionIcon from "@mui/icons-material/SendTimeExtension";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

import { Budget } from "@/app/components/dashboard/overview/budget";
import { LatestOrders } from "@/app/components/dashboard/overview/latest-orders";
import { LatestApplications } from "@/app/components/dashboard/overview/latest-aplications";
import { Sales } from "@/app/components/dashboard/overview/sales";
import { Traffic } from "@/app/components/dashboard/overview/traffic";
import { Utility } from "@/utils";
import {
  Box,
  Paper,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Ticket {
  month: string;
  count: number;
}

// Server-side function to fetch total applications count
async function fetchTotalApplications (
  month?: string,
  year?: number,
  date?: string
): Promise<number | null> {
  try
  {
    let url = `${ process.env.NEXT_PUBLIC_API_URL }/application/count`;

    const params = new URLSearchParams();

    // Only add month if it's provided and not empty
    if ( month && month !== "" )
    {
      params.append( "month", month );
      // Always include the current year when month is provided
      params.append( "year", new Date().getFullYear().toString() );
    }

    // Only add date if it's provided and not empty
    if ( date && date !== "" )
    {
      params.append( "date", date );
    }

    if ( params.toString() )
    {
      url += `?${ params.toString() }`;
    }

    const response = await fetch( url, {
      cache: "no-store",
    } );

    if ( !response.ok )
    {
      throw new Error( `HTTP error! status: ${ response.status }` );
    }
    const resData = await response.json();
    return resData.data;
  } catch ( error )
  {
    console.error( "Failed to fetch total applications:", error );
    return null;
  }
}

// Server-side function to fetch total new applications count
async function fetchTotalNewApplication (
  month?: string,
  year?: number,
  date?: string
): Promise<{ count: number; amount: number } | null> {
  try
  {
    let url = `${ process.env.NEXT_PUBLIC_API_URL }/application/new-count`;

    // Add query parameters if month and year are provided
    const params = new URLSearchParams();
    if ( month ) params.append( "month", month );
    if ( year ) params.append( "year", year.toString() );
    if ( date ) params.append( "date", date );
    if ( params.toString() )
    {
      url += `?${ params.toString() }`;
    }

    const response = await fetch( url, {
      cache: "no-store", // To Prevent caching
    } );

    if ( !response.ok )
    {
      throw new Error( `HTTP error! status: ${ response.status }` );
    }
    const resData = await response.json();
    return {
      count: resData.data.count || resData.data, // handles both old and new response formats
      amount: resData.data.amount || 0, // default to 0 if amount doesn't exist
    };
  } catch ( error )
  {
    console.error( "Failed to fetch total new applications:", error );
    return null;
  }
}

async function fetchTotalTickets (
  status: string | null = null,
  id: number | null = null,
  role: string,
  date?: string | null,
  month?: string,
  year?: string,

): Promise<number | { count: number; amount: number }> {
  let url = `${ process.env.NEXT_PUBLIC_API_URL }/dashboard/tickets/count`;

  if ( role !== "admin" && role !== "sub admin" && id !== null )
  {
    url += `/${ id }`;
  }

  if ( status )
  {
    url += `/${ encodeURIComponent( status ) }`;
  }

  if ( date )
  {
    url += `?date=${ encodeURIComponent( date ) }`;
  }

  if ( month )
  {
    url += `?month=${ encodeURIComponent( month ) }`;
  }

  const response = await fetch( url, {
    cache: "no-store",
  } ); // To Prevent caching

  if ( !response.ok )
  {
    throw new Error( "Failed to fetch total Tickets" );
  }
  const resData = await response.json();

  if ( status === "disbursed" || status === "approved" )
  {
    // When the status is disbursed, return both the count and total amount
    return { count: resData.data.count, amount: resData.data.amount };
  }

  return resData.data;
}

async function getTotalTicketsByMonth ( year: number ): Promise<Ticket[]> {
  const response = await fetch(
    `${ process.env.NEXT_PUBLIC_API_URL }/dashboard/tickets/counts-by-month?year=${ year }`,
    {
      cache: "no-store", // To Prevent Caching
    }
  );

  if ( !response.ok )
  {
    throw new Error( "Failed to fetch monthly count" );
  }
  const resData = await response.json();
  return resData.data.map( ( ticket: Ticket ) => ticket.count );
}

async function getDoneTicketsByMonth ( year: number ): Promise<Ticket[]> {
  const response = await fetch(
    `${ process.env.NEXT_PUBLIC_API_URL }/dashboard/tickets/done-counts-by-month?year=${ year }`,
    {
      cache: "no-store", // To Prevent Caching
    }
  );

  if ( !response.ok )
  {
    throw new Error( "Failed to fetch monthly done count" );
  }
  const resData = await response.json();
  return resData.data.map( ( ticket: Ticket ) => ticket.count );
}

export default function Page (): React.JSX.Element {
  const { decodedToken, getCookies } = Utility();
  const cookies = getCookies();
  const userToken = cookies.token;
  const { id, role } = decodedToken( userToken?.value );

  const [ date, setDate ] = useState<string | null>( null );
  const [ selectedMonth, setSelectedMonth ] = useState<string>( "" );
  const [ allCounts, setAllCounts ] = useState<any>( {} );
  const [ totalAgents, setTotalAgents ] = useState<number | null>( null );
  const currentYear = new Date().getFullYear();
  const [ currentDateTime, setCurrentDateTime ] = useState( new Date() );
  const currentDate = new Date().toLocaleDateString( "en-CA" );
  // const [ showFilters, setShowFilters ] = React.useState( false );

  useEffect( () => {
    const timer = setInterval( () => {
      setCurrentDateTime( new Date() );
    }, 1000 );

    return () => clearInterval( timer );
  }, [] );

  useEffect( () => {
    const now = new Date();
    const currentMonth = now.toLocaleString( "default", { month: "long" } );

    // setSelectedMonth( currentMonth );
    setDate( new Date().toISOString().split( "T" )[ 0 ] );

    console.log( "currentMonth:", currentMonth );
    console.log( "currentDateTime:", new Date().toLocaleDateString() );
    console.log( "currentYear:", typeof ( currentYear ) );
  }, [] );

  const formatDateTime = ( date: Date ) => {
    return date.toLocaleString( "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    } );
  };

  const handleMonthChange = ( e ) => {
    let newMonth = e.target.value;
   
    console.log( "newMonth", newMonth )
    // If a month is selected, clear the date filter
    if ( newMonth && newMonth !== "" )
    {
      setDate( "" ); // Changed from null to empty string for consistency
    }
    if ( newMonth === 'All' )
    {
      newMonth = "";
    }   
    setSelectedMonth( newMonth );
  };

  // Date TextField onChange handler
  const handleDateChange = ( e ) => {
    const newDate = e.target.value;
    setDate( newDate );

    // If a date is selected, clear the month filter
    if ( newDate && newDate !== "" )
    {
      setSelectedMonth( "" );
    }
  };

  async function fetchAgentCount () {
    const response = await fetch(
      `${ process.env.NEXT_PUBLIC_API_URL }/dashboard/agents/count`,
      {
        cache: "no-store", // To Prevent Caching
      }
    );

    if ( !response.ok )
    {
      throw new Error( "Failed to fetch agent count" );
    }
    const resData = await response.json();
    setTotalAgents( resData.data );
  }

  useEffect( () => {
    getAllCounts();
  }, [ date, selectedMonth ] ); // Added selectedMonth dependency

  useEffect( () => {
    fetchAgentCount();
  }, [] );

  const getAllCounts = async () => {
    const [
      totalApplications,
      totalNewApplications,
      totalTickets,
      totalUnderCreditReview,
      totalOperations,
      totalPendencyInFile,
      totalToBeDisbursed,
      totalDisbursed,
      totalFileSendToBanker,
      totalCarryForward,
      totalToBeApproved,
      totalApproved,
      totalRejected,
      totalDrop,
      totalHold,
      totalTicketsByMonth,
      doneTicketsByMonth,
    ] = await Promise.all( [
      fetchTotalApplications(
        selectedMonth || undefined,
        selectedMonth ? currentYear : undefined,
        date
      ),
      fetchTotalNewApplication(
        selectedMonth || undefined,
        selectedMonth ? currentYear : undefined,
        date
      ),
      fetchTotalTickets( null, id, role, date, selectedMonth, currentYear ),
      fetchTotalTickets( "under credit review", id, role, date, selectedMonth ),
      fetchTotalTickets( "operations", id, role, date, selectedMonth ),
      fetchTotalTickets( "pendency in file", id, role, date, selectedMonth ),
      fetchTotalTickets( "to be disbursed", id, role, date, selectedMonth ),
      fetchTotalTickets( "disbursed", id, role, date, selectedMonth ),
      fetchTotalTickets( "file send to banker", id, role, date, selectedMonth ),
      fetchTotalTickets( "carry forward", id, role, date, selectedMonth ),
      fetchTotalTickets( "to be approved", id, role, date, selectedMonth ),
      fetchTotalTickets( "approved", id, role, date, selectedMonth ),
      fetchTotalTickets( "rejected", id, role, date, selectedMonth ),
      fetchTotalTickets( "drop", id, role, date, selectedMonth ),
      fetchTotalTickets( "hold", id, role, date, selectedMonth ),
      getTotalTicketsByMonth( currentYear ),
      getDoneTicketsByMonth( currentYear ),
    ] );

    // Normalize the data for `disbursed` status
    const normalizedDisbursed =
      typeof totalDisbursed === "object" && totalDisbursed !== null
        ? totalDisbursed
        : { count: totalDisbursed, amount: null };

    const normalizedApproved =
      typeof totalApproved === "object" && totalApproved !== null
        ? totalApproved
        : { count: totalApproved, amount: null };

    const normalizedNewApplications = totalNewApplications
      ? {
        count: totalNewApplications.count,
        amount: totalNewApplications.amount || null,
      }
      : { count: null, amount: null };

    setAllCounts( {
      totalApplications,
      totalNewApplications: normalizedNewApplications,
      totalTickets,
      totalUnderCreditReview,
      totalOperations,
      totalPendencyInFile,
      totalToBeDisbursed,
      totalDisbursed: normalizedDisbursed,
      totalFileSendToBanker,
      totalCarryForward,
      totalToBeApproved,
      totalApproved: normalizedApproved,
      totalRejected,
      totalDrop,
      totalHold,
      totalTicketsByMonth,
      doneTicketsByMonth,
    } );
  };
  const dashboardItems = [
    {
      icon: ArchiveIcon,
      label: "Total Applications",
      key: "totalApplications",
      color: "#90a4ae",
      count: allCounts?.totalApplications,
      link: "#",
    },
    {
      icon: FiberNewIcon,
      label: "Fresh Applications",
      key: "totalNewApplications",
      color: "#ffd600",
      count: allCounts?.totalNewApplications?.count,
      amount: allCounts?.totalNewApplications?.amount,
      link: "/",
    },
    {
      icon: FilterListRounded,
      label: "Total Tickets",
      key: "totalTickets",
      color: "#009688",
      count: allCounts?.totalTickets,
      link: `/ticket?status=all${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: WorkHistoryIcon,
      label: "Under Credit Review",
      key: "underCreditReview",
      color: "#827717",
      count: allCounts?.totalUnderCreditReview,
      link: `/ticket?status=${ decodeURIComponent( "under credit review" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: LoginRounded,
      label: "Operations",
      key: "operations",
      color: "#2196f3",
      count: allCounts?.totalOperations,
      link: `/ticket?status=${ decodeURIComponent( "operations" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: PendingActionsIcon,
      label: "Pendency in File",
      key: "pendencyInFile",
      color: "#7c4dff",
      count: allCounts?.totalPendencyInFile,
      link: `/ticket?status=${ decodeURIComponent( "pendency in file" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: SendRounded,
      label: "File Send to Banker",
      key: "fileSendToBanker",
      color: "#3f51b5",
      count: allCounts?.totalFileSendToBanker,
      link: `/ticket?status=${ decodeURIComponent( "file send to banker" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: PauseCircleOutlineRounded,
      label: "Hold",
      key: "hold",
      color: "#ffeb3b",
      count: allCounts?.totalHold,
      link: `/ticket?status=${ decodeURIComponent( "hold" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: ThumbUpRounded,
      label: "To be Approved",
      key: "toBeApproved",
      color: "#aed581",
      count: allCounts?.totalToBeApproved,
      link: `/ticket?status=${ decodeURIComponent( "to be approved" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: ForwardRounded,
      label: "To be Disbursed",
      key: "toBeDisbursed",
      color: "#ffcc80",
      count: allCounts?.totalToBeDisbursed,
      link: `/ticket?status=${ decodeURIComponent( "to be disbursed" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: AccountBalanceRounded,
      label: "Approved",
      key: "approved",
      color: "#64dd17",
      count: allCounts?.totalApproved?.count,
      amount: allCounts?.totalApproved?.amount,
      link: `/ticket?status=${ decodeURIComponent( "approved" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: ReportRounded,
      label: "Disbursed",
      key: "disbursed",
      color: "#ff9800",
      count: allCounts?.totalDisbursed?.count,
      amount: allCounts?.totalDisbursed?.amount,
      link: `/ticket?status=${ decodeURIComponent( "disbursed" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "Carry Forward",
      key: "caryForward",
      color: "pink",
      count: allCounts?.totalCarryForward,
      link: `/ticket?status=${ decodeURIComponent( "carry forward" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: CancelRounded,
      label: "Rejected",
      key: "rejected",
      color: "#f44336",
      count: allCounts?.totalRejected,
      link: `/ticket?status=${ decodeURIComponent( "rejected" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },
    {
      icon: DeleteForeverRounded,
      label: "Drop",
      key: "drop",
      color: "#ff5722",
      count: allCounts?.totalDrop,
      link: `/ticket?status=${ decodeURIComponent( "drop" ) }${ selectedMonth
        ? `&month=${ encodeURIComponent( selectedMonth ) }&startDate=${ getFirstDayOfMonth( selectedMonth ) }&endDate=${ getLastDayOfMonth( selectedMonth ) }`
        : ""
        }`,
    },

    ...( role === "admin"
      ? [
        {
          icon: SupervisorAccountIcon,
          label: "Total Agents",
          key: "totalAgents",
          color: "#90a4ae",
          count: totalAgents,
          link: "/users",
        },
      ]
      : [] ),
  ];

  function getFirstDayOfMonth ( monthName: string ): string {
    const monthNames = [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ];
    const monthIndex = monthNames.indexOf( monthName );
    const currentYear = new Date().getFullYear();
    const firstDay = new Date( currentYear, monthIndex, 1 );

    return formatLocalDate( firstDay );
  }

  function getLastDayOfMonth ( monthName: string ): string {
    const monthNames = [ "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December" ];
    const monthIndex = monthNames.indexOf( monthName );
    const currentYear = new Date().getFullYear();
    const lastDay = new Date( currentYear, monthIndex + 1, 0 );

    return formatLocalDate( lastDay );
  }

  function formatLocalDate ( date: Date ): string {
    const year = date.getFullYear();
    const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
    const day = String( date.getDate() ).padStart( 2, '0' );
    return `${ year }-${ month }-${ day }`;
  }
  console.log( "allCounts:", allCounts );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          p: 2,
          backgroundColor: "#f5f7fa",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            minWidth: 300,
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#3f51b5",
            }}
          >
            {formatDateTime( currentDateTime ).split( "," )[ 0 ]},{" "}
            {formatDateTime( currentDateTime ).split( "," )[ 1 ]}
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: "0.9rem",
              color: "#607d8b",
            }}
          >
            {formatDateTime( currentDateTime ).split( "," )[ 2 ]}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel id="month-select-label" sx={{ color: "#5c6bc0" }}>
                Month
              </InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
                sx={{
                  backgroundColor: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c5cae9",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7986cb",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3f51b5",
                    borderWidth: 1,
                  },
                  borderRadius: 1,
                }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="All">All Months</MenuItem>
                <MenuItem value="January">January</MenuItem>
                <MenuItem value="February">February</MenuItem>
                <MenuItem value="March">March</MenuItem>
                <MenuItem value="April">April</MenuItem>
                <MenuItem value="May">May</MenuItem>
                <MenuItem value="June">June</MenuItem>
                <MenuItem value="July">July</MenuItem>
                <MenuItem value="August">August</MenuItem>
                <MenuItem value="September">September</MenuItem>
                <MenuItem value="October">October</MenuItem>
                <MenuItem value="November">November</MenuItem>
                <MenuItem value="December">December</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={date || ""}
              onChange={( e ) => {
                console.log( "current date change", e.target.value );
                setDate( e.target.value );

                // If a date is selected, clear the month filter
                if ( e.target.value && e.target.value !== "" )
                {
                  setSelectedMonth( "" );
                }
              }}
              InputLabelProps={{
                shrink: true,
                sx: { color: "#5c6bc0" },
              }}
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#ffffff",
                  borderRadius: 1,
                  "& fieldset": {
                    borderColor: "#c5cae9",
                  },
                  "&:hover fieldset": {
                    borderColor: "#7986cb",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3f51b5",
                  },
                },
              }}
              size="small"
            />
          </>
        </Box>
      </Box>

      <Grid lg={12.2} sm={12.3} container spacing={3} sx={{ width: "100%" }}>
        {dashboardItems.map( ( item, index ) => (
          <Grid
            xl={3}
            lg={3}
            md={3}
            sm={6}
            xs={6}
            key={index}
            sx={{
              minHeight: { xs: "120px", sm: "140px", md: "160px" },
              display: "flex",
            }}
          >
            <Link
              href={item.link || ""}
              style={{
                textDecoration: "none",
                color: "inherit",
                width: "100%",
                display: "flex",
              }}
            >
              <Budget
                Icon={item.icon}
                name={item.label}
                sx={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: item.color,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: { xs: "12px", sm: "2px", md: "2px" },
                  ":hover": {
                    transform: "scale(1.02)",
                    transition: "all 300ms ease-in-out",
                  },
                  // Ensure text doesn't overflow
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  // Special handling for amount text
                  "& .amount-text": {
                    fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                    fontWeight: "bold",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    textOverflow: "unset",
                  },
                }}
                value={item.count}
                amount={item.amount !== null ? item.amount : null}
              />
            </Link>
          </Grid>
        ) )}
        <Grid container spacing={3} lg={12} xs={12}>
          <Grid item lg={7} md={6} xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                backgroundColor: "#fff",
                borderRadius: "15px",
                height: "100%",
              }}
            >
              <Sales
                chartSeries={[
                  {
                    name: "Total Tickets",
                    data: allCounts?.totalTicketsByMonth?.map( ( value ) =>
                      Math.round( value )
                    ),
                  },
                  {
                    name: "Disbursed Tickets",
                    data: allCounts?.doneTicketsByMonth?.map( ( value ) =>
                      Math.round( value )
                    ),
                  },
                ]}
                sx={{ height: "100%" }}
              />
            </Paper>
          </Grid>

          {/* 📌 Traffic Chart */}
          <Grid item lg={5} md={6} xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                backgroundColor: "#fff",
                borderRadius: "15px",
                height: "100%",
              }}
            >
              <Traffic
                date={date}
                setDate={setDate}
                chartSeries={[
                  allCounts?.totalTickets,
                  allCounts?.totalUnderCreditReview,
                  allCounts?.totalOperations,
                  allCounts?.totalPendencyInFile,
                  allCounts?.totalToBeDisbursed,
                  allCounts?.totalDisbursed?.count,
                  allCounts?.totalFileSendToBanker,
                  allCounts?.totalToBeApproved,
                  allCounts?.totalApproved?.count,
                  allCounts?.totalCarryForward,
                ]}
                labels={[
                  "Total Tickets",
                  "Under Credit Review",
                  "Operations",
                  "Pendency in File",
                  "To be Disbursed",
                  "Disbursed",
                  "File Send to Banker",
                  "To be Approved",
                  "Approved",
                  "Carry Forward",
                ]}
                sx={{ height: "100%" }}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} lg={12} xs={12}>
          <Grid item lg={4} md={6} xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                backgroundColor: "#f8f9fa",
                borderRadius: "15px",
                height: "100%",
              }}
            >
              <LatestApplications sx={{ height: "100%" }} />
            </Paper>
          </Grid>

          {/* 📜 Latest Orders */}
          <Grid item lg={8} md={6} xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                backgroundColor: "#fff",
                borderRadius: "15px",
                height: "100%",
              }}
            >
              <LatestOrders sx={{ height: "100%" }} />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

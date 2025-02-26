import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  VisibilityRounded,
  FilterListRounded,
  ThumbUpRounded,
  LoginRounded,
  ForwardRounded,
} from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2";
import ArchiveIcon from '@mui/icons-material/Archive';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RuleIcon from '@mui/icons-material/Rule';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

import { Budget } from "@/app/components/dashboard/overview/budget";
import { LatestOrders } from "@/app/components/dashboard/overview/latest-orders";
import { LatestApplications } from "@/app/components/dashboard/overview/latest-aplications";
import { Sales } from "@/app/components/dashboard/overview/sales";
import { Traffic } from "@/app/components/dashboard/overview/traffic";
import { Utility } from "@/utils";
import { Paper } from "@mui/material";

export const metadata = {
  title: `F2 Fintech Admin Portal`,
} satisfies Metadata;

interface Ticket {
  month: string;
  count: number;
}

// Server-side function to fetch total applications count
async function fetchTotalApplications () {
  try
  {
    const response = await fetch(
      `${ process.env.NEXT_PUBLIC_API_URL }/application/count`,
      {
        cache: "no-store", // To Prevent caching
      }
    );

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
// Server-side function to fetch total applications count
async function fetchTotalNewApplication () {
  console.log( "ye chla" )
  try
  {
    const response = await fetch(
      `${ process.env.NEXT_PUBLIC_API_URL }/application/new-count`,
      {
        cache: "no-store", // To Prevent caching
      }
    );

    if ( !response.ok )
    {
      throw new Error( `HTTP error! status: ${ response.status }` );
    }
    const resData = await response.json();
    console.log( "ye chla res", resData )
    return resData.data;
  } catch ( error )
  {
    console.error( "Failed to fetch total new applications:", error );
    return null;
  }
}

async function fetchTotalTickets (
  status: string | null = null,
  id: number | null = null,
  role: string
): Promise<number> {
  let url = `${ process.env.NEXT_PUBLIC_API_URL }/dashboard/tickets/count`;

  if ( role === "agent" && id !== null )
  {
    url += `/${ id }`;
  }

  if ( status )
  {
    url += `/${ encodeURIComponent( status ) }`;
  }
  const response = await fetch( url, {
    cache: "no-store",
  } ); // To Prevent caching

  if ( !response.ok )
  {
    throw new Error( "Failed to fetch total Tickets" );
  }
  const resData = await response.json();
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

async function fetchAgentCount (): Promise<number> {
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
  return resData.data;
}

export default async function Page (): Promise<React.JSX.Element> {
  const cookieStore = cookies();
  const { decodedToken } = Utility();
  const userToken = cookieStore.get( "token" );
  const { id, role } = decodedToken( userToken?.value );

  console.log( "id role=>", id, role );

  const [
    totalApplications,
    totalNewApplications,
    totalTickets,
    totalUnderCreditReview,
    totalToBeLogin,
    totalPendencyInFile,
    totalToBeApproved,
    totalToBeDisbursed,
    totalFileSendToBanker,
    totalTvrDone,
    totalCamReportDone,
    totalRelook,
    totalApproved,
    totalDisbursed,
    totalTicketsByMonth,
    doneTicketsByMonth,
  ] = await Promise.all( [
    fetchTotalApplications(),
    fetchTotalNewApplication(),
    fetchTotalTickets( null, id, role ),
    fetchTotalTickets( "under credit review", id, role ),
    fetchTotalTickets( "to be login", id, role ),
    fetchTotalTickets( "pendency in file", id, role ),
    fetchTotalTickets( "to be approved", id, role ),
    fetchTotalTickets( "to be disbursed", id, role ),
    fetchTotalTickets( "file send to banker", id, role ),
    fetchTotalTickets( "tvr done", id, role ),
    fetchTotalTickets( "cam report done", id, role ),
    fetchTotalTickets( "relook", id, role ),
    fetchTotalTickets( "approved",id ,role),
    fetchTotalTickets( "disbursed", id, role ),
    getTotalTicketsByMonth( 2024 ),   
    getDoneTicketsByMonth( 2024 ),
  ] );

  const totalAgents = role === "admin" ? await fetchAgentCount() : null;
  console.log( totalNewApplications, 'new apps' )
  const dashboardItems = [
    {
      icon: ArchiveIcon,
      label: "Total Applications",
      key: "totalApplications",
      color: "#90a4ae",
      count: totalApplications,
      link: "#",
    },
    {
      icon: FiberNewIcon,
      label: "New Applications",
      key: "totalNewApplications",
      color: "#ffd600",
      count: totalNewApplications,
      link: "/",
    },
    {
      icon: FilterListRounded,
      label: "Total Tickets",
      key: "totalTickets",
      color: "#009688",
      count: totalTickets,
      link: `/ticket?status=${ decodeURIComponent( "all" ) }`,
    },
    {
      icon: WorkHistoryIcon,
      label: "Under Credit Review",
      key: "underCreditReview",
      color: "#827717",
      count: totalUnderCreditReview,
      link: `/ticket?status=${ decodeURIComponent( "under credit review" ) }`,
    },
    {
      icon: LoginRounded,
      label: "To be Login",
      key: "toBeLogin",
      color: "#2196f3",
      count: totalToBeLogin,
      link: `/ticket?status=${ decodeURIComponent( "to be login" ) }`,
    },
    {
      icon: PendingActionsIcon,
      label: "Pendency in File",
      key: "pendencyInFile",
      color: "#f44336",
      count: totalPendencyInFile,
      link: `/ticket?status=${ decodeURIComponent( "pendency in file" ) }`,
    },
   
    {
      icon: RuleIcon,
      label: "Tvr Done",
      key: "tvrDone",
      color: "#00bcd4",
      count: totalTvrDone,
      link: `/ticket?status=${ decodeURIComponent( "tvr done" ) }`,
    },
    {
      icon: RuleIcon,
      label: "Cam Report Done",
      key: "camReportDone",
      color: "#8bc34a",
      count: totalCamReportDone,
      link: `/ticket?status=${ decodeURIComponent( "cam report done" ) }`,
    },
    {
      icon: ForwardRounded,
      label: "To be Disbursed",
      key: "toBeDisbursed",
      color: "#ffcc80",
      count: totalToBeDisbursed,
      link: `/ticket?status=${ decodeURIComponent( "to be disbursed" ) }`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "Disbursed",
      key: "disbursed",
      color: "#ff9800",
      count: totalDisbursed,
      link: `/ticket?status=${ decodeURIComponent( "disbursed" ) }`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "File Send to Banker",
      key: "fileSendToBanker",
      color: "#3f51b5",
      count: totalFileSendToBanker,
      link: `/ticket?status=${ decodeURIComponent( "file send to banker" ) }`,
    },
    {
      icon: VisibilityRounded,
      label: "Relook",
      key: "relook",
      color: "#ff5722",
      count: totalRelook,
      link: `/ticket?status=${ decodeURIComponent( "relook" ) }`,
    },
    {
      icon: ThumbUpRounded,
      label: "To be Approved",
      key: "toBeApproved",
      color: "#aed581",
      count: totalToBeApproved,
      link: `/ticket?status=${ decodeURIComponent( "to be approved" ) }`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "Approved",
      key: "approved",
      color: "#64dd17",
      count: totalApproved,
      link: `/ticket?status=${ decodeURIComponent( "approved" ) }`,
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
  console.log(
    totalTickets,
    totalUnderCreditReview,
    totalToBeLogin,
    totalPendencyInFile,
    totalToBeApproved,
    totalToBeDisbursed,
    totalTvrDone,
    totalCamReportDone,
    totalRelook,
    totalApproved,
    "tickets count"
  );

  return (
    <Grid lg={12.2} sm={12.3} container spacing={3} sx={{ width: "100%" }}>
      {dashboardItems.map( ( item, index ) => (
        <Grid lg={3} sm={6} xs={12} key={index}>
          <Link
            href={item.link || ""}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Budget
              Icon={item.icon}
              name={item.label}
              sx={{
                height: "100%",
                backgroundColor: item.color,
                borderRadius: "20px",
                maxHeight: "20vh",
                ":hover": {
                  transform: "scale(1.1)",
                  transition: "all 300ms ease-in-out",
                },
              }}
              value={item.count}
            />
          </Link>
        </Grid>
      ) )}
      <Grid container spacing={3} item lg={12} xs={12}>
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
                { name: "Total Tickets", data: totalTicketsByMonth },
                { name: "To be Disbursed", data: doneTicketsByMonth },
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
              chartSeries={[
                totalTickets,
                totalUnderCreditReview,
                totalToBeLogin,
                totalPendencyInFile,
                totalToBeApproved,
                totalTvrDone,
                totalCamReportDone,
                totalToBeLogin,
                totalToBeDisbursed,
                totalFileSendToBanker,
                totalApproved,
                totalDisbursed,
              ]}
              labels={[
                "Total Tickets",
                "Under Credit Review",
                "Total To Be Login",
                "Pendency in File",
                "To be Approved",
                "TVR Done",
                "Cam Report Done",
                "To be Login",
                "To be Disbursed",
                "File Sent to Banker",
                "Approved",
                "Disbursed",

              ]}
              sx={{ height: "100%" }}
            />
          </Paper>
        </Grid>

      </Grid>

      <Grid container spacing={3} item lg={12} xs={12}>
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
  );
}

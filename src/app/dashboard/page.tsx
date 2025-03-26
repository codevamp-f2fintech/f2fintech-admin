"use client";

import * as React from "react";
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
} from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2";
import ArchiveIcon from '@mui/icons-material/Archive';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

import { Budget } from "@/app/components/dashboard/overview/budget";
import { LatestOrders } from "@/app/components/dashboard/overview/latest-orders";
import { LatestApplications } from "@/app/components/dashboard/overview/latest-aplications";
import { Sales } from "@/app/components/dashboard/overview/sales";
import { Traffic } from "@/app/components/dashboard/overview/traffic";
import { Utility } from "@/utils";
import { Box, Paper, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

interface Ticket {
  month: string;
  count: number;
}

// Server-side function to fetch total applications count
async function fetchTotalApplications(): Promise<number | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/application/count`,
      {
        cache: "no-store", // To Prevent caching
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resData = await response.json();
    return resData.data;
  } catch (error) {
    console.error("Failed to fetch total applications:", error);
    return null;
  }
}

// Server-side function to fetch total new applications count
async function fetchTotalNewApplication(): Promise<number | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/application/new-count`,
      {
        cache: "no-store", // To Prevent caching
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resData = await response.json();
    return resData.data;
  } catch (error) {
    console.error("Failed to fetch total new applications:", error);
    return null;
  }
}

async function fetchTotalTickets(
  status: string | null = null,
  id: number | null = null,
  role: string,
  date?: string | null,
  month?: string
): Promise<number> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tickets/count`;

  if (role === "agent" && id !== null) {
    url += `/${id}`;
  }

  if (status) {
    url += `/${encodeURIComponent(status)}`;
  }

  if (date) {
    url += `?date=${encodeURIComponent(date)}`;
  }

  if (month) {
    url += `?month=${encodeURIComponent(month)}`;
  }

  const response = await fetch(url, {
    cache: "no-store",
  }); // To Prevent caching

  if (!response.ok) {
    throw new Error("Failed to fetch total Tickets");
  }
  const resData = await response.json();
  return resData.data;
}

async function getTotalTicketsByMonth(year: number): Promise<Ticket[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tickets/counts-by-month?year=${year}`,
    {
      cache: "no-store", // To Prevent Caching
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly count");
  }
  const resData = await response.json();
  return resData.data.map((ticket: Ticket) => ticket.count);
}

async function getDoneTicketsByMonth(year: number): Promise<Ticket[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tickets/done-counts-by-month?year=${year}`,
    {
      cache: "no-store", // To Prevent Caching
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monthly done count");
  }
  const resData = await response.json();
  return resData.data.map((ticket: Ticket) => ticket.count);
}

// eslint-disable-next-line @next/next/no-async-client-component
export default function Page(): React.JSX.Element {
  const { decodedToken, getCookies } = Utility();
  const cookies = getCookies();
  const userToken = cookies.token;
  const { id, role } = decodedToken(userToken?.value);

  const [date, setDate] = React.useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");
  const [allCounts, setAllCounts] = React.useState<any>({});
  const [totalAgents, setTotalAgents] = React.useState<number | null>(null);

  async function fetchAgentCount() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/agents/count`,
      {
        cache: "no-store", // To Prevent Caching
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch agent count");
    }
    const resData = await response.json();
    setTotalAgents(resData.data);
  }

  React.useEffect(() => {
    getAllCounts();
  }, [date, selectedMonth]);  // Added selectedMonth dependency

  React.useEffect(() => {
    fetchAgentCount();
  }, []);

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
    ] = await Promise.all([
      fetchTotalApplications(),
      fetchTotalNewApplication(),
      fetchTotalTickets(null, id, role, date, selectedMonth),
      fetchTotalTickets("under credit review", id, role, date, selectedMonth),
      fetchTotalTickets("operations", id, role, date, selectedMonth),
      fetchTotalTickets("pendency in file", id, role, date, selectedMonth),
      fetchTotalTickets("to be disbursed", id, role, date, selectedMonth),
      fetchTotalTickets("disbursed", id, role, date, selectedMonth),
      fetchTotalTickets("file send to banker", id, role, date, selectedMonth),
      fetchTotalTickets("carry forward", id, role, date, selectedMonth),
      fetchTotalTickets("to be approved", id, role, date, selectedMonth),
      fetchTotalTickets("approved", id, role, date, selectedMonth),
      fetchTotalTickets("rejected", id, role, date, selectedMonth),
      fetchTotalTickets("drop", id, role, date, selectedMonth),
      fetchTotalTickets("hold", id, role, date, selectedMonth),
      getTotalTicketsByMonth(2024),
      getDoneTicketsByMonth(2024),
    ]);

    setAllCounts({
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
    });
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
      count: allCounts?.totalNewApplications,
      link: "/",
    },
    {
      icon: FilterListRounded,
      label: "Total Tickets",
      key: "totalTickets",
      color: "#009688",
      count: allCounts?.totalTickets,
      link: `/ticket?status=${decodeURIComponent("all")}`,
    },
    {
      icon: WorkHistoryIcon,
      label: "Under Credit Review",
      key: "underCreditReview",
      color: "#827717",
      count: allCounts?.totalUnderCreditReview,
      link: `/ticket?status=${decodeURIComponent("under credit review")}`,
    },
    {
      icon: LoginRounded,
      label: "Operations",
      key: "operations",
      color: "#2196f3",
      count: allCounts?.totalOperations,
      link: `/ticket?status=${decodeURIComponent("operations")}`,
    },
    {
      icon: PendingActionsIcon,
      label: "Pendency in File",
      key: "pendencyInFile",
      color: "#7c4dff",
      count: allCounts?.totalPendencyInFile,
      link: `/ticket?status=${decodeURIComponent("pendency in file")}`,
    },
    {
      icon: SendRounded,
      label: "File Send to Banker",
      key: "fileSendToBanker",
      color: "#3f51b5",
      count: allCounts?.totalFileSendToBanker,
      link: `/ticket?status=${decodeURIComponent("file send to banker")}`,
    },
    {
      icon: PauseCircleOutlineRounded,
      label: "Hold",
      key: "hold",
      color: "#ffeb3b",
      count: allCounts?.totalHold,
      link: `/ticket?status=${decodeURIComponent("hold")}`,
    },
    {
      icon: ThumbUpRounded,
      label: "To be Approved",
      key: "toBeApproved",
      color: "#aed581",
      count: allCounts?.totalToBeApproved,
      link: `/ticket?status=${decodeURIComponent("to be approved")}`,
    },
    {
      icon: ForwardRounded,
      label: "To be Disbursed",
      key: "toBeDisbursed",
      color: "#ffcc80",
      count: allCounts?.totalToBeDisbursed,
      link: `/ticket?status=${decodeURIComponent("to be disbursed")}`,
    },
    {
      icon: AccountBalanceRounded,
      label: "Approved",
      key: "approved",
      color: "#64dd17",
      count: allCounts?.totalApproved,
      link: `/ticket?status=${decodeURIComponent("approved")}`,
    },
    {
      icon: ReportRounded,
      label: "Disbursed",
      key: "disbursed",
      color: "#ff9800",
      count: allCounts?.totalDisbursed,
      link: `/ticket?status=${decodeURIComponent("disbursed")}`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "Carry Forward",
      key: "caryForward",
      color: "pink",
      count: allCounts?.totalCarryForward,
      link: `/ticket?status=${decodeURIComponent("carry forward")}`,
    },
    {
      icon: CancelRounded,
      label: "Rejected",
      key: "rejected",
      color: "#f44336",
      count: allCounts?.totalRejected,
      link: `/ticket?status=${decodeURIComponent("rejected")}`,
    },
    {
      icon: DeleteForeverRounded,
      label: "Drop",
      key: "drop",
      color: "#ff5722",
      count: allCounts?.totalDrop,
      link: `/ticket?status=${decodeURIComponent("drop")}`,
    },

    ...(role === "admin"
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
      : []),
  ];

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "30%", ml: "68%" }}>
        <Box sx={{ mb: "1.3rem", mr: "2rem" }}>
          {/* Month selection dropdown */}
          <FormControl sx={{ width: 150 }}>
            <InputLabel id="month-select-label">Month</InputLabel>
            <Select
              labelId="month-select-label"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Month"
              sx={{
                width: 150,
                borderRadius: 2, // Rounded corners
                backgroundColor: "#ffffff", // Light gray background
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, // Rounded input field
                  backgroundColor: "#ffffff", // White background for input field
                },
                '& .MuiInputLabel-root': {
                  color: "#3f51b5", // Label color
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: "#3f51b5", // Color when focused
                },
                '&:hover .MuiOutlinedInput-root': {
                  borderColor: "#3f51b5", // Border color on hover
                },
                '&:focus-within .MuiOutlinedInput-root': {
                  borderColor: "#3f51b5", // Border color on focus
                },
              }}
            >
              <MenuItem value="">Select Month</MenuItem>
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
        </Box>
        <Box sx={{ mb: "1.3rem" }}>
          <TextField
            label="Date"
            type="date"
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 150,
              borderRadius: 2, // Rounded corners
              backgroundColor: "#f3f3f3", // Light gray background
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, // Rounded input field
                backgroundColor: "#ffffff", // White background for input field
              },
              '& .MuiInputLabel-root': {
                color: "#3f51b5", // Label color
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: "#3f51b5", // Color when focused
              },
              '&:hover .MuiOutlinedInput-root': {
                borderColor: "#3f51b5", // Border color on hover
              },
              '&:focus-within .MuiOutlinedInput-root': {
                borderColor: "#3f51b5", // Border color on focus
              },
            }}
          />
        </Box>
      </Box>

      <Grid lg={12.2} sm={12.3} container spacing={3} sx={{ width: "100%" }}>
        {dashboardItems.map((item, index) => (
          <Grid lg={3} sm={6} xs={12} key={index}>
            <Link href={item.link || ""} style={{ textDecoration: "none", color: "inherit" }}>
              <Budget
                Icon={item.icon}
                name={item.label}
                sx={{
                  height: "100%",
                  backgroundColor: item.color,
                  borderRadius: "20px",
                  maxHeight: "25vh",
                  ":hover": {
                    transform: "scale(1.1)",
                    transition: "all 300ms ease-in-out",
                  },
                }}
                value={item.count}
              />
            </Link>
          </Grid>
        ))}
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
                  { name: "Total Tickets", data: allCounts?.totalTicketsByMonth },
                  { name: "To be Disbursed", data: allCounts?.doneTicketsByMonth },
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
                  allCounts?.totalDisbursed,
                  allCounts?.totalFileSendToBanker,
                  allCounts?.totalToBeApproved,
                  allCounts?.totalApproved,
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

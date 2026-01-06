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
import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../apis/config/axiosConfig";


interface Ticket {
  month: string;
  count: number;
}

// Updated function to fetch total applications count using axios
async function fetchTotalApplications(
  month?: string,
  year?: number,
  date?: string,
): Promise<number | null> {
  try {
    const params: any = {};

    // Only add month if it's provided and not empty
    if (month && month !== "") {
      params.month = month;
      // Always include the current year when month is provided
      params.year = new Date().getFullYear().toString();
    }

    // Only add date if it's provided and not empty
    if (date && date !== "") {
      params.date = date;
    }

    const response = await axiosInstance.get("/application/count", { params });
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch total applications:", error);
    return null;
  }
}

// Updated function to fetch total new applications count using axios
async function fetchTotalNewApplication(
  month?: string,
  year?: number,
  date?: string,
): Promise<{ count: number; amount: number } | null> {
  try {
    const params: any = {};

    if (month) params.month = month;
    if (year) params.year = year.toString();
    if (date) params.date = date;

    const response = await axiosInstance.get("/application/new-count", { params });

    return {
      count: response.data.data.count || response.data.data,
      amount: response.data.data.amount || 0,
    };
  } catch (error) {
    console.error("Failed to fetch total new applications:", error);
    return null;
  }
}

// Updated function to fetch total tickets using axios
async function fetchTotalTickets(
  status: string | null = null,
  id: number | null = null,
  role: string,
  date?: string | null,
  month?: string,
  year?: string,
): Promise<number | { count: number; amount: number }> {
  try {
    const params: any = {};

    // Add userId for non-admin users
    if (role !== "admin" && role !== "sub admin" && id !== null) {
      params.userId = id.toString();
    }

    // Add status if provided
    if (status) {
      params.status = status;
    }

    // Add date filters
    if (date) {
      params.date = date;
    }
    if (month) {
      params.month = month;
    }
    if (year) {
      params.year = year;
    }

    console.log("Fetching tickets with params:", params);

    const response = await axiosInstance.get("/dashboard/tickets/count", { params });
    console.log("API Response:", response.data);

    if (status === "disbursed" || status === "approved") {
      return {
        count: response.data.data.count || 0,
        amount: response.data.data.amount || 0,
      };
    }

    return response.data.data || 0;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return 0;
  }
}

// Updated function to get total tickets by month using axios
async function getTotalTicketsByMonth(year: number): Promise<Ticket[]> {
  try {
    const params: any = { year };

    const response = await axiosInstance.get("/dashboard/tickets/counts-by-month", { params });
    console.log("Monthly tickets response:", response.data);

    return response.data.data.map((ticket: Ticket) => ticket.count);
  } catch (error) {
    console.error("Failed to fetch monthly count:", error);
    throw new Error("Failed to fetch monthly count");
  }
}

// Updated function to get done tickets by month using axios
async function getDoneTicketsByMonth(year: number): Promise<Ticket[]> {
  try {
    const params: any = { year };

    const response = await axiosInstance.get("/dashboard/tickets/done-counts-by-month", { params });
    console.log("Monthly done tickets response:", response.data);

    return response.data.data.map((ticket: Ticket) => ticket.count);
  } catch (error) {
    console.error("Failed to fetch monthly done count:", error);
    throw new Error("Failed to fetch monthly done count");
  }
}

// Updated function to fetch agent count using axios
async function fetchAgentCount(): Promise<number | null> {
  try {
    const response = await axiosInstance.get("/dashboard/agents/count");
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch agent count:", error);
    return null;
  }
}

export default function Page(): React.JSX.Element {
  const { decodedToken, getCookies } = Utility();
  const cookies = getCookies();
  const userToken = (cookies as any).token;
  const { id, role, companyId } = decodedToken(userToken?.value);

  const [date, setDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [allCounts, setAllCounts] = useState<any>({});
  const [totalAgents, setTotalAgents] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const currentDate = new Date().toLocaleDateString("en-CA");

  const [selectedCompany, setSelectedCompany] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedCompanyId") || ""
      : ""
  );

  // Sync with global company selection
  useEffect(() => {
    const handleGlobalCompanyChange = (event: any) => {
      console.log("Dashboard received companyChanged event:", event.detail);
      setSelectedCompany(event.detail);
      window.location.reload();
    };

    window.addEventListener("companyChanged", handleGlobalCompanyChange);
    return () => window.removeEventListener("companyChanged", handleGlobalCompanyChange);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });

    setDate(new Date().toISOString().split("T")[0]);

    console.log("currentMonth:", currentMonth);
    console.log("currentDateTime:", new Date().toLocaleDateString());
    console.log("currentYear:", typeof currentYear);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleMonthChange = (e) => {
    let newMonth = e.target.value;

    console.log("newMonth", newMonth);
    // If a month is selected, clear the date filter
    if (newMonth && newMonth !== "") {
      setDate("");
    }
    if (newMonth === "All") {
      newMonth = "";
    }
    setSelectedMonth(newMonth);
  };

  // Date TextField onChange handler
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);

    // If a date is selected, clear the month filter
    if (newDate && newDate !== "") {
      setSelectedMonth("");
    }
  };

  useEffect(() => {
    getAllCounts();
  }, [date, selectedMonth, selectedCompany]);

  useEffect(() => {
    const loadAgentCount = async () => {
      const count = await fetchAgentCount();
      setTotalAgents(count);
    };
    loadAgentCount();
  }, []);

  const getAllCounts = async () => {
    try {
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
        fetchTotalTickets(null, id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("under credit review", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("operations", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("pendency in file", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("to be disbursed", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("disbursed", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("file send to banker", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("carry forward", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("to be approved", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("approved", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("rejected", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("drop", id, role, date, selectedMonth, currentYear.toString()),
        fetchTotalTickets("hold", id, role, date, selectedMonth, currentYear.toString()),
        getTotalTicketsByMonth(currentYear),
        getDoneTicketsByMonth(currentYear),
      ]);

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

      setAllCounts({
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
      });
    } catch (error) {
      console.error("Error fetching all counts:", error);
    }
  };

  const dashboardItems = [
    {
      icon: ArchiveIcon,
      label: "Total Applications",
      key: "totalApplications",
      color: "#f5f7fa",
      iconBgColor: "#1de9b6",
      count: allCounts?.totalApplications,
      link: "#",
    },
    {
      icon: FiberNewIcon,
      label: "Fresh Applications",
      key: "totalNewApplications",
      color: "#f5f7fa",
      iconBgColor: "#00e5ff",
      count: allCounts?.totalNewApplications?.count,
      amount: allCounts?.totalNewApplications?.amount,
      link: "/",
    },
    {
      icon: FilterListRounded,
      label: "Total Tickets",
      key: "totalTickets",
      color: "#f5f7fa",
      iconBgColor: "#cddc39",
      count: allCounts?.totalTickets,
      link: `/ticket?status=all${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: WorkHistoryIcon,
      label: "Under Credit Review",
      key: "underCreditReview",
      color: "#f5f7fa",
      iconBgColor: "#8bc34a",
      count: allCounts?.totalUnderCreditReview,
      link: `/ticket?status=${decodeURIComponent("under credit review")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: LoginRounded,
      label: "Operations",
      key: "operations",
      color: "#f5f7fa",
      iconBgColor: "#ffa726",
      count: allCounts?.totalOperations,
      link: `/ticket?status=${decodeURIComponent("operations")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: PendingActionsIcon,
      label: "Pendency in File",
      key: "pendencyInFile",
      color: "#f5f7fa",
      iconBgColor: "#ff7043",
      count: allCounts?.totalPendencyInFile,
      link: `/ticket?status=${decodeURIComponent("pendency in file")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: SendRounded,
      label: "File Send to Banker",
      key: "fileSendToBanker",
      color: "#f5f7fa",
      iconBgColor: "#827717",
      count: allCounts?.totalFileSendToBanker,
      link: `/ticket?status=${decodeURIComponent("file send to banker")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: PauseCircleOutlineRounded,
      label: "Hold",
      key: "hold",
      color: "#f5f7fa",
      iconBgColor: "#1a237e",
      count: allCounts?.totalHold,
      link: `/ticket?status=${decodeURIComponent("hold")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: ThumbUpRounded,
      label: "To be Approved",
      key: "toBeApproved",
      color: "#f5f7fa",
      iconBgColor: "#26c6da",
      count: allCounts?.totalToBeApproved,
      link: `/ticket?status=${decodeURIComponent("to be approved")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: ForwardRounded,
      label: "To be Disbursed",
      key: "toBeDisbursed",
      color: "#f5f7fa",
      iconBgColor: "#a5d6a7",
      count: allCounts?.totalToBeDisbursed,
      link: `/ticket?status=${decodeURIComponent("to be disbursed")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: AccountBalanceRounded,
      label: "Approved",
      key: "approved",
      color: "#f5f7fa",
      iconBgColor: "#69f0ae",
      count: allCounts?.totalApproved?.count,
      amount: allCounts?.totalApproved?.amount,
      link: `/ticket?status=${decodeURIComponent("approved")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: ReportRounded,
      label: "Disbursed",
      key: "disbursed",
      color: "#f5f7fa",
      iconBgColor: "#ff9800",
      count: allCounts?.totalDisbursed?.count,
      amount: allCounts?.totalDisbursed?.amount,
      link: `/ticket?status=${decodeURIComponent("disbursed")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: SendTimeExtensionIcon,
      label: "Carry Forward",
      key: "caryForward",
      color: "#f5f7fa",
      iconBgColor: "#795548",
      count: allCounts?.totalCarryForward,
      link: `/ticket?status=${decodeURIComponent("carry forward")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: CancelRounded,
      label: "Rejected",
      key: "rejected",
      color: "#f5f7fa",
      iconBgColor: "#dd2c00",
      count: allCounts?.totalRejected,
      link: `/ticket?status=${decodeURIComponent("rejected")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: DeleteForeverRounded,
      label: "Drop",
      key: "drop",
      color: "#f5f7fa",
      iconBgColor: "#ff6e40",
      count: allCounts?.totalDrop,
      link: `/ticket?status=${decodeURIComponent("drop")}${selectedMonth
        ? `&month=${encodeURIComponent(
          selectedMonth
        )}&startDate=${getFirstDayOfMonth(
          selectedMonth
        )}&endDate=${getLastDayOfMonth(selectedMonth)}`
        : ""
        }`,
    },
    {
      icon: SendRounded,
      label: "AI Leads",
      key: "aiLeads",
      color: "#f5f7fa",
      iconBgColor: "#00e676",
      count: null,
      link: "/ai-leads",
    },

    ...(role === "admin"
      ? [
        {
          icon: SupervisorAccountIcon,
          label: "Total Agents",
          key: "totalAgents",
          color: "#f5f7fa",
          iconBgColor: "#9fa8da",
          count: totalAgents,
          link: "/users",
        },
      ]
      : []),
  ];

  function getFirstDayOfMonth(monthName: string): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = monthNames.indexOf(monthName);
    const currentYear = new Date().getFullYear();
    const firstDay = new Date(currentYear, monthIndex, 1);

    return formatLocalDate(firstDay);
  }

  function getLastDayOfMonth(monthName: string): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = monthNames.indexOf(monthName);
    const currentYear = new Date().getFullYear();
    const lastDay = new Date(currentYear, monthIndex + 1, 0);

    return formatLocalDate(lastDay);
  }

  function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  console.log("allCounts:", allCounts);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "flex-start", sm: "space-between" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 2, md: 3 },
            mb: 5,
            p: { xs: 1.5, sm: 2 },
            backgroundColor: "#f5f7fa",
            borderRadius: 2,
            boxShadow: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: { xs: "flex-start", sm: "flex-start" },
              minWidth: { xs: "100%", sm: 250, md: 300 },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                fontWeight: "bold",
                color: "#3f51b5",
                wordBreak: "break-word",
              }}
            >
              {formatDateTime(currentDateTime).split(",")[0]},{" "}
              {formatDateTime(currentDateTime).split(",")[1]}
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: "0.9rem",
                color: "#607d8b",
              }}
            >
              {formatDateTime(currentDateTime).split(",")[2]}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "flex-start",
              gap: { xs: 1.5, sm: 2 },
              width: { xs: "50%", sm: "auto" },
            }}
          >
            <>
              <FormControl
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
                size="small"
              >
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
                onChange={(e) => {
                  console.log("current date change", e.target.value);
                  setDate(e.target.value);

                  // If a date is selected, clear the month filter
                  if (e.target.value && e.target.value !== "") {
                    setSelectedMonth("");
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: { color: "#5c6bc0" },
                }}
                sx={{
                  minWidth: 150,
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

        <Grid
          lg={12.2}
          sm={12.3}
          container
          spacing={3}
          sx={{
            width: "100%",
            display: "flex",
            height: "100vh",
            transform: "translateZ(0)",
            justifyContent: "center",
            overflowX: "auto",
            maxWidth: "100vw",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            mx: "0 auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {dashboardItems.map((item, index) => (
            <Grid
              xl={3}
              lg={3}
              md={3}
              sm={6}
              xs={6}
              key={index}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
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
                  value={item.count}
                  iconBgColor={item.iconBgColor}
                  amount={item.amount !== null ? item.amount : null}
                  sx={{
                    width: "100%",
                    backgroundColor: item.color,
                    borderRadius: "20px",
                    minHeight: "65px",
                    padding: "6px 8px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    transition: "all 120ms ease-in-out",

                    // Use row layout for the main content
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",

                    ":hover": {
                      transform: "scale(1.01)",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
                    },

                    // FIRST ROW - Icon + Label + Count in one row
                    "& .first-row": {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    },

                    "& .MuiSvgIcon-root": {
                      fontSize: "1.2rem",
                      opacity: 0.9,
                    },

                    "& .label-text": {
                      fontSize: ".85rem",
                      fontWeight: 600,
                      lineHeight: "1",
                      whiteSpace: "normal",
                      textAlign: "left",
                      flex: 1,
                    },

                    "& .count-text": {
                      fontSize: ".9rem",
                      fontWeight: 700,
                      lineHeight: "1.1",
                      minWidth: "30px",
                      textAlign: "right",
                    },

                    // AMOUNT (second row - below if exists)
                    "& .amount-text": {
                      fontSize: ".6rem",
                      opacity: 0.85,
                      fontWeight: 500,
                      lineHeight: "1",
                      textAlign: "center",
                      width: "100%",
                      marginTop: "2px",
                    },
                  }}
                />
              </Link>
            </Grid>
          ))}
          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
            container
            spacing={3}
            lg={12}
            xs={12}
          >
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
                      data: allCounts?.totalTicketsByMonth?.map((value) =>
                        Math.round(value)
                      ),
                    },
                    {
                      name: "Disbursed Tickets",
                      data: allCounts?.doneTicketsByMonth?.map((value) =>
                        Math.round(value)
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
            <Grid item lg={4} md={6} xs={12} x>
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
      </Box>
    </Box>
  );
}
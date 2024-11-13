import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";

import { config } from "@/app/config";
import { Budget } from "@/app/components/dashboard/overview/budget";
import { LatestOrders } from "@/app/components/dashboard/overview/latest-orders";
import { LatestProducts } from "@/app/components/dashboard/overview/latest-products";
import { Sales } from "@/app/components/dashboard/overview/sales";
import { Traffic } from "@/app/components/dashboard/overview/traffic";
import { Utility } from "@/utils";

export const metadata = {
  title: `Overview | Dashboard | ${config.site.name}`,
} satisfies Metadata;

interface Ticket {
  month: string;
  count: number;
}

// Server-side function to fetch total applications count
async function fetchTotalApplications() {
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

async function fetchTotalTickets(
  status: string | null = null,
  id: number | null = null,
  role: string
): Promise<number> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tickets/count`;

  if (role === "sales" && id !== null) {
    url += `/${id}`;
  }

  if (status) {
    url += `/${encodeURIComponent(status)}`;
  }
  // console.log(url, "ticket count url");
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

async function fetchAgentCount(): Promise<number> {
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
  return resData.data;
}

export default async function Page(): Promise<React.JSX.Element> {
  const cookieStore = cookies();
  const { decodedToken } = Utility();
  const userToken = cookieStore.get("token");
  const { id, role } = decodedToken(userToken?.value);
  const [
    totalApplications,
    totalTickets,
    totalOpenTickets,
    totalInProgressTickets,
    totalForwardedTickets,
    totalCloseTickets,
    totalCompletedTickets,
    totalAgents,
    totalTicketsByMonth,
    doneTicketsByMonth,
  ] = await Promise.all([
    fetchTotalApplications(),
    fetchTotalTickets(null, id, role),
    fetchTotalTickets("to do", id, role),
    fetchTotalTickets("in progress", id, role),
    fetchTotalTickets("forwarded", id, role),
    fetchTotalTickets("close", id, role),
    fetchTotalTickets("done", id, role),
    fetchAgentCount(),
    getTotalTicketsByMonth(2024),
    getDoneTicketsByMonth(2024),
  ]);

  const dashboardItems = [
    {
      label: "Total Applications",
      key: "totalApplications",
      color: "#2196f3",
      count: totalApplications,
      link: "/",
    },
    {
      label: "Total Tickets",
      key: "totalTickets",
      color: "#ff6e40",
      count: totalTickets,
      link: `/ticket?status=${decodeURIComponent("all")}`,
    },
    {
      label: "Open Tickets",
      key: "openTickets",
      color: "#ab47bc",
      count: totalOpenTickets,
      link: `/ticket?status=${decodeURIComponent("to do")}`, // Link to the open tickets page
    },
    {
      label: "In Progress",
      key: "inProgress",
      color: "#4db6ac",
      count: totalInProgressTickets,
      link: `/ticket?status=${decodeURIComponent("in progress")}`,
    },
    {
      label: "Forwarded Tickets",
      key: "forwardedTickets",
      color: "#cddc39",
      count: totalForwardedTickets,
      link: `/ticket?status=${decodeURIComponent("forwarded")}`,
    },
    {
      label: "Closed Tickets",
      key: "closedTickets",
      color: "#4caf50",
      count: totalCloseTickets,
      // link: `/ticket?status=${decodeURIComponent("close")}`,
    },
    {
      label: "Completed Tickets",
      key: "completedTickets",
      color: "#d32f2f",
      count: totalCompletedTickets,
      link: `/ticket?status=${decodeURIComponent("done")}`,
    },
    {
      label: "Total Agents",
      key: "totalAgents",
      color: "#607d8b",
      count: totalAgents,
      link: "", // Link to the agents page
    },
  ];
  console.log(
    totalTickets,
    totalOpenTickets,
    totalInProgressTickets,
    totalForwardedTickets,
    totalCloseTickets,
    "tickets count"
  );

  return (
    <Grid container spacing={3}>
      {dashboardItems.map((item, index) => (
        <Grid lg={3} sm={6} xs={12} key={index}>
          <Link
            href={item.link || ""}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Budget
              name={item.label}
              sx={{
                height: "100%",
                backgroundColor: item.color,
                borderRadius: "20px",
                boxShadow:
                  "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
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
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            {
              name: "Total Tickets",
              data: totalTicketsByMonth,
            },
            {
              name: "Done Tickets",
              data: doneTicketsByMonth,
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic
          chartSeries={[
            totalTickets,
            totalOpenTickets,
            totalInProgressTickets,
            totalForwardedTickets,
            totalCloseTickets,
            totalCompletedTickets,
          ]}
          labels={[
            "Total Tickets",
            "To Do",
            "In Progress",
            "Forwarded",
            "Close",
            "Done",
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={[
            {
              id: "PRD-005",
              name: "Soja & Co. Eucalyptus",
              image: "/assets/product-5.png",
              updatedAt: dayjs()
                .subtract(18, "minutes")
                .subtract(5, "hour")
                .toDate(),
            },
            {
              id: "PRD-004",
              name: "Necessaire Body Lotion",
              image: "/assets/product-4.png",
              updatedAt: dayjs()
                .subtract(41, "minutes")
                .subtract(3, "hour")
                .toDate(),
            },
            {
              id: "PRD-003",
              name: "Ritual of Sakura",
              image: "/assets/product-3.png",
              updatedAt: dayjs()
                .subtract(5, "minutes")
                .subtract(3, "hour")
                .toDate(),
            },
            {
              id: "PRD-002",
              name: "Lancome Rouge",
              image: "/assets/product-2.png",
              updatedAt: dayjs()
                .subtract(23, "minutes")
                .subtract(2, "hour")
                .toDate(),
            },
            {
              id: "PRD-001",
              name: "Erbology Aloe Vera",
              image: "/assets/product-1.png",
              updatedAt: dayjs().subtract(10, "minutes").toDate(),
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestOrders sx={{ height: "100%" }} />
      </Grid>
    </Grid>
  );
}

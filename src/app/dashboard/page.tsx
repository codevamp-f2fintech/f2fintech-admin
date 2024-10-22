import * as React from "react";
import type { Metadata } from "next";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";

import { config } from "@/app/config";
import { Budget } from "@/app/components/dashboard/overview/budget";
import { LatestOrders } from "@/app/components/dashboard/overview/latest-orders";
import { LatestProducts } from "@/app/components/dashboard/overview/latest-products";
import { Sales } from "@/app/components/dashboard/overview/sales";
import { Traffic } from "@/app/components/dashboard/overview/traffic";

export const metadata = {
  title: `Overview | Dashboard | ${config.site.name}`,
} satisfies Metadata;

// Server-side function to fetch total applications count
async function fetchTotalApplications() {
  try {
    const response = await fetch(
      "http://localhost:3001/api/v1/application/count"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resData = await response.json();
    return resData.data; // Assuming the response has a 'data' field
  } catch (error) {
    console.error("Failed to fetch total applications:", error);
    return null;
  }
}

async function fetchTotalTickets(status: string | null = null): Promise<number> {
  let url = `http://localhost:3001/api/v1/dashboard/tickets/count`;
  if (status) {
    url += `/${status}`;
  }
  console.log(url, 'ticket count url')
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch total Tickets");
  }
  const resData = await response.json();
  console.log(resData, 'ticket count')
  return resData.data; // Assuming the response has a 'count' field
}

async function fetchAgentCount(): Promise<number> {
  const response = await fetch(
    "http://localhost:3001/api/v1/dashboard/agents/count",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch agent count");
  }
  const resData = await response.json();
  return resData.data;
}

export default async function Page(): Promise<React.JSX.Element> {
  const totalApplications = await fetchTotalApplications();
  const totalTickets = await fetchTotalTickets();
  const totalOpenTickets = await fetchTotalTickets("to do");
  const totalInProgressTickets = await fetchTotalTickets("in progress");
  const totalForwardedTickets = await fetchTotalTickets("forwarded");
  const totalCloseTickets = await fetchTotalTickets("close");
  const totalCompletedTickets = await fetchTotalTickets("done");
  const totalAgents = await fetchAgentCount();

  const dashboardItems = [
    {
      label: "Total Applications",
      key: "totalApplications",
      color: "#2196f3",
      count: totalApplications,
    },
    {
      label: "Total Tickets",
      key: "totalTickets",
      color: "#ff6e40",
      count: totalTickets,
    },
    {
      label: "Open Tickets",
      key: "openTickets",
      color: "#ab47bc",
      count: totalOpenTickets,
    },
    {
      label: "In Progress",
      key: "inProgress",
      color: "#4db6ac",
      count: totalInProgressTickets,
    },
    {
      label: "Forwarded Tickets",
      key: "forwardedTickets",
      color: "#cddc39",
      count: totalForwardedTickets,
    },
    {
      label: "Closed Tickets",
      key: "closedTickets",
      color: "#4caf50",
      count: totalCloseTickets,
    },
    {
      label: "Completed Tickets",
      key: "completedTickets",
      color: "#d32f2f",
      count: totalCompletedTickets,
    },
    {
      label: "Total Agents",
      key: "totalAgents",
      color: "#607d8b",
      count: totalAgents,
    },
  ];

  return (
    <Grid container spacing={3}>
      {dashboardItems.map((item, index) => (
        <Grid lg={3} sm={6} xs={12} key={index}>
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
        </Grid>
      ))}
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            {
              name: "This year",
              data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
            },
            {
              name: "Last year",
              data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic
          chartSeries={[63, 15, 22]}
          labels={["Desktop", "Tablet", "Phone"]}
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
        <LatestOrders
          orders={[
            {
              id: "ORD-007",
              customer: { name: "Ekaterina Tankova" },
              amount: 30.5,
              status: "pending",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
            {
              id: "ORD-006",
              customer: { name: "Cao Yu" },
              amount: 25.1,
              status: "delivered",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
            {
              id: "ORD-004",
              customer: { name: "Alexa Richardson" },
              amount: 10.99,
              status: "refunded",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
            {
              id: "ORD-003",
              customer: { name: "Anje Keizer" },
              amount: 96.43,
              status: "pending",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
            {
              id: "ORD-002",
              customer: { name: "Clarke Gillebert" },
              amount: 32.54,
              status: "delivered",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
            {
              id: "ORD-001",
              customer: { name: "Adam Denisov" },
              amount: 16.76,
              status: "delivered",
              createdAt: dayjs().subtract(10, "minutes").toDate(),
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Grid>
    </Grid>
  );
}

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/app/components/core/chart";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { fetcher } from "@/apis/apiClient";

export interface SalesProps {
  chartSeries?: { name: string; data: number }[];
  sx?: SxProps;
}

export function Sales({ chartSeries: initialChartSeries, sx }: SalesProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = useState<{ name: string; data: number }[]>(
    initialChartSeries || [
      { name: "This year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: "Last year", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ]
  );
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const chartOptions = useChartOptions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const safeChartSeries = (chartSeries || []).map((item: any) => ({
    name: item?.name || "",
    data: (item?.data || []).map((val: any) => (typeof val === "number" && !isNaN(val) ? val : 0)),
  }));

  // Initialize company from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCompanyId = localStorage.getItem("selectedCompanyId");
      if (savedCompanyId) {
        setSelectedCompany(savedCompanyId);
        fetchTicketCounts(savedCompanyId);
      } else {
        // Fetch without company filter initially
        fetchTicketCounts("");
      }
    }
  }, []);

  // Listen for company change events
  useEffect(() => {
    const handleCompanyChange = (event: any) => {
      const newCompanyId = event.detail;
      setSelectedCompany(newCompanyId);

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedCompanyId", newCompanyId);
      }

      // Fetch data for new company
      fetchTicketCounts(newCompanyId);
    };

    window.addEventListener("companyChanged", handleCompanyChange);

    // Also listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCompanyId") {
        const newCompanyId = e.newValue || "";
        setSelectedCompany(newCompanyId);
        fetchTicketCounts(newCompanyId);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("companyChanged", handleCompanyChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch ticket counts by month
  const fetchTicketCounts = async (companyId: string) => {
    setLoading(true);
    try {
      // Option 1: Use your existing tickets endpoint with aggregation
      let endpoint = "get-all-tickets";
      if (companyId) {
        endpoint += `?companyId=${companyId}`;
      }

      const response = await fetcher<any>(endpoint);

      if (response?.data?.results) {
        const tickets = response.data.results;
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearData = Array(12).fill(0);
        const lastYearData = Array(12).fill(0);

        // Group tickets by month and year
        tickets.forEach((ticket: any) => {
          if (ticket.createdAt) {
            const date = new Date(ticket.createdAt);
            const month = date.getMonth(); // 0-11
            const year = date.getFullYear();

            if (year === currentYear) {
              currentYearData[month] = (currentYearData[month] || 0) + 1;
            } else if (year === lastYear) {
              lastYearData[month] = (lastYearData[month] || 0) + 1;
            }
          }
        });

        setChartSeries([
          { name: `Tickets - ${currentYear}`, data: currentYearData },
          { name: `Tickets - ${lastYear}`, data: lastYearData },
        ]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Card sx={{ display: "flex", flexDirection: "column", height: "100%", ...sx }}>
        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", height: "350px" }}>
          <Typography color="text.secondary">Loading chart...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%", ...sx }}>
      <CardContent
        sx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          p: { xs: 1.5, sm: 3 },
          "&:last-child": { pb: { xs: 1.5, sm: 3 } },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              color: "#1a237e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            MONTHLY DISBURSED TICKETS OVERVIEW
          </Typography>
        </Box>

        {/* Chart Section */}
        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: { xs: 300, sm: 350 },
            position: "relative",
            width: "100%",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Typography color="text.secondary">Loading ticket data...</Typography>
            </Box>
          ) : (
            <Chart
              options={chartOptions}
              series={safeChartSeries}
              type="bar"
              width="100%"
              height="100%"
            />
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* Footer Legend */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          height: isMobile ? "6vh" : isTab ? "5vh" : "8vh",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: (theme) => theme.palette.primary.main,
              borderRadius: "2px",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Current Year Tickets
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25),
              borderRadius: "2px",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Previous Year Tickets
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

function useChartOptions(): ApexOptions {
    const theme = useTheme();

    return {
      chart: {
        background: "transparent",
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: [
        theme.palette.primary.main,
        alpha(theme.palette.primary.main, 0.25),
      ],
      dataLabels: { enabled: false },
      fill: { opacity: 1, type: "solid" },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 2,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: { show: false },
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 4,
        },
      },
      stroke: { colors: ["transparent"], show: true, width: 2 },
      theme: { mode: theme.palette.mode },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        labels: {
          offsetY: 5,
          style: {
            colors: theme.palette.text.secondary,
            fontSize: '11px'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value) => value.toFixed(0),
          offsetX: -10,
          style: {
            colors: theme.palette.text.secondary,
            fontSize: '11px'
          },
        },
        title: {
          text: "Ticket Count",
          style: { color: theme.palette.text.secondary }
        },
        min: 0,
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: theme.palette.mode,
        y: {
          formatter: (value) => `${value} tickets`,
        },
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: {
              height: 300,
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: '10px'
                }
              }
            }
          }
        }
      ]
    };
  }
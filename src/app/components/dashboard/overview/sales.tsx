"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/app/components/core/chart";
import { Box, Typography, useMediaQuery } from "@mui/material";

export interface SalesProps {
  chartSeries: { name: string; data: number[] }[];
  sx?: SxProps;
}

export function Sales ( { chartSeries, sx }: SalesProps ): React.JSX.Element {
  const chartOptions = useChartOptions();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );

  return (
    <Card
      sx={{
        height: isTab ? "45vh" : isMobile ? "75vh" : "90vh",
        width: "100%"
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: isMobile ? "8vh" : isTab ? "5vh" : "12vh",
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
            ml: "1vw",
          }}
        >
          Tickets Overview
        </Typography>
      </Box>
      <Divider />
      <CardContent sx={{ mt: isTab ? "8vh" : "14vh" }}>
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </CardContent>
      <Divider />
    </Card>
  );
}

function useChartOptions (): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      alpha( theme.palette.primary.main, 0.25 ),
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
    plotOptions: { bar: { columnWidth: "40px" } },
    stroke: { colors: [ "transparent" ], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: { offsetY: 5, style: { colors: "red " } },
    },
    yaxis: {
      labels: {
        formatter: ( value ) => `${ value }`,
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
}

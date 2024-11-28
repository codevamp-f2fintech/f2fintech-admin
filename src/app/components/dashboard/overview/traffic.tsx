"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/app/components/core/chart";
import { Box, Divider } from "@mui/material";

export interface TrafficProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function Traffic({
  chartSeries,
  labels,
  sx,
}: TrafficProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      {/* <CardHeader title="Tickets" /> */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: "12vh",
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
            ml: "2vw",
          }}
        >
          Tickets
        </Typography>
      </Box>
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Chart
            height={300}
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="100%"
          />
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              rowGap: 2,
              columnGap: 3,
            }}
          >
            {chartSeries.map((item, index) => (
              <Stack
                key={labels[index]}
                spacing={1}
                sx={{ alignItems: "center", minWidth: "80px" }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {labels[index]}
                </Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: "transparent" },
    colors: [
      theme.palette.primary.main,
      theme.palette.warning.main,
      "#26C6DA",
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.success.main,
    ],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: {
      active: { filter: { type: "none" } },
      hover: { filter: { type: "none" } },
    },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}

"use client";

import * as React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/app/components/core/chart";
import { Box, Divider, useMediaQuery } from "@mui/material";

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
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  return (
    <Card
      sx={{
        width: "100%",
        height: isMobile ? "75vh" : isTab ? "44.5vh" : "90vh",
      }}
    >
      {/* <CardHeader title="Tickets" /> */}
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
          Tickets
        </Typography>
      </Box>
      <Divider />
      <CardContent sx={{ height: "89vh" }}>
        <Stack>
          <Chart
            height={260}
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="100%"
            sx={{
              transition: "color 0.3s ease, transform 0.3s ease", // smooth transition for color and transform
              "&:hover": {
                color: "red", // color changes to green on hover
                transform: "scale(1.1)", // scale up the text a little on hover
              },
            }}
          />
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "2vh",
            }}
          >
            {chartSeries.map((item, index) => (
              <Stack
                key={labels[index]}
                sx={{
                  alignItems: "center",
                  width: "100px",
                  height: "80px",
                  transition: "color 0.3s ease, transform 0.3s ease",
                  "&:hover": {
                    color: "black",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    height: "10vh",
                    color: "red",
                  }}
                >
                  {labels[index]}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    height: "5vh",
                    marginBottom: "2vh",
                    color: "black",
                    fontSize: "1rem",
                    transition: "color 0.3s ease, transform 0.3s ease",
                    "&:hover": {
                      color: "black",
                      transform: "scale(1.8)",
                    },
                  }}
                >
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
    colors: ["#009688", "#ff9800", "#f44336", "#4caf50", "#00bcd4", "#8bc34a"],
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

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

  function capitalizeFirstWord(text: string): string {
    const words = text.split(" ");
    if (words.length > 0) {
      words[0] =
        words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    }
    return words.join(" ");
  }

  return (
    <Card
      sx={{
        width: "100%",
        height: isMobile ? "75vh" : isTab ? "44.5vh" : "90vh",
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
          Tickets
        </Typography>
      </Box>
      <Divider />
      <CardContent sx={{ height: "77vh" }}>
        <Stack sx={{ display: "flex" }}>
          <Chart
            height={260}
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width="100%"
            sx={{
              transition: "color 0.3s ease, transform 0.3s ease",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
              },
            }}
          />
          <Stack
            direction="row"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              padding: "1vh",
              height: "34vh",
              // border: "2px solid gray",
              borderRadius: "20px",
            }}
          >
            {chartSeries.map((item, index) => {
              const colors = [
                "#009688",
                "#ff9800",
                "#2196f3",
                "#f44336",
                "#4caf50",
                "#00bcd4",
                "#8bc34a",
                "#9c27b0",
                "#3f51b5",
                "#ff5722",
              ];
              const color = colors[index % colors.length];

              return (
                <Stack
                  key={labels[index]}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "10vw",
                    height: "5vh",
                    transition: "color 0.3s ease, transform 0.3s ease",
                    "&:hover": {
                      color: "black",
                      transform: "scale(.9)",
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
                      color: color,
                    }}
                  >
                    {capitalizeFirstWord(labels[index])}
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
              );
            })}
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
      "#009688",
      "#ff9800",
      "#2196f3",
      "#f44336",
      "#4caf50",
      "#00bcd4",
      "#8bc34a",
      "#9c27b0",
      "#3f51b5",
      "#ff5722",
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

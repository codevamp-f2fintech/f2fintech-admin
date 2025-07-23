"use client";

import * as React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Box, Divider, TextField, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";
import { Chart } from "@/app/components/core/chart";

import { Utility } from "@/utils";

export interface TrafficProps {
  chartSeries: number[];
  labels: string[];
  date?: string;
  setDate?: () => {};
}

export function Traffic({
  chartSeries,
  labels,
  date,
  setDate,
}: TrafficProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);
  const { capitalizeFirstLetter } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  return (
    <Card
      sx={{
        width: "100%",
        height: {
          xs: "auto", // Mobile - auto height
          sm: "auto", // Tablet - auto height
          md: "90vh", // Desktop - unchanged (your original value)
        },
        minHeight: {
          xs: "75vh", // Mobile min-height
          sm: "44.5vh", // Tablet min-height
          md: "none", // Desktop - no min-height (original behavior)
        },
      }}
    >
      {/* Header (Only adjust mobile/tablet) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: {
            xs: "8vh", // Mobile
            sm: "5vh", // Tablet
            md: "12vh", // Desktop - unchanged
          },
          // Keep desktop margins intact
          ml: { xs: "2vw", sm: "1.5vw", md: "1vw" },
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
            ml: "1vw", // Desktop unchanged
            fontSize: {
              xs: "1.1rem", // Mobile
              sm: "1.3rem", // Tablet
              md: "inherit", // Desktop - original size
            },
          }}
        >
          Tickets
        </Typography>
      </Box>
      <Divider /> {/* Unchanged */}
      {/* Card Content (Only adjust mobile/tablet) */}
      <CardContent
        sx={{
          height: {
            xs: "auto", // Mobile - flexible height
            sm: "auto", // Tablet - flexible height
            md: "77vh", // Desktop - unchanged
          },
          p: { xs: 1, sm: 1.5, md: "inherit" }, // Padding tweaks only for mobile/tablet
        }}
      >
        <Stack sx={{ height: "100%" }}>
          {/* Chart (Only adjust mobile/tablet height) */}
          <Box
            sx={{
              height: {
                xs: "30vh", // Mobile
                sm: "25vh", // Tablet
                md: "200px", // Desktop - unchanged
              },
            }}
          >
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              width="100%"
              sx={{
                transition: "color 0.3s ease, transform 0.3s ease",
                "&:hover": {
                  color: "red",
                  transform: "scale(1.1)", // Original desktop effect
                },
              }}
            />
          </Box>

          {/* Labels Grid (Only adjust mobile/tablet) */}
          <Stack
            direction="row" // Desktop unchanged
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              height: {
                xs: "auto", // Mobile - flexible height
                sm: "38vh", // Tablet
                md: "38vh", // Desktop - unchanged
              },
              gap: { xs: "8px", sm: "12px", md: "inherit" }, // Mobile/tablet gap only
            }}
          >
            {chartSeries.map((item, index) => {
              const colors = [
                "#009688",
                "#827717",
                "#2196f3",
                "#f44336",
                "#ffcc80",
                "#ff9800",
                "#3f51b5",
                "#aed581",
                "#64dd17",
                "#90a4ae",
              ];
              const color = colors[index % colors.length];

              return (
                <Stack
                  key={labels[index]}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: {
                      xs: "45%", // Mobile - 2 columns
                      sm: "30%", // Tablet - 3 columns
                      md: "10vw", // Desktop - unchanged
                    },
                    // Rest of styles remain original for desktop
                    height: "5vh",
                    transition: "color 0.3s ease, transform 0.3s ease",
                    "&:hover": {
                      color: "black",
                      transform: "scale(0.9)",
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
                      fontSize: { xs: "0.9rem", sm: "0.95rem", md: "inherit" }, // Mobile/tablet only
                    }}
                  >
                    {capitalizeFirstLetter(labels[index])}
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
                      fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" }, // Mobile/tablet only
                      "&:hover": {
                        transform: {
                          xs: "none", // Disable hover scale on mobile
                          sm: "scale(1.8)",
                        },
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
      "#827717",
      "#2196f3",
      "#f44336",
      "#ffcc80",
      "#ff9800",
      "#3f51b5",
      "#aed581",
      "#64dd17",
      "#90a4ae",
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

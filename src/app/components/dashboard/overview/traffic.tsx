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

export function Traffic ( {
  chartSeries,
  labels,
  date,
  setDate,
}: TrafficProps ): React.JSX.Element {
  const chartOptions = useChartOptions( labels );
  const { capitalizeFirstLetter } = Utility();
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );

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
          justifyContent: "space-between",
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
            height={200}
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
              gap: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 2 },
              borderRadius: "20px",
              mt: {
                xs: 13,
                sm: 0,
                md: 0,
              },
            }}
          >
            {chartSeries.map( ( item, index ) => {
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
              const color = colors[ index % colors.length ];

              return (
                <Stack
                  key={labels[ index ]}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    width: { xs: "35%", sm: "auto", md: "auto" },
                    minWidth: { xs: "120px", sm: "50px", md: "unset" },
                    mb: { xs: 0, sm: 2, md: 0 },
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(0.95)" },
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      textAlign: "center",
                      color,
                      fontSize: { xs: "0.75rem", sm: "0.85rem", md: "inherit" },
                      lineHeight: 1.2,
                    }}
                  >
                    {capitalizeFirstLetter( labels[ index ] )}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                    sx={{
                      textAlign: "center",
                      mt: 0.5,
                      fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                      color: "black",
                    }}
                  >
                    {item}
                  </Typography>
                </Stack>
              );
            } )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions ( labels: string[] ): ApexOptions {
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

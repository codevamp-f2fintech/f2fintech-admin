"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SxProps } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";

import Loader from "../../common/Loader";
import { useGetCustomerApplications } from "@/hooks/customerApplication";
import { CustomerApplicationData } from "@/types/customerApplication";

import {
  Button,
  CardActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Person } from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { ArrowRightIcon } from "@mui/x-date-pickers";

export interface Application {
  id: string;
  name: string;
  updatedAt: Date;
}

export interface LatestApplicationsProps {
  applications?: Application[];
  sx?: SxProps;
}

export function LatestApplications({
  sx,
}: LatestApplicationsProps): React.JSX.Element {
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [applications, setApplications] = useState<CustomerApplicationData>([]);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const {
    value: data,
    error: getApplicationsError,
    swrLoading,
  } = useGetCustomerApplications(`get-customer-loan-applications`, 1, 6);

  // Handle API response
  useEffect(() => {
    if (data?.results.length > 0) {
      setApplications(data?.results);
    } else {
      setApplications([]);
    }
  }, [data?.results, getApplicationsError]);

  console.log("applications>>>", applications);

  const handleViewAllClick = () => {
    router.push("/");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: isMobile ? "100%" : isTab ? "100%" : "30vw",
        maxHeight: isMobile ? "85vh" : isTab ? "100vh" : "130vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: isMobile ? "" : isTab ? "" : 3,
          height: isMobile ? "8vh" : isTab ? "5vh" : "9vh",
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
            mt: isTab ? "" : "4vh",
          }}
        >
          Latest Applications
        </Typography>
      </Box>
      <Divider />
      {/* {applications?.length && ( */}
      <TableContainer>
        <Table
          sx={{
            minHeight: isMobile ? "" : isTab ? "20vh" : "103vh",
          }}
        >
          <TableHead
            sx={{
              height: isMobile ? "8vh" : isTab ? "5vh" : "12vh",
            }}
          >
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>Sr.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Application Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!applications?.length || swrLoading || paginationLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {swrLoading || paginationLoading ? (
                    <Loader />
                  ) : (
                    "No applications found"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application, index) => (
                <TableRow
                  key={application.applicationId}
                  sx={{
                    height: "2vh",
                    "&:hover": { bgcolor: "primary.50" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell sx={{ width: isMobile ? "2vw" : isTab ? "" : "" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent: "center",
                        width: isMobile ? "30vw" : "6vw",
                      }}
                    >
                      <Person sx={{ color: "primary.main" }} />
                      {application.customerName}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        width: "8vw",
                      }}
                    >
                      <CurrencyRupeeIcon sx={{ color: "primary.main" }} />
                      {application.applicationAmount}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      overflow: isMobile ? "hidden" : "",
                      width: isMobile ? "" : isTab ? "" : "",
                    }}
                  >
                    {dayjs(application.applicationDate).format("MMM D, YYYY")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CardActions
        sx={{ justifyContent: "flex-end", mt: isTab ? "1vh" : "3vh" }}
      >
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
          onClick={handleViewAllClick}
          sx={{
            width: isMobile ? "30vw" : isTab ? "15vw" : "8vw",
            fontSize: ".9rem",
            mr: ".6vw",
            background:
              "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
          }}
        >
          View all
        </Button>
      </CardActions>
    </Paper>
  );
}

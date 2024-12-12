"use client";

import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import type { SxProps } from "@mui/material/styles";
import dayjs from "dayjs";
import { useGetCustomers } from "@/hooks/customer";
import { Customer } from "@/types/customer";
import Loader from "../../common/Loader";
import { useRouter } from "next/navigation";

import {
  Button,
  CardActions,
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
  const [applications, setApplications] = useState<Customer>([]);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const {
    value: data,
    error: getApplicationsError,
    swrLoading,
  } = useGetCustomers({} as Customer, `get-loan-applications`, 1, 6);

  // Handle API response
  useEffect(() => {
    if (data?.results) {
      setApplications(data?.results);
      // setPaginationLoading(false);
    } else if (getApplicationsError) {
      // setPaginationLoading(false);
    } else {
      setApplications([]);
      // setPaginationLoading(false);
    }
  }, [data?.results, getApplicationsError]);

  // console.log("applications>>>", applications);

  const handleViewAllClick = () => {
    router.push("/");
  };

  return (
    <Card
      sx={{
        width: isMobile ? "100%" : isTab ? "100%" : "30vw",
        maxHeight: isMobile ? "77vh" : isTab ? "48vh" : "105vh",
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
        <Table>
          <TableHead sx={{ height: isMobile ? "8vh" : isTab ? "5vh" : "12vh" }}>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell align="center">Sr.</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Amount</TableCell>
              <TableCell align="center">Application Date</TableCell>
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
                  key={application.id}
                  sx={{
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
                        width: isMobile ? "30vw" : "6vw",
                        overflow: isMobile ? "hidden" : "", // Prevents content from overflowing
                      }}
                    >
                      <Person sx={{ color: "primary.main" }} />
                      {application.Name}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isMobile ? "40vw" : "",
                      overflow: isMobile ? "hidden" : "",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "8vw",
                      }}
                    >
                      <CurrencyRupeeIcon sx={{ color: "primary.main" }} />
                      {application.Amount}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ overflow: isMobile ? "hidden" : "" }}>
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
    </Card>
  );
}

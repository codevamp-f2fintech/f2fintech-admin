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
    <Card sx={{ width: "30vw", height: "100vh", p: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "11vh",
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
          Latest Applications
        </Typography>
      </Box>
      <Divider />
      {/* {applications?.length && ( */}
      <TableContainer>
        <Table>
          <TableHead sx={{ height: "12vh" }}>
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
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "6vw",
                      }}
                    >
                      <Person sx={{ color: "primary.main" }} />
                      {application.Name}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "8vw",
                        // border: "2px solid",
                      }}
                    >
                      <CurrencyRupeeIcon sx={{ color: "primary.main" }} />
                      {application.Amount}
                    </Box>
                  </TableCell>

                  <TableCell>
                    {dayjs(application.applicationDate).format("MMM D, YYYY")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <Divider /> */}
      <CardActions sx={{ justifyContent: "flex-end", mt: "3vh" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
          onClick={handleViewAllClick}
          sx={{
            width: "8vw",
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

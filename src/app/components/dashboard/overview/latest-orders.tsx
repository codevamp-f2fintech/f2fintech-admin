"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Divider,
  CardActions,
  Button,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Email,
  ConfirmationNumber,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";

import dayjs from "dayjs";
import { useGetUsers } from "@/hooks/user";
import { useGetTickets } from "@/hooks/ticket";
import type { SxProps } from "@mui/material/styles";
import { Utility } from "@/utils";
import { ArrowRightIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/navigation";
import { User, UserData } from "@/types/user";

export interface LatestUsersProps {
  sx?: SxProps;
}

export function LatestOrders({ sx }: LatestUsersProps): React.JSX.Element {
  const { value: users, swrLoading: usersLoading } = useGetUsers(
    {} as User,
    "get-users",
    1,
    6
  );

  // Fetch only tickets for the current month to avoid loading 500 records
  const currentMonthStart = dayjs().startOf("month").format("YYYY-MM-DD");
  const currentMonthEnd = dayjs().endOf("month").format("YYYY-MM-DD");

  const { value: tickets, swrLoading: ticketsLoading } = useGetTickets(
    `get-all-tickets`,
    1,
    1000,
    "",
    currentMonthStart,
    currentMonthEnd
  );

  const router = useRouter();
  const { capitalizeFirstLetter, decodedToken } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  // decodedToken is a function — must be called to get the payload
  const role = decodedToken()?.role;
  const canViewAllUsers = role === "admin" || role === "super admin";

  const getTicketCounts = (userId: string | number) => {
    if (!tickets?.results) return { done: 0 };
    const userTickets = tickets.results.filter(
      (ticket) => ticket.user_id == userId
    );
    return {
      done: userTickets.filter(
        (ticket) => ticket.ticketStatus.toLowerCase() === "disbursed"
      ).length,
    };
  };

  const handleViewAllClick = () => {
    router.push("/users");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor: "#fff",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
        width: { xs: "100%", sm: "95vw", md: "100%" }, // Responsive width
        maxHeight: { xs: "92vh", sm: "100vh", md: "130vh" }, // Responsive max-height
        mx: "auto", // Center on mobile
        overflow: "hidden", // Prevent content overflow
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: { md: 3 }, // Desktop margin-bottom
          height: { xs: "8vh", sm: "5vh", md: "9vh" }, // Responsive height
          mt: { md: "4vh" }, // Desktop margin-top
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
            ml: { xs: "3vw", sm: "1vw" }, // Responsive left margin
            fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" }, // Responsive font
          }}
        >
          Agent List
        </Typography>
      </Box>

      <Divider />

      {/* Table Container */}
      <Box
        sx={{
          height: { xs: "65vh", sm: "34.5vh", md: "103vh" }, // Responsive height
          overflow: "auto", // Enable scroll
          flex: 1, // Take remaining space
        }}
      >
        <TableContainer>
          <Table
            sx={{
              minHeight: "auto",
              maxHeight:
                users?.data?.results?.length <= 1
                  ? "fit-content"
                  : { xs: "65vh", sm: "34.5vh", md: "103vh" },
            }}
          >
            {/* Table Header */}
            <TableHead
              sx={{
                height: { xs: "8vh", sm: "5vh", md: "12vh" }, // Responsive height
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }}
            >
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Sr.</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Username
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Email
                </TableCell>
                <Tooltip
                  title={`Disbursed tickets count for ${dayjs().format("MMMM YYYY")} (current month)`}
                  placement="top"
                  arrow
                >
                  <TableCell align="center" sx={{ fontWeight: 600, cursor: "help" }}>
                    Disbursed
                  </TableCell>
                </Tooltip>
                <TableCell sx={{ fontWeight: 600 }}>Joined On</TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {usersLoading || ticketsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ height: { xs: "60vh", sm: "30vh", md: "90vh" } }}
                  >
                    No Users Found
                  </TableCell>
                </TableRow>
              ) : (
                users?.data?.results?.map((agent: UserData, index: number) => {
                  const { done } = getTicketCounts(agent.id);

                  return (
                    <TableRow
                      key={agent.id}
                      sx={{
                        height: { xs: "12vh", sm: "10vh", md: "15vh" }, // Responsive row height
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
                            minWidth: { xs: "120px", sm: "auto" }, // Prevent squeezing
                          }}
                        >
                          <Person
                            sx={{
                              color: "primary.main",
                              fontSize: { xs: "1rem", sm: "1.2rem" },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                                md: "1rem",
                              },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {capitalizeFirstLetter(agent.username)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: { xs: "150px", sm: "auto" },
                          }}
                        >
                          <Email
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "1rem", sm: "1.2rem" },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                                md: "1rem",
                              },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {agent.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircle
                            sx={{
                              color: "success.main",
                              fontSize: { xs: "1rem", sm: "1.2rem" },
                            }}
                          />
                          <Typography sx={{ ml: 1 }}>{done}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        }}
                      >
                        {dayjs(agent.created_at).format("MMM D, YYYY")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer Button */}
      {canViewAllUsers && (
        <Box
          sx={{
            height: { xs: "8vh", sm: "5vh", md: "9vh" },
            mb: { xs: "1vh", sm: 0 },
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            p: { xs: 1, sm: 2 },
          }}
        >
          <Button
            color="inherit"
            endIcon={<ArrowRightIcon />}
            size="small"
            variant="text"
            onClick={handleViewAllClick}
            sx={{
              width: { xs: "140px", sm: "15vw", md: "8vw" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              mr: "1vw",
              bgcolor: "#0c66e4",
              color: "white",
              "&:hover": {
                bgcolor: "#0c66e4",
                color: "white",
              },
              whiteSpace: "nowrap",
              mt: {
                xs: 3,
                md: 0,
                sm: 0,
                lg: 0,
              },
            }}
          >
            View all
          </Button>
        </Box>
      )}
    </Paper>
  );
}

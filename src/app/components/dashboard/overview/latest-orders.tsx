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

export function LatestOrders ( { sx }: LatestUsersProps ): React.JSX.Element {
  const { value: users, swrLoading: usersLoading } = useGetUsers(
    {} as User,
    "get-users",
    1,
    6
  );
  const { value: tickets, swrLoading: ticketsLoading } = useGetTickets(`get-all-tickets`, 1, 500);

  const router = useRouter();
  const { capitalizeFirstLetter } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const getTicketCounts = (userId: string | number) => {
    if (!tickets?.results) return { open: 0, inProgress: 0, done: 0 };
    const userTickets = tickets.results.filter(
      (ticket) => ticket.user_id == userId
    );
    return {
      open: userTickets.filter(
        (ticket) => ticket.ticketStatus.toLowerCase() === "relook"
      ).length,
      inProgress: userTickets.filter(
        (ticket) => ticket.ticketStatus.toLowerCase() === "to be login"
      ).length,
      done: userTickets.filter(
        (ticket) => ticket.ticketStatus.toLowerCase() === "to be disbursed"
      ).length,
    };
  };

  const handleViewAllClick = () => {
    router.push( "/users" );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor: "#fff",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
        width: isMobile ? "100%" : isTab ? "95vw" : "92.5%",
        ml: isMobile ? "" : isTab ? "" : "7.5%",
        maxHeight: isMobile ? "92vh" : isTab ? "100vh" : "130vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: isMobile ? "" : isTab ? "" : 3,
          height: isMobile ? "5vh" : isTab ? "5vh" : "9vh",
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
            ml: isMobile ? "3vw" : "1vw",
            mt: isTab ? "" : "4vh",
          }}
        >
          Agent List
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ height: isTab ? "34.5vh" : "103vh" }}>
        <TableContainer sx={{ width: "100%" }}>
          <Table
            sx={{
              minHeight: "auto",
              maxHeight:
                users?.data?.results?.length <= 1
                  ? "fit-content"
                  : isMobile
                    ? "85vh"
                    : isTab
                      ? "100vh"
                      : "103vh",
            }}
          >
            <TableHead
              sx={{
                height: isMobile ? "5vh" : isTab ? "5vh" : "12vh",
              }}
            >
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>Sr.</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Relook</TableCell>
                <TableCell align="center">In Progress</TableCell>
                <TableCell align="center">Disbursed</TableCell>
                <TableCell sortDirection="desc">Joined On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersLoading || ticketsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ height: isTab ? "34.5vh" : "90vh" }}
                  >
                    No Users Found
                  </TableCell>
                </TableRow>
              ) : (
                users.data.results.map((agent: UserData, index: number) => {
                  const { open, inProgress, done } = getTicketCounts(agent.id);

                  return (
                    <TableRow
                      key={agent.id}
                      sx={{
                        height: "15vh",
                        "&:hover": { bgcolor: "primary.50" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell
                        sx={{ width: isMobile ? "2vw" : isTab ? "" : "" }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: isMobile ? "30vw" : "6vw",
                          }}
                        >
                          <Person sx={{ color: "primary.main" }} />
                          {capitalizeFirstLetter( agent.username )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Email sx={{ color: "text.secondary" }} />
                          {agent.email}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <ConfirmationNumber sx={{ color: "warning.main" }} />
                          {open}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Refresh sx={{ color: "primary.main" }} />
                          {inProgress}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <CheckCircle sx={{ color: "success.main" }} />
                          {done}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {dayjs( agent.created_at ).format( "MMM D, YYYY" )}
                      </TableCell>
                    </TableRow>
                  );
                } )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* <Divider /> */}
      <Box
        sx={{
          height: isMobile ? "8vh" : isTab ? "5vh" : "9vh",
          mb: isMobile ? "1vh" : "",
        }}
      >
        <CardActions sx={{ justifyContent: "flex-end", mt: "3vh" }}>
          <Button
            color="inherit"
            endIcon={<ArrowRightIcon />}
            size="small"
            variant="text"
            onClick={handleViewAllClick}
            sx={{
              width: isMobile ? "30vw" : isTab ? "15vw" : "8vw",
              fontSize: ".9rem",
              mr: "1vw",
              bgcolor: "#f06292",
              color: "white",
              "&:hover": {
                bgcolor: "#9D50BB",
                color: "white",
              },
            }}
          >
            View all
          </Button>
        </CardActions>
      </Box>
    </Paper>
  );
}

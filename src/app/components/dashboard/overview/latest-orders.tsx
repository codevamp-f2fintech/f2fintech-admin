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
  InputAdornment,
  TextField,
  Typography,
  Box,
  Divider,
  CardActions,
  Button,
} from "@mui/material";
import {
  Person,
  Email,
  ConfirmationNumber,
  Refresh,
  CheckCircle,
  Search,
} from "@mui/icons-material";

import dayjs from "dayjs";
import { useGetUsers } from "@/hooks/user";
import { useGetTickets } from "@/hooks/ticket";
import type { SxProps } from "@mui/material/styles";
import { Utility } from "@/utils";
import { ArrowRightIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/navigation";

export interface LatestUsersProps {
  sx?: SxProps;
}

export function LatestOrders({ sx }: LatestUsersProps): React.JSX.Element {
  const { value: users, swrLoading: usersLoading } = useGetUsers(
    {},
    "get-users",
    1,
    1000
  );
  const { value: tickets } = useGetTickets([], `get-all-tickets`);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { capitalizeFirstLetter } = Utility();
  const router = useRouter();

  const getTicketCounts = (userId: string) => {
    if (!tickets?.data) return { open: 0, inProgress: 0, done: 0 };

    const userTickets = tickets.data.filter(
      (ticket) => ticket.user_id === userId
    );

    return {
      open: userTickets.filter(
        (ticket) => ticket.status.toLowerCase() === "open"
      ).length,
      inProgress: userTickets.filter(
        (ticket) => ticket.status.toLowerCase() === "in progress"
      ).length,
      done: userTickets.filter(
        (ticket) => ticket.status.toLowerCase() === "done"
      ).length,
    };
  };

  const filteredUsers = users?.results
    ?.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 6); // Take only the 6 latest users

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(event.target.value);
  // };

  const handleViewAllClick = () => {
    router.push("/user");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor: "#fff",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
        width: "49.3vw",
        ml: "4vw",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 3,
          height: "9vh",
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
            mt: "4vh",
          }}
        >
          Agent List
        </Typography>
      </Box>
      <Divider />

      <TableContainer>
        <Table>
          <TableHead sx={{ height: "12vh" }}>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>Sr.</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Open Tickets</TableCell>
              <TableCell align="center">In Progress</TableCell>
              <TableCell align="center">Done Tickets</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!filteredUsers?.length || usersLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((agent, index) => {
                const { open, inProgress, done } = getTicketCounts(agent.id);

                return (
                  <TableRow
                    key={agent.id}
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
                        }}
                      >
                        <Person sx={{ color: "primary.main" }} />
                        {capitalizeFirstLetter(agent.username)}
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
                      {dayjs(agent.created_at).format("MMM D, YYYY")}
                    </TableCell>
                  </TableRow>
                );
              })
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
            mr: "1vw",
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

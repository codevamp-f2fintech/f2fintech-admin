"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import { useGetUsers } from "@/hooks/user";
import { useGetTickets } from "@/hooks/ticket";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import type { SxProps } from "@mui/material/styles";

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export interface LatestUsersProps {
  sx?: SxProps;
}

export function LatestOrders({ sx }: LatestUsersProps): React.JSX.Element {
  const { data: users, swrLoading: usersLoading } = useGetUsers(
    [],
    `get-users?_page=0&_limit=500000` // Fetch more users for pagination
  );
  const { value: tickets, swrLoading: ticketsLoading } = useGetTickets(
    [],
    `get-all-tickets`
  );

  const [currentPage, setCurrentPage] = React.useState(1);
  const [usersPerPage] = React.useState(6);
  const [searchQuery, setSearchQuery] = React.useState("");

  const getTicketCounts = (userId: string) => {
    console.log("tickeect data>>", tickets, userId);
    if (!tickets?.data) return { open: 0, inProgress: 0, done: 0 };

    const userTickets = tickets.data.filter(
      (ticket) => ticket.user_id === userId
    );

    console.log("usert", userTickets);
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

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const filteredUsers = users?.data?.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <Card sx={sx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <CardHeader title="Agent List" />

        <TextField
          label="Search by name"
          variant="filled"
          autoComplete="off"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            maxWidth: { xs: "90%", sm: "60%", md: "20%" },
            bgcolor: "white",
            borderRadius: "20px",
            // width: "100%",
            "& .MuiFormLabel-root": {
              color: "black", // Label color
            },
            "& .MuiFormLabel-root.Mui-focused": {
              color: "blue", // Label color when focused
            },
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </Box>

      <Divider />

      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Open Tickets</TableCell>
              <TableCell>In Progress</TableCell>
              <TableCell>Done Tickets</TableCell>
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
              currentUsers?.map((user) => {
                const { open, inProgress, done } = getTicketCounts(user.id);

                return (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      {capitalizeFirstLetter(user.username)}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{open}</TableCell>
                    <TableCell>{inProgress}</TableCell>
                    <TableCell>{done}</TableCell>
                    <TableCell>
                      {dayjs(user.created_at).format("MMM D, YYYY")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />

      {filteredUsers?.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / usersPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Card>
  );
}

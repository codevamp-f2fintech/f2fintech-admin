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
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Box,
  Pagination
} from '@mui/material';
import {
  Person,
  Email,
  ConfirmationNumber,
  Refresh,
  CheckCircle,
  Search,
} from '@mui/icons-material';

import dayjs from "dayjs";
import { useGetUsers } from "@/hooks/user";
import { useGetTickets } from "@/hooks/ticket";
import type { SxProps } from "@mui/material/styles";

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export interface LatestUsersProps {
  sx?: SxProps;
}

export function LatestOrders({ sx }: LatestUsersProps): React.JSX.Element {
  const { value: users, swrLoading: usersLoading } = useGetUsers(
    {},
    'get-users',
    1,
    100
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

  const filteredUsers = users?.results?.filter((user) =>
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
    <Paper
      elevation={3}
      sx={{
        p: 3,
        bgcolor: '#fff',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{
          fontWeight: 600,
          color: '#2c3e50',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Agent List
        </Typography>

        <TextField
          placeholder="Search by name"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: '#f8f9ff',
              '&:hover': {
                bgcolor: '#f0f2ff',
              }
            }
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Sr.</TableCell>
              <TableCell>Username</TableCell>
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
              currentUsers?.map((agent, index) => {
                const { open, inProgress, done } = getTicketCounts(agent.id);

                return (
                  <TableRow
                    key={agent.id}
                    sx={{
                      '&:hover': { bgcolor: 'primary.50' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: 'primary.main' }} />
                        {capitalizeFirstLetter(agent.username)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ color: 'text.secondary' }} />
                        {agent.email}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <ConfirmationNumber sx={{ color: 'warning.main' }} />
                        {open}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Refresh sx={{ color: 'primary.main' }} />
                        {inProgress}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
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
    </Paper>
  );
}

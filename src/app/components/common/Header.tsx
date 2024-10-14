"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  customerLength: number;
  notificationsCount: number;
  anchorEl: null | HTMLElement;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
  isLoggedIn: boolean;
  handleLogout: () => void;
  handleLogin: () => void;
  sortBy: string;
  handleSortChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  startDate: Dayjs | null;
  setStartDate: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  setEndDate: (date: Dayjs | null) => void;
  handleChooseMoreTickets: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  customerLength,
  notificationsCount,
  anchorEl,
  handleMenuClick,
  handleMenuClose,
  isLoggedIn,
  handleLogout,
  handleLogin,
  sortBy,
  handleSortChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleChooseMoreTickets,
}) => {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "linear-gradient(to right, #5e0ecc, #1a69fc)",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.4)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Avatar
            src="https://www.f2fintech.com/img/F2-Fintech-logoblack.png"
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#fff", flexShrink: 0 }}
          >
            Total Applications: {customerLength}
          </Typography>
        </Box>

        {/* Filter by Amount or Tenure */}
        <FormControl sx={{ width: 150, color: "white", marginRight: "-160px" }}>
          <TextField
            id="amount-tenure-filter"
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter amount/tenure"
            sx={{
              ".MuiInputBase-input": {
                color: "#fff",
                padding: "14px 14px",
                fontSize: "1rem",
              },
              ".MuiOutlinedInput-root": {
                "& fieldset": {
                  borderRadius: "4px",
                  height: 55,
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                  borderWidth: "1px",
                },
              },
              width: "100%",
              height: "auto",
            }}
          />
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Start Date Picker */}
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: 180,
                  input: { color: "white" },
                  label: { color: "white" },
                  ".MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                }}
              />
            )}
          />
          {/* End Date Picker */}
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  width: 180,
                  input: { color: "white" },
                  label: { color: "white" },
                  ".MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                }}
              />
            )}
          />

          {/* Sort By Dropdown */}
          <FormControl sx={{ minWidth: 120, color: "white" }}>
            <InputLabel id="sort-by-label" sx={{ color: "white" }}>
              Sort By Status
            </InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By Status"
              sx={{ width: 200, ".MuiSvgIcon-root": { color: "white" } }}
            >
              <MenuItem value="all">All</MenuItem>
              {[
                "To Do",
                "In Progress",
                "On Hold",
                "Forwarded",
                "Close",
                "Done",
              ].map((status) => (
                <MenuItem key={status} value={status.toLowerCase()}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Choose More Tickets Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
            href="/home"
          >
            Choose More Tickets
          </Button>

          {/* Notifications */}
          <IconButton color="inherit" onClick={handleMenuClick} sx={{ ml: 2 }}>
            <Badge badgeContent={notificationsCount} color="primary">
              <NotificationsIcon sx={{ color: "#fff" }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Header;

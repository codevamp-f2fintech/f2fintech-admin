import React, { useState } from "react";
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  SearchRounded,
  FilterListRounded,
  CalendarMonthRounded,
  PersonRounded,
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
  AccessTimeRounded,
  ForwardRounded,
  ClearRounded,
  PauseCircleOutlineRounded,
  CancelRounded,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

import DateRangeModal from "./DateRangeModal";
import { User } from "@/types/user";

interface FilterPanelProps {
  sortBy: string;
  filter: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  selectedUser: User | null;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  handleSortChange: (event: string | null) => void;
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  userData: { data: User[] };
  userRole: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  ticketCount: (status: string) => number;
  searchLabel: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  sortBy,
  filter,
  startDate,
  endDate,
  selectedUser,
  setSelectedUser,
  setFilter,
  handleSortChange,
  setStartDate,
  setEndDate,
  userData,
  userRole,
  ticketCount,
  searchLabel,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [dateModalOpen, setDateModalOpen] = useState(false); // State to control modal

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      "to do": "#ff9800",
      "in progress": "#2196f3",
      forwarded: "#9c27b0",
      done: "#4caf50",
      "on hold": "#ff5722", // Orange-red for 'on hold'
      close: "#d32f2f",
      all: "#757575",
    };
    return colors[status] || colors.all;
  };

  const getStatusIcon = (status: string): JSX.Element => {
    const icons: { [key: string]: JSX.Element } = {
      "to do": <RadioButtonUncheckedRounded sx={{ fontSize: 20 }} />,
      "in progress": <AccessTimeRounded sx={{ fontSize: 20 }} />,
      forwarded: <ForwardRounded sx={{ fontSize: 20 }} />,
      done: <CheckCircleRounded sx={{ fontSize: 20 }} />,
      "on hold": <PauseCircleOutlineRounded sx={{ fontSize: 20 }} />,
      close: <CancelRounded sx={{ fontSize: 20 }} />,
      all: <FilterListRounded sx={{ fontSize: 20 }} />,
    };
    return icons[status] || icons.all;
  };

  // Handler for opening the modal
  const handleDateModalOpen = () => setDateModalOpen(true);

  // Format the date range to be displayed on the chip
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${dayjs(startDate).format("MM/DD/YYYY")} - ${dayjs(
        endDate
      ).format("MM/DD/YYYY")}`;
    } else if (startDate) {
      return `From ${dayjs(startDate).format("MM/DD/YYYY")}`;
    } else if (endDate) {
      return `Until ${dayjs(endDate).format("MM/DD/YYYY")}`;
    } else {
      return "Select Dates";
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #fff 0%, #f5f5f5 100%)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Search and Filters Row */}
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <TextField
          size="small"
          placeholder={searchLabel}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded color="action" sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: filter && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setFilter("")}>
                  <ClearRounded sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filter */}
        <Tooltip title="Filter by Status">
          <Chip
            icon={getStatusIcon(sortBy)}
            label={`${
              sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
            } (${ticketCount(sortBy)})`}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              backgroundColor: getStatusColor(sortBy),
              color: "#fff",
              "&:hover": { opacity: 0.9 },
              fontWeight: 500,
              "& .MuiChip-icon": {
                color: "inherit", // Make icon color match text color
              },
            }}
          />
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
            },
          }}
        >
          {[
            "all",
            "to do",
            "in progress",
            "on hold",
            "forwarded",
            "done",
            "close",
          ].map((status) => (
            <MenuItem
              key={status}
              onClick={() => {
                handleSortChange(status);
                setAnchorEl(null);
              }}
              sx={{
                gap: 1,
                minWidth: 180,
                color: getStatusColor(status),
                "&:hover": {
                  backgroundColor: `${getStatusColor(status)}10`,
                },
                "&.Mui-selected": {
                  backgroundColor: `${getStatusColor(status)}20`,
                },
              }}
            >
              {getStatusIcon(status)}
              {`${
                status.charAt(0).toUpperCase() + status.slice(1)
              } (${ticketCount(status)})`}
            </MenuItem>
          ))}
        </Menu>

        {/* Date Range */}
        <Tooltip title="Select Dates">
          <Chip
            icon={<CalendarMonthRounded sx={{ fontSize: 20 }} />}
            label={formatDateRange()}
            onClick={handleDateModalOpen}
            sx={{
              backgroundColor: startDate ? "#1976d2" : "#e0e0e0",
              color: startDate ? "#fff" : "inherit",
              "&:hover": { opacity: 0.9 },
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Tooltip>

        {/* User Filter - Only visible for Admin */}
        {userRole === "admin" && (
          <Tooltip title="Select User">
            <Chip
              icon={<PersonRounded sx={{ fontSize: 20 }} />}
              label={selectedUser?.username || "Select User"}
              onClick={(e) => setUserAnchorEl(e.currentTarget)}
              sx={{
                backgroundColor: selectedUser ? "#9c27b0" : "#e0e0e0",
                color: selectedUser ? "#fff" : "inherit",
                "&:hover": { opacity: 0.9 },
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Tooltip>
        )}
        <Menu
          anchorEl={userAnchorEl}
          open={Boolean(userAnchorEl)}
          onClose={() => setUserAnchorEl(null)}
          PaperProps={{
            style: {
              maxHeight: 200,
            },
          }}
        >
          {(userData?.data || []).map((user) => (
            <MenuItem
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setUserAnchorEl(null);
              }}
              sx={{ minWidth: 150 }}
            >
              {user.username}
            </MenuItem>
          ))}
        </Menu>

        {/* Clear Filters */}
        {(filter || startDate || selectedUser) && (
          <Tooltip title="Clear All Filters">
            <IconButton
              size="small"
              onClick={() => {
                setFilter("");
                setStartDate(null);
                setEndDate(null);
                setSelectedUser(null);
              }}
              sx={{
                color: "#f44336",
                bgcolor: "#ffebee",
                "&:hover": {
                  bgcolor: "#ffcdd2",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ClearRounded sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Date Selection Modal */}
      <DateRangeModal
        open={dateModalOpen}
        handleClose={() => setDateModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
    </Paper>
  );
};

export default FilterPanel;

import React, { useCallback, useEffect, useState } from "react";
import _ from 'lodash';
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
  Button,
} from "@mui/material";
import {
  SearchRounded,
  CalendarMonthRounded,
  PersonRounded,
  ClearRounded,
  ForwardRounded,
  ForwardToInboxRounded,
  FilterListRounded,
  AssignmentRounded,
  LoginRounded,
  PendingActionsRounded,
  ThumbUpRounded,
  SendRounded,
  AccountBalanceRounded,
  ReportRounded,
  VisibilityRounded,
  PauseCircleOutlineRounded,
  DeleteForeverRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  ArrowBackRounded,
  CancelRounded,
} from "@mui/icons-material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import dayjs from "dayjs";

import DateRangeModal from "./DateRangeModal";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface FilterPanelProps {
  searchLabel: string;
  sortBy: string;
  filter: string;
  startDate: string | null;
  endDate: string | null;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<string | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<string | null>>;
  userData: { data: User | null };
  userRole: string;
  handleSortChange: (event: string | null) => void;
  ticketCount: number;
  handleFilterChange: (newFilterState: any) => void;
}

const statusOptions = [
  "all",
  "under credit review",
  "operations",
  "pendency in file",
  "file send to banker",
  'hold',
  "to be approved",
  "to be disbursed",
  "approved",
  "disbursed",
  "carry forward",
  'drop',
  "rejected"
];
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
  handleFilterChange,
}) => {
  console.log("userRole",userRole)
  // anchorEl for the main "status" menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // anchorEl for the forwarded submenu
  const [forwardedAnchorEl, setForwardedAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [dateModalOpen, setDateModalOpen] = useState<boolean>(false);
  const [tempInputValue, setTempInputValue] = useState<string>(filter);

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      "under credit review": "#ff9800", // Orange ----
      "operations": "#2196f3", // Blue
      "pendency in file": "#f44336", // Red   ----
      "file send to banker": "#3f51b5", // Indigo
      "hold": "#ffeb3b", // Yellow
      "to be approved": "#4caf50", // Green   ----
      "to be disbursed": "#9c27b0", // Purple
      "approved": "#8bc34a", // Light Green   ----
      "disbursed": "#00bcd4", // Cyan   ----
      "carry forward": "#9e9e9e", // Grey
      "rejected": "#f44336", // Red   ----
      "drop": "#ff5722", // Orange-Red
      forwarded: "#ffc107", // Amber for Forwarded
      "forwarded to me": "#ff7043", // Deep Orange
      "forwarded by me": "#26c6da", // cyan
      all: "#757575", // Grey
      // relook: "#ff5722", // Orange-Red
    };
    return colors[status] || colors.all;
  };

  const getStatusIcon = (status: string): JSX.Element => {
    const icons: { [key: string]: JSX.Element } = {
      "under credit review": <AssignmentRounded sx={{ fontSize: 20 }} />,
      "operations": <LoginRounded sx={{ fontSize: 20 }} />,
      "pendency in file": <PendingActionsRounded sx={{ fontSize: 20 }} />,
      "file send to banker": <SendRounded sx={{ fontSize: 20 }} />,
      "hold": <PauseCircleOutlineRounded sx={{ fontSize: 20 }} />,
      "to be approved": <ThumbUpRounded sx={{ fontSize: 20 }} />,
      "to be disbursed": <ForwardRounded sx={{ fontSize: 20 }} />,
      "approved": <AccountBalanceRounded sx={{ fontSize: 20 }} />,
      "disbursed": <ReportRounded sx={{ fontSize: 20 }} />,
      "carry forward": <ForwardRounded sx={{ fontSize: 20 }} />,
      "rejected": <CancelRounded sx={{ fontSize: 20 }} />,
      "drop": <DeleteForeverRounded sx={{ fontSize: 20 }} />,
      forwarded: <ForwardToInboxRounded sx={{ fontSize: 20 }} />,
      "forwarded to me": <ArrowDownwardRounded sx={{ fontSize: 20 }} />,
      "forwarded by me": <ArrowUpwardRounded sx={{ fontSize: 20 }} />,
      all: <FilterListRounded sx={{ fontSize: 20 }} />,
    };
    return icons[status] || icons.all;
  };

  const debouncedSearch = useCallback(
    _.debounce((value: string) => {
      setFilter(value);
      handleFilterChange({ name: value, page: 1 });
    }, 800),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempInputValue(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle the status change
  const handleStatusChange = (status: string) => {
    handleSortChange(status); // Update the status in parent component
    handleFilterChange({ status, page: 1 }); // Reset page to 1 and update filter
  };
  // Handle the user change
  const handleUserChange = (user: User) => {
    setSelectedUser(user); // Update selected user
    handleFilterChange({ user, page: 1 }); // Reset page to 1 and update user filter
  };

  // Handler for opening the modal
  const handleDateModalOpen = () => setDateModalOpen(true);
  const router = useRouter();

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

  // Handle the date range change
  const handleDateModalApply = (start: string | null, end: string | null) => {
    const formattedStart = start ? dayjs(start).format('YYYY-MM-DD HH:mm:ss') : null;
    const formattedEnd = end ? dayjs(end).format('YYYY-MM-DD HH:mm:ss') : null;
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    handleFilterChange({ startDate: formattedStart, endDate: formattedEnd, page: 1 }); // Reset page to 1 and update date range
  };

  // Submenu open/close for "Forwarded"
  const handleForwardedMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setForwardedAnchorEl(event.currentTarget);
  };

  const handleForwardedMenuClose = () => {
    setForwardedAnchorEl(null);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #fff 0%, #f5f5f5 100%)",
        display: "flex",
        flexDirection: "row",
        gap: 2,
      }}
    >
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => { router.back(); }}
        sx={{ color: "black" }}
      >
      </Button>
      {/* Search and Filters Row */}
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <TextField
          size="small"
          placeholder={searchLabel}
          value={tempInputValue}
          onChange={handleInputChange}
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
            endAdornment: tempInputValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => {
                  setTempInputValue("");
                  setFilter("");
                }}>
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
            label={`${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
              } (${ticketCount})`}
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
          {/* Normal statuses (excluding "forwarded") */}
          {statusOptions.map((status) => (
            <MenuItem
              key={status}
              onClick={() => {
                handleStatusChange(status);
                setAnchorEl(null);
              }}
              sx={{
                gap: 1,
                minWidth: 180,
                color: getStatusColor(status),
                "&:hover": {
                  backgroundColor: `${getStatusColor(status)}10`,
                },
              }}
            >
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </MenuItem>
          ))}

          {/* "Forwarded" with nested submenu */}
          <MenuItem
            onMouseEnter={handleForwardedMenuOpen}
            onMouseLeave={handleForwardedMenuClose}
            sx={{
              gap: 1,
              minWidth: 180,
              color: getStatusColor("forwarded"),
              "&:hover": {
                backgroundColor: `${getStatusColor("forwarded")}10`,
              },
            }}
          >
            {/** If you want a special icon for "Forwarded": */}
            {/** Or just reuse getStatusIcon("forwarded") if you like */}
            <ForwardToInboxRounded sx={{ fontSize: 20 }} />
            Forwarded
            <ArrowRightIcon fontSize="small" sx={{ marginLeft: "auto" }} />

            {/* Nested Submenu */}
            <Menu
              anchorEl={forwardedAnchorEl}
              open={Boolean(forwardedAnchorEl)}
              onClose={handleForwardedMenuClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <MenuItem
                onClick={() => {
                  handleStatusChange("forwarded To Me");
                  handleForwardedMenuClose();
                  setAnchorEl(null);
                }}
                sx={{
                  gap: 1,
                  minWidth: 180,
                  color: getStatusColor("forwarded to me"),
                  "&:hover": {
                    backgroundColor: `${getStatusColor("forwarded to me")}22`
                  },
                }}
              >
                {getStatusIcon("forwarded to me")}
                Forwarded To Me
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleStatusChange("forwarded by me");
                  handleForwardedMenuClose();
                  setAnchorEl(null);
                }}
                sx={{
                  gap: 1,
                  minWidth: 180,
                  color: getStatusColor("forwarded by me"),
                  "&:hover": {
                    backgroundColor: `${getStatusColor("forwarded by me")}22`
                  },
                }}
              >
                {getStatusIcon("forwarded by me")}
                Forwarded By Me
              </MenuItem>
            </Menu>
          </MenuItem>
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
          {(userData?.results || []).map((user: any) => (
            <MenuItem
              key={user.id}
              onClick={() => {
                handleUserChange(user);
                setUserAnchorEl(null);
              }}
              sx={{ minWidth: 150 }}
            >
              {user.username}
            </MenuItem>
          ))}
        </Menu>

        {/* Clear Filters */}
        {(tempInputValue || startDate || selectedUser) && (
          <Tooltip title="Clear All Filters">
            <IconButton
              size="small"
              onClick={() => {
                setFilter("");
                setTempInputValue("");
                setStartDate(null);
                setEndDate(null);
                setSelectedUser(null);
                handleFilterChange({});
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
        onApply={handleDateModalApply}
      />
    </Paper>
  );
};

export default FilterPanel;

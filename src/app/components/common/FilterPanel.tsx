import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
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
  AdminPanelSettingsRounded,
  SupervisorAccountRounded,
  SupportAgentRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
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
  CurrencyRupeeRounded,
  BusinessRounded,
} from "@mui/icons-material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import dayjs from "dayjs";

import DateRangeModal from "./DateRangeModal";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface FilterPanelProps {
  searchLabel: string;
  sortBy: string;
  loanProvider: string;
  filter: string;
  startDate: string | null;
  endDate: string | null;
  selectedUser: User | null;
  selectedBank: string | null;
  month?: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<string | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<string | null>>;
  userData: User | null;
  userRole: string;
  handleSortChange: ( event: string | null ) => void;
  handleProviderChange: ( event: string | null ) => void;
  ticketCount: number;
  disbursedAmount?: number;
  handleFilterChange: ( newFilterState: any ) => void;
}

const statusOptions = [
  "all",
  "under credit review",
  "operations",
  "pendency in file",
  "file send to banker",
  "hold",
  "to be approved",
  "to be disbursed",
  "approved",
  "disbursed",
  "carry forward",
  "drop",
  "rejected",
];

// Credit role specific options
const creditStatusOptions = [ "forwarded", "forwardedtome", "forwardedbyme" ];

const bankOptions = [
  "Bajaj Finance",
  "Bajaj Market",
  "Chola",
  "L&T",
  "Tata",
  "ABFL",
  "Godrej",
  "IDFC",
  "HDFC Bank",
  "ICICI",
  "INDUSIND",
  "Lending Cart",
  "Incred",
  "Credit Saison",
  "PaySense",
  "Shriram",
];

const FilterPanel: React.FC<FilterPanelProps> = ( {
  sortBy,
  loanProvider,
  filter,
  startDate,
  endDate,
  selectedUser,
  selectedBank,
  setSelectedUser,
  setFilter,
  handleSortChange,
  handleProviderChange,
  setStartDate,
  setEndDate,
  userData,
  userRole,
  ticketCount,
  disbursedAmount,
  searchLabel,
  handleFilterChange,
} ) => {
  // anchorEl for the "status" menu
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>( null );
  // anchorEl for the forwarded submenu
  const [ forwardedAnchorEl, setForwardedAnchorEl ] =
    useState<null | HTMLElement>( null );
  // anchorEl for bank menu
  const [ bankAnchorEl, setBankAnchorEl ] = useState<null | HTMLElement>( null );
  const [ userAnchorEl, setUserAnchorEl ] = useState<null | HTMLElement>( null );
  const [ dateModalOpen, setDateModalOpen ] = useState<boolean>( false );
  const [ tempInputValue, setTempInputValue ] = useState<string>( filter );

  const normalizeStatusForApi = ( status: string ): string => {
    if ( status === "forwarded to me" ) return "forwardedtome";
    if ( status === "forwarded by me" ) return "forwardedbyme";
    return status;
  };

  // Helper function to normalize status for display
  const normalizeStatusForDisplay = ( status: string ): string => {
    if ( status === "forwardedtome" ) return "forwarded to me";
    if ( status === "forwardedbyme" ) return "forwarded by me";
    return status;
  };

  const getStatusDisplayLabel = ( status: string ): string => {
    const displayStatus = normalizeStatusForDisplay( status );
    return `${ displayStatus.charAt( 0 ).toUpperCase() + displayStatus.slice( 1 )
      } (${ ticketCount })`;
  };

  const getStatusColor = ( status: string ): string => {
    const normalizedStatus = normalizeStatusForDisplay( status );
    const colors: { [ key: string ]: string } = {
      "under credit review": "#ff9800",
      operations: "#2196f3",
      "pendency in file": "#f44336",
      "file send to banker": "#3f51b5",
      hold: "#ffeb3b",
      "to be approved": "#4caf50",
      "to be disbursed": "#9c27b0",
      approved: "#8bc34a",
      disbursed: "#00bcd4",
      "carry forward": "#9e9e9e",
      rejected: "#f44336",
      drop: "#ff5722",
      forwarded: "#ffc107",
      "forwarded to me": "#ff7043",
      "forwarded by me": "#26c6da",
      all: "#757575",
    };
    return colors[ normalizedStatus ] || colors.all;
  };

  const getBankColor = ( bank: string ): string => {
    const colors: { [ key: string ]: string } = {
      "Bajaj Finance": "#E91E63",
      "Bajaj Market": "#9C27B0",
      Chola: "#673AB7",
      "L&T": "#3F51B5",
      Tata: "#2196F3",
      ABFL: "#03A9F4",
      Godrej: "#00BCD4",
      IDFC: "#009688",
      "HDFC Bank": "#4CAF50",
      ICICI: "#8BC34A",
      INDUSIND: "#CDDC39",
      "Lending Cart": "#FFEB3B",
      Incred: "#FFC107",
      "Credit Saison": "#FF9800",
      PaySense: "#FF5722",
      Shriram: "#795548",
      all: "#757575",
    };
    return colors[ bank ] || colors.all;
  };

  const getRoleColor = ( role: string ): string => {
    const colors: { [ key: string ]: string } = {
      admin: "#d32f2f",
      "sub admin": "#f57c00",
      operations: "#1976d2",
      credit: "#1976d2",
      sales: "#388e3c",
      default: "#757575",
    };
    return colors[ role?.toLowerCase() ] || colors.default;
  };

  const getStatusIcon = ( status: string ): JSX.Element => {
    const normalizedStatus = normalizeStatusForDisplay( status );
    const icons: { [ key: string ]: JSX.Element } = {
      "under credit review": <AssignmentRounded sx={{ fontSize: 20 }} />,
      operations: <LoginRounded sx={{ fontSize: 20 }} />,
      "pendency in file": <PendingActionsRounded sx={{ fontSize: 20 }} />,
      "file send to banker": <SendRounded sx={{ fontSize: 20 }} />,
      hold: <PauseCircleOutlineRounded sx={{ fontSize: 20 }} />,
      "to be approved": <ThumbUpRounded sx={{ fontSize: 20 }} />,
      "to be disbursed": <ForwardRounded sx={{ fontSize: 20 }} />,
      approved: <AccountBalanceRounded sx={{ fontSize: 20 }} />,
      disbursed: <ReportRounded sx={{ fontSize: 20 }} />,
      "carry forward": <ForwardRounded sx={{ fontSize: 20 }} />,
      rejected: <CancelRounded sx={{ fontSize: 20 }} />,
      drop: <DeleteForeverRounded sx={{ fontSize: 20 }} />,
      forwarded: <ForwardToInboxRounded sx={{ fontSize: 20 }} />,
      "forwarded to me": <ArrowDownwardRounded sx={{ fontSize: 20 }} />,
      "forwarded by me": <ArrowUpwardRounded sx={{ fontSize: 20 }} />,
      all: <FilterListRounded sx={{ fontSize: 20 }} />,
    };
    return icons[ normalizedStatus ] || icons.all;
  };

  // Role-based icon function
  const getRoleIcon = ( role: string ): JSX.Element => {
    const icons: { [ key: string ]: JSX.Element } = {
      admin: <AdminPanelSettingsRounded sx={{ fontSize: 18 }} />,
      "sub admin": <SupervisorAccountRounded sx={{ fontSize: 18 }} />,
      operations: <SupportAgentRounded sx={{ fontSize: 18 }} />,
      credit: <SupportAgentRounded sx={{ fontSize: 18 }} />,
      sales: <TrendingUpRounded sx={{ fontSize: 18 }} />,
      default: <PersonRounded sx={{ fontSize: 18 }} />,
    };
    return icons[ role?.toLowerCase() ] || icons.default;
  };

  const formatUserDisplay = ( user: any ): string => {
    const roleTag = user.role
      ? ` (${ user.role.charAt( 0 ).toUpperCase() + user.role.slice( 1 ) })`
      : "";
    return `${ user.username }${ roleTag }`;
  };

  // Format currency in Indian format
  const formatCurrency = ( amount: number ): string => {
    return new Intl.NumberFormat( "en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    } ).format( amount );
  };

  const debouncedSearch = useCallback(
    _.debounce( ( value: string ) => {
      setFilter( value );
      handleFilterChange( { name: value, page: 1 } );
    }, 800 ),
    []
  );

  const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const value = e.target.value;
    setTempInputValue( value );
    debouncedSearch( value );
  };

  useEffect( () => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [ debouncedSearch ] );

  // Handle the status change
  const handleStatusChange = ( status: string ) => {
    const normalizedStatus = normalizeStatusForApi( status );
    handleSortChange( normalizedStatus );
    handleFilterChange( { status: normalizedStatus, page: 1 } );
  };

  // Handle the bank change
  const handleBankChange = ( provider: string ) => {
    handleProviderChange( provider );
    handleFilterChange( { provider, page: 1 } );
  };

  // Handle the user change
  const handleUserChange = ( user: User ) => {
    setSelectedUser( user );
    handleFilterChange( { user, page: 1 } );
  };

  // Handler for opening the modal
  const handleDateModalOpen = () => setDateModalOpen( true );
  const router = useRouter();

  // Format the date range to be displayed on the chip
  const formatDateRange = () => {
    if ( startDate && endDate )
    {
      return `${ dayjs( startDate ).format( "MM/DD/YYYY" ) } - ${ dayjs(
        endDate
      ).format( "MM/DD/YYYY" ) }`;
    } else if ( startDate )
    {
      return `From ${ dayjs( startDate ).format( "MM/DD/YYYY" ) }`;
    } else if ( endDate )
    {
      return `Until ${ dayjs( endDate ).format( "MM/DD/YYYY" ) }`;
    } else
    {
      return "Select Dates";
    }
  };

  // Handle the date range change
  const handleDateModalApply = ( start: string | null, end: string | null ) => {
    const formattedStart = start
      ? dayjs( start ).format( "YYYY-MM-DD HH:mm:ss" )
      : null;
    const formattedEnd = end ? dayjs( end ).format( "YYYY-MM-DD HH:mm:ss" ) : null;
    setStartDate( formattedStart );
    setEndDate( formattedEnd );
    handleFilterChange( {
      startDate: formattedStart,
      endDate: formattedEnd,
      page: 1,
    } );
  };

  // Get the appropriate status options based on user role
  const getStatusOptions = () => {
    if ( userRole === "credit" )
    {
      return creditStatusOptions;
    }
    return statusOptions;
  };

  const getDefaultStatus = () => {
    if ( userRole === "credit" )
    {
      return "forwarded";
    }
    return "all";
  };

  // Submenu open/close for "Forwarded"
  const handleForwardedMenuOpen = ( event: React.MouseEvent<HTMLElement> ) => {
    setForwardedAnchorEl( event.currentTarget );
  };

  const handleForwardedMenuClose = () => {
    setForwardedAnchorEl( null );
  };
  console.log( 'set fsdsfdsfd', tempInputValue, startDate, selectedUser, selectedBank, sortBy, loanProvider )
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
        onClick={() => {
          router.back();
        }}
        sx={{ color: "black" }}
      />
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
                <IconButton
                  size="small"
                  onClick={() => {
                    setTempInputValue( "" );
                    setFilter( "" );
                  }}
                >
                  <ClearRounded sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />


        {/* Bank Filter */}
        <Tooltip title="Filter by Bank/Lender">
          <Chip
            icon={<BusinessRounded sx={{ fontSize: 20 }} />}
            label={`${ loanProvider.charAt( 0 ).toUpperCase() + loanProvider.slice( 1 )
              } (${ ticketCount })`}
            onClick={( e ) => setBankAnchorEl( e.currentTarget )}
            sx={{
              backgroundColor: getBankColor( loanProvider ),
              color: "#fff",
              "&:hover": { opacity: 0.9 },
              fontWeight: 500,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Tooltip>
        <Menu
          anchorEl={bankAnchorEl}
          open={Boolean( bankAnchorEl )}
          onClose={() => setBankAnchorEl( null )}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
              maxHeight: 300,
            },
          }}
        >
          {/* All Banks option */}
          <MenuItem
            onClick={() => {
              handleBankChange( "all" );
              setBankAnchorEl( null );
            }}
            sx={{
              gap: 1,
              minWidth: 200,
              color: getBankColor( "all" ),
              "&:hover": {
                backgroundColor: `${ getBankColor( "all" ) }10`,
              },
            }}
          >
            <BusinessRounded sx={{ fontSize: 20 }} />
            All Banks {ticketCount}
          </MenuItem>

          {/* Individual bank options */}
          {bankOptions.map( ( bank ) => (
            <MenuItem
              key={bank}
              onClick={() => {
                handleBankChange( bank );
                setBankAnchorEl( null );
              }}
              sx={{
                gap: 1,
                minWidth: 200,
                color: getBankColor( bank ),
                "&:hover": {
                  backgroundColor: `${ getBankColor( bank ) }10`,
                },
              }}
            >
              <BusinessRounded sx={{ fontSize: 20 }} />
              {bank.charAt( 0 ).toUpperCase() + bank.slice( 1 )}
            </MenuItem>
          ) )}
        </Menu>

        {/* Status Filter */}
        <Tooltip title="Filter by Status">
          <Chip
            icon={getStatusIcon( sortBy )}
            label={`${ sortBy.charAt( 0 ).toUpperCase() + sortBy.slice( 1 )
              } (${ ticketCount })`}
            onClick={( e ) => setAnchorEl( e.currentTarget )}
            sx={{
              backgroundColor: getStatusColor( sortBy ),
              color: "#fff",
              "&:hover": { opacity: 0.9 },
              fontWeight: 500,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean( anchorEl )}
          onClose={() => setAnchorEl( null )}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 2,
            },
          }}
        >
          {userRole === "credit"
            ? // Credit role: Only show forwarded options
            creditStatusOptions.map( ( status ) => (
              <MenuItem
                key={status}
                onClick={() => {
                  handleStatusChange( status );
                  setAnchorEl( null );
                }}
                sx={{
                  gap: 1,
                  minWidth: 180,
                  color: getStatusColor( status ),
                  "&:hover": {
                    backgroundColor: `${ getStatusColor( status ) }10`,
                  },
                }}
              >
                {getStatusIcon( status )}
                {normalizeStatusForDisplay( status ).charAt( 0 ).toUpperCase() +
                  normalizeStatusForDisplay( status ).slice( 1 )}
              </MenuItem>
            ) )
            : [
              // Other roles: Show all status options
              ...statusOptions.map( ( status ) => (
                <MenuItem
                  key={status}
                  onClick={() => {
                    handleStatusChange( status );
                    setAnchorEl( null );
                  }}
                  sx={{
                    gap: 1,
                    minWidth: 180,
                    color: getStatusColor( status ),
                    "&:hover": {
                      backgroundColor: `${ getStatusColor( status ) }10`,
                    },
                  }}
                >
                  {getStatusIcon( status )}
                  {status.charAt( 0 ).toUpperCase() + status.slice( 1 )}
                </MenuItem>
              ) ),
              <MenuItem
                key="forwarded-submenu"
                onMouseEnter={handleForwardedMenuOpen}
                onMouseLeave={handleForwardedMenuClose}
                sx={{
                  gap: 1,
                  minWidth: 180,
                  color: getStatusColor( "forwarded" ),
                  "&:hover": {
                    backgroundColor: `${ getStatusColor( "forwarded" ) }10`,
                  },
                }}
              >
                <ForwardToInboxRounded sx={{ fontSize: 20 }} />
                Forwarded
                <ArrowRightIcon
                  fontSize="small"
                  sx={{ marginLeft: "auto" }}
                />
                {/* Nested Submenu */}
                <Menu
                  anchorEl={forwardedAnchorEl}
                  open={Boolean( forwardedAnchorEl )}
                  onClose={handleForwardedMenuClose}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleStatusChange( "forwarded to me" );
                      handleForwardedMenuClose();
                      setAnchorEl( null );
                    }}
                    sx={{
                      gap: 1,
                      minWidth: 180,
                      color: getStatusColor( "forwarded to me" ),
                      "&:hover": {
                        backgroundColor: `${ getStatusColor(
                          "forwarded to me"
                        ) }22`,
                      },
                    }}
                  >
                    {getStatusIcon( "forwarded to me" )}
                    Forwarded To Me
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleStatusChange( "forwarded by me" );
                      handleForwardedMenuClose();
                      setAnchorEl( null );
                    }}
                    sx={{
                      gap: 1,
                      minWidth: 180,
                      color: getStatusColor( "forwarded by me" ),
                      "&:hover": {
                        backgroundColor: `${ getStatusColor(
                          "forwarded by me"
                        ) }22`,
                      },
                    }}
                  >
                    {getStatusIcon( "forwarded by me" )}
                    Forwarded By Me
                  </MenuItem>
                </Menu>
              </MenuItem>,
            ]}
        </Menu>

        {/* Disbursed Amount Chip - Only show when status is 'disbursed' and amount exists */}
        {sortBy === "disbursed" && disbursedAmount && (
          <Tooltip title="Total Disbursed Amount">
            <Chip
              icon={<CurrencyRupeeRounded sx={{ fontSize: 20 }} />}
              label={formatCurrency( disbursedAmount )}
              sx={{
                backgroundColor: getStatusColor( "disbursed" ),
                color: "#fff",
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Tooltip>
        )}

        {startDate && endDate && (
          <Tooltip title="Selected Date Range">
            <Chip
              icon={<CalendarMonthRounded sx={{ fontSize: 20 }} />}
              label={( () => {
                const start = new Date( startDate );
                const end = new Date( endDate );

                // Check if it's the same month and year
                if ( start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear() )
                {
                  return start.toLocaleString( 'default', { month: 'long', year: 'numeric' } );
                }

                // Check if it's the same year but different months
                if ( start.getFullYear() === end.getFullYear() )
                {
                  return `${ start.toLocaleString( 'default', { month: 'short' } ) } - ${ end.toLocaleString( 'default', { month: 'short' } ) } ${ start.getFullYear() }`;
                }

                // Different years
                return `${ start.toLocaleString( 'default', { month: 'short', year: 'numeric' } ) } - ${ end.toLocaleString( 'default', { month: 'short', year: 'numeric' } ) }`;
              } )()}
              onDelete={() => {
                setStartDate( null );
                setEndDate( null );
                handleFilterChange( { startDate: null, endDate: null } );
              }}
              sx={{
                backgroundColor: startDate ? "#1976d2" : "#e0e0e0",
                color: startDate ? "#fff" : "inherit",
                "&:hover": { opacity: 0.9 },
                "& .MuiChip-deleteIcon": {
                  color: "#fff",
                },
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Tooltip>
        )}

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
          <>
            <Tooltip title="Select User">
              <Chip
                icon={getRoleIcon( selectedUser?.role || "" )}
                label={selectedUser ? formatUserDisplay( selectedUser ) : "Select User"}
                onClick={( e ) => setUserAnchorEl( e.currentTarget )}
                sx={{
                  backgroundColor: selectedUser ? getRoleColor( selectedUser.role ) : "#e0e0e0",
                  color: selectedUser ? "#fff" : "inherit",
                  "&:hover": { opacity: 0.9 },
                  fontWeight: 500,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            </Tooltip>

            <Menu
              anchorEl={userAnchorEl}
              open={Boolean( userAnchorEl )}
              onClose={() => setUserAnchorEl( null )}
              PaperProps={{
                sx: {
                  mt: 1,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  maxHeight: 300,
                },
              }}
            >
              {( () => {
                const users = userData?.results || userData?.data || userData || [];

                if ( !Array.isArray( users ) || users.length === 0 )
                {
                  return (
                    <MenuItem disabled sx={{ minWidth: 200 }}>
                      {userData === null ? "Loading users..." : "No users available"}
                    </MenuItem>
                  );
                }

                return users.map( ( user ) => (
                  <MenuItem
                    key={user.id || user.username}
                    onClick={() => {
                      handleUserChange( user );
                      setUserAnchorEl( null );
                    }}
                    sx={{
                      gap: 1,
                      minWidth: 200,
                      color: getRoleColor( user.role ),
                      "&:hover": { backgroundColor: `${ getRoleColor( user.role ) }15` },
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {getRoleIcon( user.role )}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <span style={{ fontWeight: 500 }}>
                        {user.username || user.name || "Unknown User"}
                      </span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "capitalize" }}>
                        {user.role || "No Role"}
                      </span>
                    </Box>
                  </MenuItem>
                ) );
              } )()}
            </Menu>
          </>
        )}


        {/* Clear Filters */}
        {( tempInputValue || startDate || selectedUser || selectedBank || ( sortBy && sortBy !== 'all' ) || ( loanProvider && loanProvider !== 'all' ) ) && (
          <Tooltip title="Clear All Filters">
            <IconButton
              size="small"
              onClick={() => {
                setFilter( "" );
                setTempInputValue( "" );
                setStartDate( null );
                setEndDate( null );
                setSelectedUser( null );
                handleFilterChange( {} );
                handleStatusChange( getDefaultStatus() );
                handleBankChange( "all" );
                router.replace( "/ticket", undefined, { shallow: true } );
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
        handleClose={() => setDateModalOpen( false )}
        startDate={startDate}
        endDate={endDate}
        onApply={handleDateModalApply}
      />
    </Paper>
  );
};

export default FilterPanel;

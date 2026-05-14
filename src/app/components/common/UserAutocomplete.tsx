import { useEffect, useState } from "react";
import { Autocomplete, Box, TextField, Tooltip, Divider, Typography, ListSubheader } from "@mui/material";
import {
  SupervisorAccountRounded,
  SupportAgentRounded,
  PersonRounded,
} from "@mui/icons-material";

import { User, UserData } from "@/types/user";
import { TicketDetail } from "@/app/ticket/[ticketId]/MainPage";

interface UserAutocompleteProps {
  isMobile: boolean;
  isTab: boolean;
  newEmployeeStatus: string;
  userData: User;
  selectedUser: UserData | null;
  setSelectedUser: ( user: UserData | null ) => void;
  handleForwardAutocomplete: ( value: UserData | null ) => void;
  ticketId: string | number;
  userId: string | number;
  isForwarded: number | null;
  ticketDetailData: TicketDetail;
  currentUserRole?: string;
}

const UserAutocomplete: React.FC<UserAutocompleteProps> = ( {
  isMobile,
  isTab,
  newEmployeeStatus,
  userData,
  selectedUser,
  setSelectedUser,
  handleForwardAutocomplete,
  ticketId,
  userId,
  isForwarded,
  ticketDetailData,
  currentUserRole
} ) => {
  const [ allUsers, setAllUsers ] = useState<UserData[]>( [] );
  const [ filteredUsers, setFilteredUsers ] = useState<UserData[]>( [] );

  const getRoleIcon = ( role: string ): JSX.Element => {
    const icons: { [ key: string ]: JSX.Element } = {
      "sub admin": <SupervisorAccountRounded sx={{ fontSize: 18 }} />,
      operations: <SupportAgentRounded sx={{ fontSize: 18 }} />,
      credit: <SupportAgentRounded sx={{ fontSize: 18 }} />,
      default: <PersonRounded sx={{ fontSize: 18 }} />,
    };
    return icons[ role?.toLowerCase() ] || icons.default;
  };

  const getRoleColor = ( role: string ): string => {
    const colors: { [ key: string ]: string } = {
      "sub admin": "#f57c00",
      operations: "#1976d2",
      credit: "#1976d2",
      default: "#757575",
    };
    return colors[ role?.toLowerCase() ] || colors.default;
  };

  useEffect( () => {
    if ( userData?.data?.results )
    {
      setAllUsers( userData?.data.results );
      try
      {
        const ticketUser = isForwarded ? ticketDetailData?.forwardedTo : userId;
        const selectedUserObj = userData?.data?.results?.find(
          ( user ) => user.id == ticketUser
        );
        setSelectedUser( selectedUserObj || null );
      } catch ( error )
      {
        console.error( "Error fetching users:", error );
      }
    };
  }, [ userData?.data?.results, ticketId ] );

  // Filter and Sort users based on roles
  useEffect( () => {
    const roleOrder = [ 'credit', 'operations', 'sub admin' ];
    const filtered = allUsers
      .filter( user => roleOrder.includes( user.role?.toLowerCase() ) )
      .sort( ( a, b ) => {
        return roleOrder.indexOf( a.role?.toLowerCase() ) - roleOrder.indexOf( b.role?.toLowerCase() );
      } );
    setFilteredUsers( filtered );
  }, [ allUsers ] );

  return (
    <Box
      sx={{
        width: "100%",
        mt: 1,
      }}
    >
      {newEmployeeStatus === "forwarded" && (
        <Tooltip title="Select a user to forward this ticket to" placement="top">
          <Autocomplete
            options={filteredUsers || []}
            groupBy={( option ) => option.role}
            getOptionLabel={( option ) => `${ option.username } (${ option.role })`}
            value={selectedUser || null}
            onChange={( event, value ) => handleForwardAutocomplete( value )}
            renderGroup={( params ) => (
              <Box key={params.key}>
                <ListSubheader
                  sx={{
                    fontWeight: 'bold',
                    color: '#155fcc',
                    bgcolor: '#f0f4f8',
                    lineHeight: '32px',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {params.group}
                </ListSubheader>
                {params.children}
                <Divider />
              </Box>
            )}
            renderOption={( props, option ) => {
              const roleColor = getRoleColor( option.role );
              // Determine light background based on role color
              const lightBg = roleColor === "#f57c00" ? "#fff3e0" : roleColor === "#1976d2" ? "#e3f2fd" : "#f5f5f5";

              return (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    margin: '4px 8px !important',
                    borderRadius: '8px !important',
                    backgroundColor: `${ lightBg } !important`,
                    border: `1px solid ${ roleColor }20`,
                    '&:hover': {
                      backgroundColor: `${ lightBg } !important`,
                      opacity: 0.9,
                      borderColor: roleColor,
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: '8px !important',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: roleColor,
                      bgcolor: 'white',
                      borderRadius: '50%',
                      p: 0.5,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {getRoleIcon( option.role )}
                  </Box>
                  <Typography sx={{ fontWeight: 500, color: '#172B4D', fontSize: '0.9rem' }}>
                    {option.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 'auto',
                      color: roleColor,
                      fontWeight: 600,
                      bgcolor: 'white',
                      px: 1,
                      borderRadius: 1,
                      textTransform: 'capitalize',
                      border: `1px solid ${ roleColor }30`
                    }}
                  >
                    {option.role}
                  </Typography>
                </Box>
              );
            }}
            renderInput={( params ) => (
              <TextField
                {...params}
                label="Select User"
                variant="outlined"
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    color: "black",
                    backgroundColor: "#f5f5f5",
                    "&:hover fieldset": {
                      borderColor: "#155fcc",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#155fcc",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#5E6C84",
                  },
                }}
              />
            )}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default UserAutocomplete;

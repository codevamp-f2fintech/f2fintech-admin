import { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

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
        setSelectedUser( selectedUserObj || [] );
      } catch ( error )
      {
        console.error( "Error fetching users:", error );
      }
    };
  }, [ userData?.data?.results, ticketId ] );

  // Filter users based on current user's role
  useEffect( () => {
    if ( currentUserRole === 'credit' )
    {
      setFilteredUsers( allUsers.filter( user => user.role === 'operations' ) );
    } else if ( currentUserRole === 'operations' )
    {
      setFilteredUsers( allUsers.filter( user => user.role === 'credit' ) );
    } else
    {
      setFilteredUsers( allUsers );
    }
  }, [ allUsers, currentUserRole ] );

  return (
    <Box
      sx={{
        borderRadius: "20px",
        height: isMobile ? "5vh" : isTab ? "4vh" : "7vh",
        mt: isMobile ? "3vw" : isTab ? "2vw" : "1vw",
        width: isMobile ? "75vw" : isTab ? "26vw" : "22vw",
      }}
    >
      {newEmployeeStatus === "forwarded" && (
        <Autocomplete
          // options={allUsers || []}
          options={filteredUsers || []}
          getOptionLabel={( option ) => `${ option.username } (${ option.role })`}
          value={selectedUser || null}
          onChange={( event, value ) => handleForwardAutocomplete( value )}
          renderInput={( params ) => (
            <TextField
              {...params}
              label="Select User"
              variant="outlined"
              type="text"
              sx={{
                borderRadius: "20px",
                "& .MuiOutlinedInput-root": {
                  color: "black",
                  backgroundColor: "#eeeeee",

                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black",
                  backgroundColor: "#eeeeee",
                  padding: "0 5px",
                  borderRadius: "4px",
                },
                "& .MuiSvgIcon-root": {
                  color: "red",
                },
              }}
            />
          )}
        />
      )}
    </Box>
  );
};

export default UserAutocomplete;

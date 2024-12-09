import { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

import { useGetUsers } from "@/hooks/user";
import { fetcher } from "@/apis/apiClient";
import { Utility } from "@/utils";
import { UserData } from "@/types/user";

interface UserAutocompleteProps {
  isMobile: boolean;
  isTab: boolean;
  newEmployeeStatus: string;
  selectedUser: UserData | null;
  setSelectedUser: (user: UserData | null) => void;
  handleForwardAutocomplete: (value: UserData | null) => void;
}

const UserAutocomplete: React.FC<UserAutocompleteProps> = ({
  isMobile,
  isTab,
  newEmployeeStatus,
  selectedUser,
  setSelectedUser,
  handleForwardAutocomplete,
}) => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const { getLocalStorage } = Utility();
  const ticketId = getLocalStorage("ticketId")?.split("-")[1];

  const { value: userData } = useGetUsers({}, "get-users", 1, 100);

  useEffect(() => {
    if (userData?.results) {
      setAllUsers(userData.results);
      const fetchTicket = async () => {
        try {
          const response = await fetcher(`get-ticket/${ticketId}`);
          const selectedUserObj = userData?.results?.find(
            (user) => user.id == response?.data?.user_id
          );
          setSelectedUser(selectedUserObj || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchTicket();
    }
  }, [userData?.results, ticketId]);

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
          options={allUsers || []}
          getOptionLabel={(option) => option.username}
          value={selectedUser || null}
          onChange={(event, value) => handleForwardAutocomplete(value)}
          renderInput={(params) => (
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
                  "& fieldset": {
                    borderColor: "lightblue",
                  },
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "black",
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

"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setUsers } from "@/redux/features/userSlice";

import { User } from "@/types/user";
import { useGetUsers } from "@/hooks/user";

interface UsersPageProps {
  initialData: User[];
}

// Moved capitalizeFirstLetter outside the component function
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const UsersPage: React.FC<UsersPageProps> = ({ initialData }) => {
  const [pageSize, setPageSize] = useState({
    page: 1,
    size: 5,
  });
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search input
  const dispatch: AppDispatch = useDispatch();
  const { user, reduxLoading } = useSelector((state: RootState) => state.user);

  const validInitialData = useMemo(() => {
    return initialData
      ? Array.isArray(initialData)
        ? initialData
        : [initialData]
      : [];
  }, [initialData]);

  useEffect(() => {
    if (validInitialData.length > 0) {
      dispatch(setUsers(validInitialData));
    }
  }, [validInitialData, dispatch]);

  const { data, swrLoading } = useGetUsers(
    initialData,
    `get-users?&_page=${pageSize.page}&_limit=${pageSize.size}`
  );

  useEffect(() => {
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length > validInitialData.length) {
      dispatch(setUsers(dataArray));
    }
  }, [data, validInitialData.length, dispatch]);

  // Displayed data for users
  const displayData =
    user.length > 0
      ? user
      : validInitialData.length > 0
      ? validInitialData
      : [];

  // Filter users by username based on the search query
  const filteredUsers = displayData.filter((val) =>
    val.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      maxWidth={"false"}
      sx={{
        height: "100vh",
        width: "58vw",
        display: "flex",
        flexDirection: "column",
        background: "white",

        // border: "2px solid red",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
          padding: "1vw",
          backgroundColor: "black",
          // borderRadius: "20px 0px 0px 20px",
        }}
      >
        <Typography
          sx={{
            fontSize: "2.5rem",
            mb: 2,
            marginLeft: "1vw",
            fontWeight: "300",
            lineHeight: "1.5rem",
            margin: "0px",
            fontFamily: "monospace",
            color: "white",
          }}
        >
          Users
        </Typography>

        <TextField
          label="Search"
          type="search"
          variant="filled"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
          sx={{
            width: "15vw",
            height: "7vh",
            backgroundColor: "#f2f2f2",
            borderRadius: "20px",
            "& .MuiInputLabel-root": {
              color: "black", // Replace 'yourColor' with your desired color value
            },
            "& .MuiInputBase-root": {
              borderRadius: "20px",
            },
            "& .MuiFilledInput-root": {
              backgroundColor: "white", // Replace with your desired background color
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: "black", fontSize: "2rem" }} />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          InputLabelProps={{
            style: {
              color: "black", // Label color
            },
          }}
        />
      </Box>

      <Box
        sx={{
          maxHeight: "100vh",
          overflow: "auto",
          mb: 2,
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
        }}
      >
        <Grid sx={{ margin: "0.5vh" }} container spacing={2}>
          {filteredUsers.map((val, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  height: "30vh",
                  display: "flex",
                  // backgroundImage: "url('/front1.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  padding: 2,
                  borderRadius: "40px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",

                  ":hover": {
                    transform: "scale(1.05)",
                    transition: "all 300ms ease-in-out",
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }} variant="h6">
                  {capitalizeFirstLetter(val.username)}
                </Typography>
                <Typography sx={{ fontSize: "1.1rem" }} variant="body1">
                  {val.email}
                </Typography>
                <Typography sx={{ fontSize: "1.1rem" }} variant="body1">
                  {val.gender}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {reduxLoading || swrLoading ? (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      ) : null}
    </Box>
  );
};

export default UsersPage;

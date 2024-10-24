"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "10vh",
            width: "80vw",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <TextField
            label="Search by name..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              backgroundColor: "#f2f2f2",
              marginLeft: "48vw",

              borderRadius: "20px",
              "& .MuiInputLabel-root": {
                color: "black",
              },
              "& .MuiInputBase-root": {
                borderRadius: "20px",
              },
              "& .MuiFilledInput-root": {
                backgroundColor: "white",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "black", fontSize: "1.5rem" }} />
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            InputLabelProps={{
              style: {
                color: "black",
              },
            }}
          />
          <Button
            sx={{
              height: "6vh",
              width: "13vw",
              borderRadius: "20px",
              backgroundColor: "#1565c0",
              color: "black",
            }}
            onClick={() => router.push("/user/create")}
          >
            Create New User
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            minWidth: "80vw",
            minHeight: "90vh",
            overflowX: "hidden",
            overflowY: "hidden",
            p: 2,
            mb: 2,
          }}
        >
          <Grid sx={{ margin: "0.5vh" }} container spacing={2}>
            {filteredUsers.map((val, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    height: "30vh",
                    display: "flex",
                    background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
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
                  <Typography
                    sx={{ fontSize: "1.5rem", color: "white" }}
                    variant="h6"
                  >
                    {capitalizeFirstLetter(val.username)}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "1.1rem", color: "white" }}
                    variant="body1"
                  >
                    {val.email}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "1.1rem", color: "white" }}
                    variant="body1"
                  >
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
    </>
  );
};

export default UsersPage;

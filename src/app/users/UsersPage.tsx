/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Grid,
  Tooltip,
  Avatar,
  CircularProgress,
  Pagination,
  InputAdornment,
} from "@mui/material";
import {
  ClearRounded,
  SearchRounded,
  PersonAddRounded,
  MailRounded,
  EditRounded,
  DeleteRounded,
  PersonRounded,
} from "@mui/icons-material";

import FormComponent from "./FormInModal";
import type { AppDispatch, RootState } from "@/redux/store";
import type { User, UserData } from "@/types/user";
import { setUsers } from "@/redux/features/userSlice";
import { useGetUsers } from "@/hooks/user";
import { UserAPI } from "@/apis/UserAPI";
import { Utility } from "@/utils";

interface UsersPageProps {
  initialData: User
}

const ITEMS_PER_PAGE = 10;

const UsersPage: React.FC<UsersPageProps> = ({ initialData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1); // For frontend pagination
  const { user, reduxLoading } = useSelector((state: RootState) => state.user);

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, toastAndNavigate } = Utility();

  useEffect(() => {
    if (initialData?.data) {
      dispatch(setUsers(initialData?.data));
    }
  }, [initialData?.data]);

  const {
    value: data,
    swrLoading,
    refetch,
  } = useGetUsers(
    initialData as User,
    "get-users",
    currentPage,
    ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (data?.data?.results?.length > initialData?.data?.results?.length) {
      dispatch(setUsers(data));
    }
  }, [data?.data?.results?.length, initialData?.data?.results?.length]);

  const filteredUsers = useMemo(() => {
    const displayData = user?.results || initialData?.data?.results || [];
    return displayData.filter((val: any) =>
      val.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, user?.results, initialData?.data?.results]);

  const handleUserDelete = useCallback(async (id: string | number) => {
    try {
      await UserAPI.updateUserProfile({ id, status: "inactive" });
      const updatedUsers = await refetch();
      if (updatedUsers) {
        dispatch(setUsers(updatedUsers.data));
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Error Occurred. Please Try Again";
      toastAndNavigate(dispatch, true, "error", errorMessage);
    }
  }, []);

  const handleOpenDialog = (userId: string | null = null) => {
    setSelectedUserId(userId);
    setUpdatePassword(false);
    setOpenDialog(!openDialog);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
          }}
        >
          <TextField
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "action.active", mr: 1 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: "100px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "& fieldset": { border: "none" },
                width: { xs: "100%", md: "320px" },
              },
            }}
            InputLabelProps={{
              style: {
                color: "black",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<PersonAddRounded />}
            onClick={() => handleOpenDialog(null)}
            sx={{
              borderRadius: "100px",
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              bgcolor: "#f06292",
              color: "white",
              "&:hover": {
                bgcolor: "#9D50BB",
                color: "white",
              },
            }}
          >
            Create New User
          </Button>
        </Box>

        {/* User Grid */}
        <Grid container spacing={3}>
          {filteredUsers.length &&
            filteredUsers.map((user: UserData, index: number) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: 4,
                    backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
                    backgroundBlendMode: "multiply, screen, normal",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ color: "white", fontWeight: 600, mb: 1 }}
                        >
                          {capitalizeFirstLetter(user.username)}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <MailRounded
                            sx={{
                              color: "rgba(255,255,255,0.8)",
                              fontSize: 18,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "rgba(255,255,255,0.8)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          icon={
                            <PersonRounded sx={{ color: "white !important" }} />
                          }
                          label={capitalizeFirstLetter(user.gender)}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            borderRadius: "100px",
                            "& .MuiChip-icon": { color: "white" },
                          }}
                        />
                        {/* <IconButton size="small" sx={{ color: 'white' }}>
                        <MoreVertRounded />
                      </IconButton> */}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          width: 48,
                          height: 48,
                        }}
                      >
                        {user.username.charAt(0)}
                      </Avatar>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            sx={{
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.1)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                            }}
                            onClick={() => handleOpenDialog(user.id)}
                          >
                            <EditRounded />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            sx={{
                              color: "white",
                              bgcolor: "rgba(255,255,255,0.1)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                            }}
                            onClick={() => handleUserDelete(user.id)}
                          >
                            <DeleteRounded />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
        {/* Pagination */}
        {/* <Pagination
          count={data?.pages || initialData?.pages || 1}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
        /> */}
      </Container>
      {reduxLoading || swrLoading ? (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      ) : null}
      <FormComponent
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        updatePassword={updatePassword}
        setUpdatePassword={setUpdatePassword}
        userId={selectedUserId}
        refetch={refetch}
        setUsers={setUsers}
      />
    </Box>
  );
};

export default UsersPage;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Button,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  Badge,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import Loader from "../components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setCustomers, appendCustomers } from "@/redux/features/customerSlice";
import { useGetCustomers, useModifyCustomer } from "@/hooks/customer";
import { useCreateTicket } from "@/hooks/ticket";
import { Utility } from "@/utils";

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [notificationsCount, setNotificationsCount] = useState<number>(4);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const { customer } = useSelector((state: RootState) => state.customer);
  const { decodedToken } = Utility();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleMenuClose();
  };

  const filteredCustomers = customer?.filter((val) =>
    val.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { data, refetch } = useGetCustomers(
    [],
    `get-loan-applications`,
    currentPage,
    pageSize
  );

  // Hook for modifying loan application is_picked column
  const { modifyCustomer: modifyCustomerApplication } = useModifyCustomer("update-loan-application");

  const { createTicket, error } = useCreateTicket("create-ticket", {});

  useEffect(() => {
    if (data?.success === true) {
      updateCustomerData(data.data);
    }
  }, [data, currentPage, pageSize, dispatch]);

  // Function to update customer data after refetching
  const updateCustomerData = (fetchedData) => {
    dispatch(setCustomers(fetchedData));

    const pages = Math.ceil(fetchedData.totalCount / pageSize);
    setTotalPages(pages > 0 ? pages : 1);
    setLoading(false);
    setPaginationLoading(false);
  };


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const offsetHeight = document.documentElement.offsetHeight;

      if (
        windowHeight + scrollTop >= offsetHeight - 50 &&
        currentPage < totalPages &&
        !paginationLoading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, totalPages, paginationLoading]);

  // Function to calculate the number of days ago
  const calculateDaysAgo = (date: string) => {
    const today = new Date();
    const addedDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCheckboxChange = async (contactId: number, applicationId: number) => {
    const isAlreadySelected = selectedContacts.includes(contactId);

    if (!isAlreadySelected) {
      try {
        await createNewTicket(applicationId);

        await modifyCustomerApplication(applicationId, {
          is_picked: 1,
        });
        await refetch();

        setSelectedContacts((prevSelectedContacts) => [
          ...prevSelectedContacts,
          contactId,
        ]);
      } catch (error) {
        console.log("Error in checkbox change:", error);
      }
    } else {
      // If already selected, remove the contactId from the selected contacts
      setSelectedContacts((prevSelectedContacts) =>
        prevSelectedContacts.filter((id) => id !== contactId)
      );
    }
  };

  // Function to create new ticket
  const createNewTicket = async (applicationId: number) => {
    try {
      await createTicket({
        customer_application_id: applicationId,
        user_id: decodedToken()?.id,
        status: "to do",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "black",
              whiteSpace: "nowrap",
            }}
          >
            Total Applications: {customer.length}
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          flexGrow={1}
          sx={{ borderRadius: "20px" }}
        >
          <TextField
            label="Search by Name"
            variant="filled"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "15vw",
              borderRadius: "20px",
              backgroundColor: "#fff",
              marginLeft: "auto",
              marginRight: "10px",

              "& .MuiInputLabel-root": {
                color: "black",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#1976d2",
                },
                "&:hover fieldset": {
                  borderColor: "#1a69fc",
                },
              },
            }}
          />
        </Box>
        <Box display="flex" alignItems="center">
          <Link href="/ticket" passHref>
            <Button
              variant="contained"
              sx={{
                width: "15vw",
                borderRadius: "12px",
                backgroundColor: "#fff",
                color: "black",
                fontSize: ".9rem",
                fontWeight: "400",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Show My Tickets
            </Button>
          </Link>
        </Box>
        <Box
          sx={{
            display: "flex",
            paddingLeft: "5px",
          }}
        ></Box>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit">
            <Badge badgeContent={notificationsCount} color="secondary">
              <NotificationsIcon
                sx={{
                  color: "white",
                }}
              />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuClick}>
            <Avatar
              alt="User Profile"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAquJnmjA9udSc7HSpxJzTAHepjHI-NS7iTA&s"
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>

          <Menu
            id="avatar-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {isLoggedIn ? (
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            ) : (
              <MenuItem onClick={handleLogin}>Login</MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      {loading && <Loader />}

      <Box
        sx={{
          height: "100vh",
          position: "relative",
          border: "2px solid red",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Grid container spacing={4} padding={2}>
          {filteredCustomers.map((contact) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={contact.Id}
              sx={{
                marginTop: "20px",
                border: "2px solid black",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  background: "linear-gradient(145deg, #f0f0f0, #dcdcdc)",
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    border: "none",
                    position: "relative",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar
                          alt={contact.Name}
                          src={contact.Image}
                          sx={{
                            width: 70,
                            height: 70,
                            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
                            // border: "2px solid #fff",
                          }}
                        />
                      </Grid>
                      <Grid item xs>
                        <Box display="flex" alignItems="center">
                          <PersonIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{
                              fontWeight: "bold",
                              color: "#1976d2",
                              fontSize: "18px",
                            }}
                          >
                            {contact.Name.toUpperCase()}
                          </Typography>
                        </Box>
                        <hr
                          style={{
                            border: "none",
                            height: "1px",
                            backgroundColor: "#ddd",
                            margin: "2px 0",
                            width: "100%",
                          }}
                        />

                        <Box display="flex" alignItems="center">
                          <EmailIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: "2px",
                              borderRadius: "4px",
                              marginTop: "2px",
                              fontSize: "15px",
                            }}
                          >
                            <span
                              style={{
                                color: "#1976d2",
                                fontSize: "16px",
                              }}
                            >
                              Email:
                            </span>{" "}
                            {contact.Email}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <PhoneIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: "2px",
                              borderRadius: "4px",
                              marginTop: "2px",
                              fontSize: "15px",
                            }}
                          >
                            <span
                              style={{
                                color: "#1976d2",
                                fontSize: "16px",
                              }}
                            >
                              Contact:
                            </span>{" "}
                            {contact.Contact}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: "2px",
                              borderRadius: "4px",
                              marginTop: "2px",
                              fontSize: "15px",
                            }}
                          >
                            <span
                              style={{
                                color: "#1976d2",
                                fontSize: "16px",
                              }}
                            >
                              Amount:
                            </span>{" "}
                            {contact.Amount}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: "2px",
                              borderRadius: "4px",
                              marginTop: "2px",
                              fontSize: "15px",
                            }}
                          >
                            <span
                              style={{
                                color: "#1976d2",
                                fontSize: "16px",
                              }}
                            >
                              Tenure:
                            </span>{" "}
                            {contact.Tenure} months
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                          <LocationOnIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: "2px",
                              borderRadius: "4px",
                              marginTop: "2px",
                              fontSize: "15px",
                            }}
                          >
                            <span
                              style={{
                                color: "#1976d2",
                                fontSize: "16px",
                              }}
                            >
                              Location:
                            </span>{" "}
                            {contact.Location}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#1976d2",
                        borderRadius: "6px",
                        padding: "4px 6px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#fff",
                        marginTop: "9px",
                      }}
                    >
                      <CalendarIcon
                        sx={{ marginRight: "4px", fontSize: "16px" }}
                      />
                      {calculateDaysAgo(contact.applicationDate)} days ago
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedContacts.includes(contact.Id)}
                          onChange={() =>
                            handleCheckboxChange(
                              contact.Id,
                              contact.applicationId
                            )
                          }
                          color="primary"
                          sx={{
                            "&.Mui-checked": {
                              color: "#2c3ce3",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 28,
                            },
                          }}
                        />
                      }
                      label="Pick"
                      sx={{
                        color: "#2c3ce3",
                      }}
                    />
                  </Box>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
        {(paginationLoading || loading) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
            }}
          >
            <Loader />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Home;

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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  setCustomers,
  appendCustomers,
  pickCustomer,
} from "@/redux/features/customerSlice";
import { useGetCustomers } from "@/hooks/customer";
import Loader from "../components/common/Loader";
import { useCreateTicket } from "@/hooks/ticket";

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
  const { customer, pickedCustomers } = useSelector(
    (state: RootState) => state.customer
  );

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

  const filteredCustomers = customer.filter((val) =>
    val.Name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

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

  const calculateDaysAgo = (date: string) => {
    const today = new Date();
    const addedDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const { data } = useGetCustomers(
    [],
    `/customer-applications/get-loan-applications`,
    currentPage,
    pageSize
  );

  const { createdTicket, createTicket, error } = useCreateTicket(
    "/api/v1/create-ticket", // The API endpoint
    {} // Initialize with empty object or default user data
  );

  useEffect(() => {
    if (data?.success === true) {
      const pickedCustomerIds = pickedCustomers.map((customer) => customer.Id);

      const filteredData = data.data.filter(
        (customer) => !pickedCustomerIds.includes(customer.Id)
      );

      if (currentPage === 1) {
        dispatch(setCustomers(filteredData));
      } else {
        dispatch(appendCustomers(filteredData));
      }

      const pages = Math.ceil(data.totalCount / pageSize);
      setTotalPages(pages > 0 ? pages : 1);
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [data, dispatch, currentPage, pageSize, pickedCustomers]);

  const handleCheckboxChange = async (contactId, applicationId) => {
    // Toggling the checkbox state and preparing for an API call if not already selected
    setSelectedContacts((prevSelectedContacts) => {
      const isAlreadySelected = prevSelectedContacts.includes(contactId);
      if (!isAlreadySelected) {
        // Call the create ticket API only if the checkbox is checked for the first time
        const createNewTicket = async (contactId, applicationId) => {
          try {
            console.log(
              "Creating ticket for:",
              contactId,
              "Application ID:",
              applicationId
            );
            const response = await createTicket({
              customer_application_id: applicationId,
              user_id: 1,
              forwarded_to: 1,
              status: "forwarded",
              due_date: new Date(),
            });
            console.log("Ticket created page:", response);
            dispatch(pickCustomer(contactId));
          } catch (error) {
            console.error("Error creating ticket:", error);

            alert("Error creating ticket. Please try again.");
          }
        };
        createNewTicket(contactId, applicationId);
      }
      // Toggle selection state
      return isAlreadySelected
        ? prevSelectedContacts.filter((id) => id !== contactId)
        : [...prevSelectedContacts, contactId];
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#eeeeee",
        padding: 2,
        overflow: "auto",
        width: "100%",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          padding: "10px 20px",
          background: "linear-gradient(to right, #5e0ecc, #1a69fc)",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.4)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          color: "white",
          zIndex: 1000,
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        <Box display="flex" alignItems="center">
          <img
            src="https://www.f2fintech.com/img/F2-Fintech-logoblack.png"
            alt="Logo"
            style={{ width: "70px", height: "60px", marginRight: "10px" }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "#fff",
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
        >
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "160px",
              marginTop: "6px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              marginLeft: "510px",

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
        <Box display="flex" alignItems="center" gap={2}>
          <Link href="/ticket" passHref>
            <Button
              variant="contained"
              sx={{
                width: "180px",
                marginTop: "6px",
                borderRadius: "12px",
                backgroundColor: "#fff",
                color: "black",
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
          paddingRight: "8px",
          position: "relative",
          marginTop: "60px",
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
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
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
                  <CardContent sx={{ paddingBottom: "8px", paddingTop: "8px" }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar
                          alt={contact.Name}
                          src={contact.Image}
                          sx={{
                            width: 70,
                            height: 70,
                            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
                            border: "2px solid #fff",
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
                            margin: "4px 0",
                          }}
                        />

                        <Box display="flex" alignItems="center">
                          <EmailIcon
                            sx={{ color: "#1976d2", marginRight: "8px" }}
                          />{" "}
                          {/* Add your EmailIcon here */}
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
                      bottom: "18px",
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

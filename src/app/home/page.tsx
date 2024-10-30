"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Grid,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import Loader from "../components/common/Loader";
import ApplicationCard from "../components/ticket/ApplicationCard";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setCustomers } from "@/redux/features/customerSlice";
import { useGetCustomers } from "@/hooks/customer";

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [notificationsCount, setNotificationsCount] = useState<number>(4);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const { customer } = useSelector((state: RootState) => state.customer);

  const { data } = useGetCustomers(
    [],
    `get-loan-applications`,
    currentPage,
    pageSize
  );

  const filteredCustomers = customer?.filter((val) =>
    val.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (data?.success === true) {
      updateCustomerData(data.data);
    } else {
      setLoading(false);
    }
  }, [data, currentPage, pageSize, dispatch]);

  // Function to update customer data after refetching
  const updateCustomerData = (fetchedData) => {
    dispatch(setCustomers(fetchedData));

    const pages = Math.ceil(fetchedData.totalCount / pageSize);
    setTotalPages(pages > 0 ? pages : 1);
    setLoading(false);
    // setPaginationLoading(false);

    if (fetchedData.data.length === 0) {
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      console.log("SCROLL");
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const offsetHeight = document.documentElement.offsetHeight;
      console.log("data", windowHeight, scrollTop, offsetHeight);
      if (
        windowHeight + scrollTop >= offsetHeight - 50 &&
        currentPage < totalPages &&
        !paginationLoading
      ) {
        console.log("SET CURRENT PAGE");
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, totalPages, paginationLoading]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
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
            padding: "0.1rem",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "black",
              whiteSpace: "nowrap",
              fontSize: "1.7rem",
            }}
          >
            Total Applications: {customer.length}
          </Typography>
          <TextField
            label="Search by name..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              backgroundColor: "#f2f2f2",
              marginLeft: "25vw",

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
                color: "black", // Label color
              },
            }}
          />
          <Link href="/ticket" passHref>
            <Button
              variant="contained"
              sx={{
                width: "15vw",
                borderRadius: "12px",
                backgroundColor: "#1565c0",
                color: "white",
                fontSize: ".9rem",
                fontWeight: "400",
              }}
            >
              Show My Tickets
            </Button>
          </Link>
        </Box>

        {loading && <Loader />}

        <Box
          sx={{
            minWidth: "80vw",
            minHeight: "90vh",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Grid container spacing={2} paddingLeft={7}>
            {filteredCustomers.map((contact) => (
              <ApplicationCard contact={contact} handleStartClick={undefined} />
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
    </>
  );
};

export default Home;

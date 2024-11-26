/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Grid,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import ApplicationCard from "../components/ticket/ApplicationCard";
import Loader from "../components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import type { Customer } from "@/types/customer";
import { setCustomers } from "@/redux/features/customerSlice";
import { useGetCustomers } from "@/hooks/customer";
import { Utility } from "@/utils";

const ITEMS_PER_PAGE = 6; // Number of items per page

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1); // For frontend pagination
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const { customer } = useSelector((state: RootState) => state.customer);
  const { decodedToken } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1000px)");

  const {
    value: data,
    error: getApplicationsError,
    swrLoading,
  } = useGetCustomers(
    {} as Customer,
    `get-loan-applications`,
    currentPage,
    ITEMS_PER_PAGE
  );

  // Function to update customer data after refetching
  const updateCustomerData = (fetchedData: Customer) => {
    dispatch(setCustomers(fetchedData));
    setPaginationLoading(false);
  };
  // Memoize the filtered customer list to optimize re-renders
  const filteredCustomers = useMemo(() => {
    return customer?.results?.filter((val) =>
      val.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customer?.results]);

  // Handle API response
  useEffect(() => {
    if (data) {
      updateCustomerData(data);
    } else if (getApplicationsError) {
      setPaginationLoading(false);
    } else {
      updateCustomerData(data);
      setPaginationLoading(false);
    }
  }, [data?.results, currentPage, getApplicationsError]);

  // Handle page change for pagination
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  return (
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
          width: isMobile ? "90vw" : isTab ? "70vh" : "80vw",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
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
            fontSize: isMobile ? "1rem" : isTab ? "1.7rem" : "2rem",
          }}
        >
          New Applications: {customer?.total || 0}
        </Typography>
        <TextField
          label="Search by name..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "#f2f2f2",
            marginLeft: isMobile ? "1vw" : isTab ? "" : "25vw",
            width: isMobile ? "80vw" : isTab ? "23vw" : "15vw",

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
              width: isMobile ? "20vw" : isTab ? "20vw" : "15vw",
              borderRadius: "12px",
              backgroundColor: "#1565c0",
              color: "white",
              fontSize: ".9rem",
              fontWeight: "400",
            }}
          >
            {decodedToken()?.role === "admin"
              ? "Show Tickets"
              : "Show My Tickets"}
          </Button>
        </Link>
      </Box>

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
          {!filteredCustomers?.length ? (
            <Typography>No Applications Found</Typography>
          ) : (
            filteredCustomers.map((contact, index) => (
              <ApplicationCard
                contact={contact}
                key={index}
                handleStartClick={undefined}
              />
            ))
          )}
        </Grid>
      </Box>

      <Pagination
        count={Math.ceil((customer?.total || 0) / ITEMS_PER_PAGE)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ mt: 4 }}
      />

      {swrLoading || paginationLoading ? <Loader /> : null}
    </Box>
  );
};

export default Home;

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Grid,
  Button,
  TextField,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";

import ApplicationCard from "../components/ticket/ApplicationCard";
import Loader from "../components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setCustomerApplications, resetCustomerApplications } from "@/redux/features/customerApplicationSlice";
import { useGetCustomerApplications } from "@/hooks/customerApplication";
import { Utility } from "@/utils";

const ITEMS_PER_PAGE = 6;

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const { customerApplication } = useSelector((state: RootState) => state.customerApplications);
  const dispatch: AppDispatch = useDispatch();
  const { decodedToken } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const {
    value: data,
    swrLoading,
    refetch,
  } = useGetCustomerApplications(
    'get-customer-loan-applications',
    currentPage,
    ITEMS_PER_PAGE
  );

  // Fetch and update state with new data
  useEffect(() => {
    if (data.results.length > 0) {
      dispatch(setCustomerApplications(data));
      setHasMoreData(data.results.length === ITEMS_PER_PAGE);
    } else {
      setHasMoreData(false);
    }
  }, [data, dispatch]);

  // Handle infinite scrolling
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !swrLoading &&
      hasMoreData
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [swrLoading, hasMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Filtered results based on search term
  const filteredCustomers = useMemo(() => {
    return customerApplication?.results.filter((customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customerApplication]);

  // Reset data on unmount
  useEffect(() => {
    return () => {
      (dispatch(resetCustomerApplications()) as unknown) as void;
    };
  }, [dispatch]);

  console.log(data, 'api data')
  console.log(customerApplication, 'redux data')

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
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        <Box
          sx={{
            height: "10vh",
            width: isMobile ? "40vw" : isTab ? "40vw" : "30vw",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: isMobile ? ".8rem" : isTab ? "1.9rem" : "1.8rem",
            }}
          >
            New Applications: {customerApplication?.count || 0}
          </Typography>
        </Box>
        <Box
          sx={{
            height: "10vh",
            width: isMobile ? "51vw" : isTab ? "40vw" : "30vw",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            ml: isMobile ? "" : isTab ? "10vw" : "18vw",
          }}
        >
          <TextField
            label="Search by name..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: isMobile ? "24vw" : isTab ? "18vw" : "12vw",
              fontSize: isMobile ? ".5rem" : isTab ? "1rem" : "",
            }}
          />
          <Link href="/ticket" passHref>
            <Button
              sx={{
                width: isMobile ? "20vw" : isTab ? "18vw" : "12vw",
                fontSize: isMobile ? ".5rem" : isTab ? "1rem" : "",
              }}
              variant="contained"
            >
              {decodedToken()?.role === "admin"
                ? "Show Tickets"
                : "Show My Tickets"}
            </Button>
          </Link>
        </Box>
      </Box>
      <Box sx={{ minWidth: "80vw", minHeight: "90vh" }}>
        <Grid container spacing={2}>
          {!filteredCustomers?.length ? (
            <Typography>No Applications Found</Typography>
          ) : (
            filteredCustomers.map((customerApplication) => (
              <ApplicationCard
                key={customerApplication.customerId}
                customerApplication={customerApplication}
                refetch={refetch}
              />
            ))
          )}
        </Grid>
        {swrLoading && <Loader />}
      </Box>
    </Box>
  );
};

export default Home;

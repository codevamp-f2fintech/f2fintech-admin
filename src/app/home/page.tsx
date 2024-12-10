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
import type { Customer } from "@/types/customer";
import { setCustomers } from "@/redux/features/customerSlice";
import { useGetCustomers } from "@/hooks/customer";
import { Utility } from "@/utils";

const ITEMS_PER_PAGE = 6;

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const dispatch: AppDispatch = useDispatch();
  const { customer } = useSelector((state: RootState) => state.customer);
  const { decodedToken } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const {
    value: data,
    error: getApplicationsError,
    swrLoading,
    refetch
  } = useGetCustomers(
    {} as Customer,
    `get-loan-applications`,
    currentPage,
    ITEMS_PER_PAGE
  );
  // Separate effect for data updates to isolate dispatching logic
  useEffect(() => {
    const updateCustomers = () => {
      if (data && data.results && data.results.length > 0) {
        // Combine existing results with new results if on a page after first
        const updatedResults =
          currentPage > 1
            ? [...(customer?.results || []), ...data.results]
            : data.results;
        const updatedCustomerData = {
          ...data,
          results: updatedResults,
        };
        dispatch(setCustomers(updatedCustomerData));
        // Update hasMoreData flag
        setHasMoreData(data.results.length === ITEMS_PER_PAGE);
        setPaginationLoading(false);
      } else if (data && data.results.length === 0) {
        // No more data found
        setHasMoreData(false);
        setPaginationLoading(false);
      } else if (getApplicationsError) {
        setPaginationLoading(false);
        setHasMoreData(false);
      }
    };

    // Use setTimeout to break potential sync update cycles
    const timeoutId = setTimeout(updateCustomers, 0);
    return () => clearTimeout(timeoutId);
  }, [data, getApplicationsError, dispatch, currentPage]);

  // Pagination scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !swrLoading &&
      !paginationLoading &&
      hasMoreData
    ) {
      setPaginationLoading(true);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [swrLoading, paginationLoading, hasMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const filteredCustomers = useMemo(() => {
    return customer?.results?.filter((val) =>
      val.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, customer?.results]);

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
            New Applications: {customer?.total || 0}
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
            filteredCustomers.map((customer) => (
              <ApplicationCard
                key={customer.Id}
                contact={customer}
                refetch={refetch}
              />
            ))
          )}
        </Grid>
        {!hasMoreData && filteredCustomers?.length > 0 && (
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            No more applications to load
          </Typography>
        )}
      </Box>
      {(swrLoading || paginationLoading) && <Loader />}
    </Box>
  );
};

export default Home;

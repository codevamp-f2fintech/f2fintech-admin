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
import { Utility } from "@/utils";

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);

  const dispatch: AppDispatch = useDispatch();
  const { customer } = useSelector((state: RootState) => state.customer);
  const { decodedToken } = Utility();

  const { data, error: getApplicationsError, swrLoading } = useGetCustomers(
    [],
    `get-loan-applications`,
    currentPage,
    pageSize
  );

  // Function to update customer data after refetching
  const updateCustomerData = (fetchedData) => {
    dispatch(setCustomers(fetchedData));
    if (fetchedData) {
      const pages = Math.ceil(fetchedData.totalCount / pageSize);
      setTotalPages(pages > 0 ? pages : 1);
      setPaginationLoading(false);
    }
  };

  const filteredCustomers = customer?.filter((val) =>
    val.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (data) {
      if (data.success) {
        updateCustomerData(data.data);
      } else {
        updateCustomerData(data.data);
        setPaginationLoading(false);
      }
    } else if (getApplicationsError) {
      setPaginationLoading(false);
    }
  }, [data, getApplicationsError]);

  useEffect(() => {
    const handleScroll = () => {
      console.log("SCROLL");
      const scrollTop = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const offsetHeight = document.documentElement.offsetHeight;
      if (
        windowHeight + scrollTop >= offsetHeight - 50 &&
        currentPage < totalPages &&
        !paginationLoading
      ) {
        console.log("SET CURRENT PAGE");
        setPaginationLoading(true);
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, totalPages, paginationLoading]);

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
          Total Applications: {filteredCustomers?.length || 0}
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
            )
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
            {decodedToken()?.role === 'admin' ? "Show Tickets" : "Show My Tickets"}
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
          {!filteredCustomers?.length ?
            null :
            filteredCustomers.map((contact, index) => (
              <ApplicationCard contact={contact} key={index} handleStartClick={undefined} />
            ))}
        </Grid>
        {/* {(paginationLoading || loading) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
            }}
          >
            <Loader />
          </Box>
        )} */}
      </Box>

      {swrLoading ? <Loader />
        : null}
    </Box>
  );
};

export default Home;

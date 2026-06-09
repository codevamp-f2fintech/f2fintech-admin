"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import {
  MagnifyingGlass as SearchIcon,
  Table as TableIcon,
  Cards as CardIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  EnvelopeSimple as EmailIcon,
  TrendUp as LoanIcon,
  Calendar as CalendarIcon,
  ArrowClockwise as RefreshIcon,
  Plus as PlusIcon,
} from "@phosphor-icons/react";
import { Utility } from "@/utils";
import { useGetLeads } from "@/hooks/leads";
import { setLeads, resetLeads } from "@/redux/features/leadsSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import Loader from "../components/common/Loader";

const LeadsPage: React.FC = () => {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const { debounceScroll, capitalizeFirstLetter } = Utility();

  const ITEMS_PER_PAGE = 10;

  const { leads: reduxLeads } = useSelector((state: RootState) => state.leads);
  const { leadsData, isLoading, refetch } = useGetLeads(currentPage, ITEMS_PER_PAGE, "get-all-leads");

  useEffect(() => {
    if (leadsData?.results?.length > 0) {
      dispatch(setLeads({
        ...leadsData,
        currentPage,
      }));
      setHasMoreData(leadsData.results.length === ITEMS_PER_PAGE);
    } else {
      setHasMoreData(false);
    }
  }, [leadsData?.results, leadsData, currentPage, dispatch]);

  const handleScroll = useCallback(
    debounceScroll(() => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
      if (nearBottom && !isLoading && hasMoreData) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }, 200),
    [isLoading, hasMoreData]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: "table" | "card" | null
  ) => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  const filteredLeads = useMemo(() => {
    const leadsToFilter = reduxLeads?.results || [];
    return leadsToFilter.filter((lead: any) =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact?.includes(searchTerm) ||
      lead.loan_category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reduxLeads, searchTerm]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, margin: "0 auto", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
          >
            Leads Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Managing and tracking all incoming leads in one place.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search leads..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 250, md: 300 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "background.paper",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} weight="bold" />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            sx={{
              bgcolor: "background.paper",
              p: 0.5,
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: 2,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            <ToggleButton value="table">
              <TableIcon size={20} weight="bold" style={{ marginRight: 8 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>TABLE</Typography>
            </ToggleButton>
            <ToggleButton value="card">
              <CardIcon size={20} weight="bold" style={{ marginRight: 8 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>CARDS</Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh Data">
            <IconButton
              onClick={() => refetch()}
              sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <RefreshIcon size={20} weight="bold" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content Section */}
      {isLoading && filteredLeads.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <Loader />
        </Box>
      ) : filteredLeads.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: "white",
            border: "1px solid #e2e8f0",
            gap: 2,
          }}
        >
          <SearchIcon size={60} color="#94a3b8" weight="regular" />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            No leads found
          </Typography>
        </Paper>
      ) : view === "table" ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#3949ab",
                  "& th": {
                    fontWeight: 600,
                    color: "white",
                    fontSize: "14px",
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                    py: 2,
                    "&:last-child": { borderRight: "none" }
                  },
                }}
              >
                <TableCell>S.No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Tenure</TableCell>
                <TableCell>Income</TableCell>
                <TableCell>Cibil Score</TableCell>
                <TableCell>Applied On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead: any, index: number) => (
                <TableRow
                  key={lead.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}>{lead.name || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#64748b" }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>{lead.email || "N/A"}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>{lead.phone || "N/A"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#64748b" }}>{lead.product || "N/A"}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: "#7e22ce", fontWeight: 700, fontSize: "14px" }}>
                      {lead.provider || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: "#059669", fontWeight: 700, fontSize: "14px" }}>
                      ₹{lead.amount || 0}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#64748b" }}>{lead.tenure_months ? `${lead.tenure_months} months` : "N/A"}</TableCell>
                  <TableCell sx={{ color: "#64748b" }}>₹{lead.declared_income || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#64748b" }}>{lead.cibil_band || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#64748b" }}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredLeads.map((lead: any) => (
              <Grid item xs={12} sm={6} lg={4} key={lead.id}>
                <Card
                  sx={{
                    borderRadius: 5,
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: "transparent",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                      borderColor: "primary.light",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "primary.main",
                          mr: 2,
                          boxShadow: "0 8px 16px rgba(10, 10, 150, 0.2)",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                        }}
                      >
                        {lead.name ? lead.name.charAt(0).toUpperCase() : <UserIcon size={28} weight="bold" />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {capitalizeFirstLetter(lead.name || "Unknown Lead")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {lead.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon size={18} color="#64748b" weight="bold" />
                        <Typography variant="body2">{lead.email || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon size={18} color="#64748b" weight="bold" />
                        <Typography variant="body2">{lead.phone || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LoanIcon size={18} color="#64748b" weight="bold" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {lead.product || "N/A"} -
                          <Box component="span" sx={{ color: 'primary.main', ml: 0.5 }}>₹{lead.amount || 0}</Box>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <CalendarIcon size={18} color="#64748b" weight="bold" />
                        <Typography variant="caption" color="text.secondary">
                          Created: {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load More Trigger */}
          {isLoading && hasMoreData && filteredLeads.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
                mt: 2,
              }}
            >
              <CircularProgress size={32} thickness={4} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LeadsPage;

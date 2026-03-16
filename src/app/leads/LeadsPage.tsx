"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
import { setLeads } from "@/redux/features/leadsSlice";
import useIntersectionObserver from "@/hooks/IntersectionObserver";
import type { RootState, AppDispatch } from "@/redux/store";

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

const EMPTY_ARRAY: any[] = [];

const LeadsPage: React.FC = () => {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const dispatch = useDispatch<AppDispatch>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef);

  const { leads: reduxLeads } = useSelector((state: RootState) => state.leads);
  const { leads: swrLeads, isLoading, refetch } = useGetLeads(EMPTY_ARRAY, "get-all-leads");
  const { capitalizeFirstLetter } = Utility();

  useEffect(() => {
    if (swrLeads && Array.isArray(swrLeads) && swrLeads !== reduxLeads) {
      dispatch(setLeads(swrLeads));
    } else if (swrLeads && !Array.isArray(swrLeads)) {
      if ((swrLeads as any).data && Array.isArray((swrLeads as any).data)) {
        dispatch(setLeads((swrLeads as any).data));
      } else {
        dispatch(setLeads(EMPTY_ARRAY));
      }
    }
  }, [swrLeads, reduxLeads, dispatch]);

  useEffect(() => {
    if (isIntersecting && !isLoading) {
      setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
    }
  }, [isIntersecting, isLoading]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
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
    const leadsToFilter = Array.isArray(reduxLeads) ? reduxLeads : EMPTY_ARRAY;
    return leadsToFilter.filter((lead: any) =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.loan_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.product?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reduxLeads, searchTerm]);

  const displayedLeads = useMemo(() => {
    return filteredLeads.slice(0, visibleCount);
  }, [filteredLeads, visibleCount]);

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
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : filteredLeads.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 6,
            bgcolor: "background.paper",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No leads found matching your criteria.
          </Typography>
        </Paper>
      ) : view === "table" ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 5,
            boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>S.No.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Product/Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loan Required</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tenure</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Income</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cibil Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedLeads.map((lead: any, index: number) => (
                <TableRow
                  key={lead.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{capitalizeFirstLetter(lead.name || "N/A")}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{lead.email || "N/A"}</Typography>
                      <Typography variant="caption" color="text.secondary">{lead.phone || "N/A"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lead.product || "N/A"}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{lead.requested_limit || 0}</TableCell>
                  <TableCell>{`${lead.tenure_months} months` || "N/A"}</TableCell>
                  <TableCell>₹{lead.verified_income || "N/A"}</TableCell>
                  <TableCell>{lead.cibil_band || "N/A"}</TableCell>
                  <TableCell>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayedLeads.map((lead: any) => (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{lead.id}
                          </Typography>
                          <Chip
                            label={lead.status || "Pending"}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: lead.status === "completed" ? "success.50" : "primary.50",
                              color: lead.status === "completed" ? "success.main" : "primary.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
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
                          {lead.loan_category || lead.product || "N/A"} -
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
          {visibleCount < filteredLeads.length && (
            <Box
              ref={loadMoreRef}
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

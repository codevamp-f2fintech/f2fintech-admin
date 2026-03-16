"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
} from "@mui/material";
import {
  MagnifyingGlass as SearchIcon,
  Table as TableIcon,
  Cards as CardIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  EnvelopeSimple as EmailIcon,
  Question as QueryIcon,
  Calendar as CalendarIcon,
  ArrowClockwise as RefreshIcon,
} from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { useGetQueries } from "@/hooks/queries";
import { setQueries } from "@/redux/features/queriesSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import useIntersectionObserver from "@/hooks/IntersectionObserver";

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

const EMPTY_ARRAY: any[] = [];

const QueriesPage: React.FC = () => {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const dispatch = useDispatch<AppDispatch>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(loadMoreRef);

  const { queries: reduxQueries } = useSelector((state: RootState) => state.queries);
  const { queries: swrQueries, isLoading, refetch } = useGetQueries(EMPTY_ARRAY, "get-all-queries");

  useEffect(() => {
    if (swrQueries && Array.isArray(swrQueries) && swrQueries !== reduxQueries) {
      dispatch(setQueries(swrQueries));
    } else if (swrQueries && !Array.isArray(swrQueries)) {
      // Handle nested data if necessary
      if ((swrQueries as any).data && Array.isArray((swrQueries as any).data)) {
        dispatch(setQueries((swrQueries as any).data));
      }
    }
  }, [swrQueries, reduxQueries, dispatch]);

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

  const filteredQueries = useMemo(() => {
    const queriesToFilter = Array.isArray(reduxQueries) ? reduxQueries : EMPTY_ARRAY;
    return queriesToFilter.filter((query: any) =>
      query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.number?.includes(searchTerm) ||
      query.query_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reduxQueries, searchTerm]);

  const displayedQueries = useMemo(() => {
    return filteredQueries.slice(0, visibleCount);
  }, [filteredQueries, visibleCount]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, margin: "0 auto" }}>
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
            Queries Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Managing and tracking all user queries in one place.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search queries..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 300 },
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
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
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
      ) : filteredQueries.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 6,
            bgcolor: "background.paper",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No queries found matching your criteria.
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
                <TableCell sx={{ fontWeight: 700 }}>Query Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedQueries.map((query: any, index: number) => (
                <TableRow
                  key={query.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, textTransform: "capitalize" }}>{query.name}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{query.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{query.number}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={query.query_type || "General"}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: 'primary.50', color: 'primary.main' }}
                    />
                  </TableCell>
                  <TableCell>{query.created_at ? new Date(query.created_at).toLocaleDateString() : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayedQueries.map((query: any) => (
              <Grid item xs={12} sm={6} lg={4} key={query.id}>
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
                        }}
                      >
                        <UserIcon size={28} weight="bold" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                          {query.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: #{query.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon size={18} color="#64748b" />
                        <Typography variant="body2">{query.email}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon size={18} color="#64748b" />
                        <Typography variant="body2">{query.number}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <QueryIcon size={18} color="#64748b" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {query.query_type || "General Query"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <CalendarIcon size={18} color="#64748b" />
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {query.created_at ? new Date(query.created_at).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load More Trigger */}
          {visibleCount < filteredQueries.length && (
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

export default QueriesPage;

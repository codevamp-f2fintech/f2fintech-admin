/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Box,
  Container,
  Grid,
  Avatar,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  MailRounded,
  AssignmentRounded,
  CalendarMonthRounded,
} from "@mui/icons-material";

import { Utility } from "@/utils";
import Toast from "../components/common/Toast";
import { AiLeadsAPI } from "../../apis/AiLeadsAPI";
import { RootState } from "@/redux/store";

const AiLeadsPage: React.FC = () => {
  const [ aiLeads, setAiLeads ] = useState<any[]>( [] );
  const [ loading, setLoading ] = useState<boolean>( false );

  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const dispatch = useDispatch();
  const { capitalizeFirstLetter, toastAndNavigate } = Utility();

  // ✅ Fetch AI Leads
  const getLeadsByAI = useCallback( async () => {
    try
    {
      setLoading( true );
      const response = await AiLeadsAPI.getAll();
      setAiLeads( response.data?.data || [] ); // Adjust for ResponseFormatter
    } catch ( err: any )
    {
      const errorMessage =
        err?.response?.data?.message ||
        "Error fetching AI leads. Please try again.";
      toastAndNavigate( dispatch, true, "error", errorMessage );
    } finally
    {
      setLoading( false );
    }
  }, [] );

  useEffect( () => {
    getLeadsByAI();
  }, [] );

  return (
    <Container sx={{ py: 1 }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
          textAlign: "center",
          color: "#0c66e4",
        }}
      >
        AI Generated Leads
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : aiLeads.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No AI Leads Found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {aiLeads.map( ( lead ) => (
            <Grid item xs={12} sm={6} md={4} key={lead.id}>
              <Fade in timeout={600}>
                <Card
                  sx={{
                    borderRadius: 4,
                    p: 2,
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%)",
                    boxShadow:
                      "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0,0,0,0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 8px 20px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <CardContent>
                    {/* Avatar and Name */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "#0c66e4",
                          width: 50,
                          height: 50,
                          fontWeight: 600,
                        }}
                      >
                        {lead.name?.charAt( 0 )?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {capitalizeFirstLetter( lead.name )}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#5f6c7b",
                            fontSize: "0.9rem",
                          }}
                        >
                          {lead.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Loan Type */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <AssignmentRounded
                        sx={{ fontSize: 18, color: "#5f6c7b" }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          color: "#333",
                          fontWeight: 500,
                        }}
                      >
                        {lead.loan_type
                          ? capitalizeFirstLetter( lead.loan_type )
                          : "N/A"}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <CalendarMonthRounded
                        sx={{ fontSize: 18, color: "#5f6c7b" }}
                      />
                      <Typography sx={{ fontSize: "0.85rem", color: "#5f6c7b" }}>
                        {lead.application_date
                          ? new Date( lead.application_date ).toLocaleDateString()
                          : "Date not available"}
                      </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Chip
                      label="AI Generated"
                      sx={{
                        bgcolor: "#e3f2fd",
                        color: "#0c66e4",
                        fontWeight: 600,
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ) )}
        </Grid>
      )}

      {/* Toast */}
      <Toast
        alerting={toast.toastAlert}
        message={toast.toastMessage}
        severity={toast.toastSeverity}
      />
    </Container>
  );
};

export default AiLeadsPage;

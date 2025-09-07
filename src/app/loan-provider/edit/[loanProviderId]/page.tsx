"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";

import PercentIcon from "@mui/icons-material/Percent";
import { ArrowBackRounded } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { Formik, Field, Form, ErrorMessage } from "formik";
import validationSchema from "../../validationSchema";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";

const initialValues = {
  max_tenure: "",
  min_amount: "",
  max_amount: "",
  country: "",
  title: "",
  description: "",
  short_description: "",
  long_description: "",
  charges: "",
  minimum_kyc: "",
  document_required: "",
  interest_rate: "",
};

const LoanFormPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loanProviderData, setLoanProviderData] = useState(initialValues);
  const [dataLoading, setDataLoading] = useState(false);
  const params = useParams();
  const loanProviderId = params?.loanProviderId;
  // Fetch application number and loan status using stored customer ID
  useEffect(() => {
    const fetchLoanProviderData = async () => {
      if (loanProviderId) {
        try {
          setDataLoading(true);
          const { data: response } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/get-loan-provider-by-id/${loanProviderId}`
          );

          // Correct condition - check statusCode instead of status
          if (response.statusCode === 200) {
            setLoanProviderData(response.data);
          } else {
            console.log("API returned non-success status:", response);
          }
        } catch (err) {
          console.log("Error fetching loan provider data:", err);
        } finally {
          setDataLoading(false);
        }
      }
    };
    fetchLoanProviderData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    delete values.is_home;
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/update-loan-provider/${loanProviderId}`;

      const { data: response } = await axios.put(url, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.statusCode === 200 || response?.status === "Success") {
        console.log("Update successful:", response);
        router.push("/loan-provider");
      } else {
        console.error("Update returned non-success:", response);
        console.error("Error updating loan provider:", response.message);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      sx={{ py: 4, backgroundColor: "white", borderRadius: "20px", px: 0 }}
    >
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h6" component="h1" fontWeight="bold" gutterBottom>
          Edit Loan Provider
        </Typography>
      </Box>

      <Formik
        enableReinitialize
        initialValues={loanProviderData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, handleChange, values, touched, errors }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Loan Provider Name */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Loan Provider Name"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  required
                />
              </Grid>
              {/* Country */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Country</InputLabel>
                  <Field
                    as={Select}
                    name="country"
                    value={values.country}
                    onChange={(e) => setFieldValue("country", e.target.value)}
                    required
                  >
                    {[
                      "India",
                      "United States",
                      "United Kingdom",
                      "Canada",
                      "Australia",
                      "Germany",
                      "France",
                      "China",
                      "Japan",
                      "Brazil",
                    ].map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage name="country" component="div" />
                </FormControl>
              </Grid>
              {/* Interest Rate */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Interest Rate"
                  name="interest_rate"
                  value={values.interest_rate}
                  onChange={handleChange}
                  error={touched.interest_rate && Boolean(errors.interest_rate)}
                  helperText={touched.interest_rate && errors.interest_rate}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2" color="text.secondary">
                          %
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Max Tenure */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Max Tenure"
                  name="max_tenure"
                  value={values.max_tenure}
                  onChange={handleChange}
                  required
                  error={touched.max_tenure && Boolean(errors.max_tenure)}
                  helperText={touched.max_tenure && errors.max_tenure}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2" color="text.secondary">
                          years
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Minimum Amount */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Minimum Amount"
                  name="min_amount"
                  type="number"
                  value={values.min_amount}
                  onChange={handleChange}
                  error={touched.min_amount && Boolean(errors.min_amount)}
                  helperText={touched.min_amount && errors.min_amount}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Maximum Loan Amount */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Maximum Loan Amount"
                  name="max_amount"
                  type="number"
                  value={values.max_amount}
                  onChange={handleChange}
                  error={touched.max_amount && Boolean(errors.max_amount)}
                  helperText={touched.max_amount && errors.max_amount}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Charges */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Charges"
                  name="charges"
                  value={values.charges}
                  onChange={handleChange}
                  error={touched.charges && Boolean(errors.charges)}
                  helperText={touched.charges && errors.charges}
                  required
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Description"
                  name="description"
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Grid>

              {/* Short Description */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Short Description"
                  name="short_description"
                  value={values.short_description}
                  onChange={handleChange}
                  error={
                    touched.short_description &&
                    Boolean(errors.short_description)
                  }
                  helperText={
                    touched.short_description && errors.short_description
                  }
                  required
                />
              </Grid>

              {/* Long Description */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Long Description"
                  name="long_description"
                  value={values.long_description}
                  onChange={handleChange}
                  error={
                    touched.long_description && Boolean(errors.long_description)
                  }
                  helperText={
                    touched.long_description && errors.long_description
                  }
                  required
                />
              </Grid>

              {/* Minimum KYC */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Minimum KYC"
                  name="minimum_kyc"
                  value={values.minimum_kyc}
                  onChange={handleChange}
                  error={touched.minimum_kyc && Boolean(errors.minimum_kyc)}
                  helperText={touched.minimum_kyc && errors.minimum_kyc}
                  required
                />
              </Grid>

              {/* Document Required */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Document Required"
                  name="document_required"
                  value={values.document_required}
                  onChange={handleChange}
                  error={
                    touched.document_required &&
                    Boolean(errors.document_required)
                  }
                  helperText={
                    touched.document_required && errors.document_required
                  }
                  required
                />
              </Grid>

              {/* Submit button */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 2,
                  ml: 10,
                }}
              >
                <Button
                  onClick={() => router.back()}
                  sx={{
                    bgcolor: "#0c66e4",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#0c66e4",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: "#0c66e4",
                    "&:hover": {
                      bgcolor: "#0c66e4",
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Changes"}
                </Button>
              </Box>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LoanFormPage;

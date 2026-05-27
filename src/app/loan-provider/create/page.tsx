"use client";

import React, { useState, useRef } from "react";
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
  IconButton,
} from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowBackRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Formik, Field, Form, ErrorMessage } from "formik";
import validationSchema from "../validationSchema"; // Import validation schema
import { useCreateLoanProvider } from "@/hooks/loanProvider";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { AddPhotoAlternate as AddPhotoAlternateIcon } from "@mui/icons-material";
import Image from "next/image";
import { axiosInstance } from "@/apis/config/axiosConfig";
import { getCompanyId } from "@/utils/cookies";

const LoanFormPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { createLoanProvider } = useCreateLoanProvider("create-loan-provider");

  // Initial form values
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
    home_image: "",
  };

  // Handle image upload
  const handleImageUpload = (file: File, setFieldValue) => {
    if (!file) return;

    // Create a temporary URL for the selected file
    const imageUrl = URL.createObjectURL(file);

    // Store the file and image URL in the state
    setFieldValue("home_image", imageUrl); // Set preview URL in Formik state
    setFieldValue("image_file", file); // Store the actual file object for upload
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    console.log("values", values);

    // If there's an image file, upload it to S3 first
    if (values.image_file) {
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append("document", values.image_file);
        formDataToUpload.append(
          "folder",
          `loan-provider/${values.image_file.name}`
        );

        const uploadResponse = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_WEB_URL}/upload-to-s3`,
          formDataToUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const uploadedImageUrl = uploadResponse.data.data;
        values.home_image = uploadedImageUrl;

        const dataToSend = {
          ...values,
        };

        // Remove the temporary image_file field
        delete dataToSend.image_file;

        await createLoanProvider(dataToSend);
        router.push("/loan-provider");
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      }
    } else {
      // If no image, proceed with creating the loan provider without an image
      const dataToSend = {
        ...values,
      };

      await createLoanProvider(dataToSend);
      router.push("/loan-provider");
    }

    setLoading(false);
  };

  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      color: "#0f172a",
      transition: "all 0.2s ease",
      alignItems: "center",
      "& .MuiInputBase-input": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "14px !important",
        fontSize: "14px",
        fontWeight: 500,
        color: "#0f172a",
      },
      "& .MuiSelect-select": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "14px !important",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#cbd5e1",
        borderWidth: "1px",
        transition: "all 0.2s ease",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#94a3b8",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3949ab",
        borderWidth: "2px",
      },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e2e8f0",
      },
      "&.Mui-disabled": {
        backgroundColor: "#f1f5f9 !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#475569",
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: "#ffffff",
      px: 0.5,
      "&.Mui-focused": {
        color: "#3949ab !important",
      },
    },
    "& .MuiInputAdornment-root": {
      color: "#3949ab !important",
      marginRight: "4px",
      display: "flex",
      alignItems: "center",
      "& *": { color: "#3949ab !important" },
    },
    "& .MuiSelect-icon": {
      color: "#64748b",
    },
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, sm: 6 },
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "900px" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => router.back()}
            sx={{
              color: "#64748b",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "100px",
              px: 3,
              py: 1,
              bgcolor: "rgba(100, 116, 139, 0.08)",
              "&:hover": { bgcolor: "rgba(100, 116, 139, 0.15)", color: "#0f172a" },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: "#1e293b", fontFamily: "'Inter', sans-serif", fontSize: "28px" }}>
            Create Loan Provider
          </Typography>
        </Box>

        <Box sx={{ bgcolor: "#ffffff", borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #e8edf5" }}>
          {/* Blue Top Banner */}
          <Box sx={{ height: "8px", bgcolor: "#3f50b5", width: "100%" }} />

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, values, touched, errors, dirty }) => (
                <Form>
                  <Box
                    sx={{
                      bgcolor: "#f8fafc",
                      borderRadius: 3,
                      p: { xs: 3, md: 4 },
                      border: "1px solid #f1f5f9",
                      mb: 4,
                      display: "grid",
                      gap: "24px",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
                    }}
                  >
                    {/* Loan Provider Name */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Loan Provider Name"
                      name="title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      sx={commonTextFieldStyles}
                    />

                    {/* Country */}
                    <Field
                      as={TextField}
                      select
                      fullWidth
                      label="*Country"
                      name="country"
                      value={values.country}
                      onChange={(e) => setFieldValue("country", e.target.value)}
                      error={touched.country && Boolean(errors.country)}
                      helperText={touched.country && errors.country}
                      sx={commonTextFieldStyles}
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

                    {/* Interest Rate */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Interest Rate Range(2-20)"
                      name="interest_rate"
                      error={touched.interest_rate && Boolean(errors.interest_rate)}
                      helperText={touched.interest_rate && errors.interest_rate}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PercentIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2" sx={{ color: "#3949ab", fontWeight: 600 }}>%</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Max Tenure */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Max Tenure Range(5-15)"
                      name="max_tenure"
                      error={touched.max_tenure && Boolean(errors.max_tenure)}
                      helperText={touched.max_tenure && errors.max_tenure}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2" sx={{ color: "#3949ab", fontWeight: 600 }}>years</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Minimum Amount */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Minimum Amount"
                      name="min_amount"
                      type="number"
                      error={touched.min_amount && Boolean(errors.min_amount)}
                      helperText={touched.min_amount && errors.min_amount}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyRupeeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Maximum Loan Amount */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Maximum Loan Amount"
                      name="max_amount"
                      type="number"
                      error={touched.max_amount && Boolean(errors.max_amount)}
                      helperText={touched.max_amount && errors.max_amount}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyRupeeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Charges */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Charges"
                      name="charges"
                      error={touched.charges && Boolean(errors.charges)}
                      helperText={touched.charges && errors.charges}
                      sx={commonTextFieldStyles}
                    />

                    {/* Description */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="Description"
                      name="description"
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      sx={commonTextFieldStyles}
                    />

                    {/* Short Description */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Short Description"
                      name="short_description"
                      error={touched.short_description && Boolean(errors.short_description)}
                      helperText={touched.short_description && errors.short_description}
                      sx={commonTextFieldStyles}
                    />

                    {/* Long Description */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Long Description"
                      name="long_description"
                      error={touched.long_description && Boolean(errors.long_description)}
                      helperText={touched.long_description && errors.long_description}
                      sx={commonTextFieldStyles}
                    />

                    {/* Minimum KYC */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Minimum KYC"
                      name="minimum_kyc"
                      error={touched.minimum_kyc && Boolean(errors.minimum_kyc)}
                      helperText={touched.minimum_kyc && errors.minimum_kyc}
                      sx={commonTextFieldStyles}
                    />

                    {/* Document Required */}
                    <Field
                      as={TextField}
                      fullWidth
                      label="*Document Required"
                      name="document_required"
                      error={touched.document_required && Boolean(errors.document_required)}
                      helperText={touched.document_required && errors.document_required}
                      sx={commonTextFieldStyles}
                    />

                    {/* Home Image Upload */}
                    <Box sx={{ gridColumn: { md: "span 2" } }}>
                      <Typography sx={{ mb: 1, fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                        Provider Logo / Image
                      </Typography>
                      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <Box
                          component="label"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed #cbd5e1",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            width: "160px",
                            height: "120px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#3949ab",
                              backgroundColor: "rgba(57, 73, 171, 0.04)",
                              "& .MuiSvgIcon-root": {
                                color: "#3949ab",
                              },
                            },
                          }}
                        >
                          <AddPhotoAlternateIcon sx={{ fontSize: "40px", color: "#94a3b8", mb: 1, transition: "color 0.2s ease" }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b" }}>Upload Photo</Typography>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, setFieldValue);
                            }}
                          />
                        </Box>

                        {values.home_image && (
                          <Box sx={{ position: "relative", width: "160px", height: "120px" }}>
                            <IconButton
                              onClick={() => {
                                if (values.home_image) URL.revokeObjectURL(values.home_image);
                                setFieldValue("home_image", "");
                                setFieldValue("image_file", null);
                              }}
                              sx={{
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                zIndex: 1,
                                width: "28px",
                                height: "28px",
                                "&:hover": { backgroundColor: "#fee2e2", color: "#ef4444" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: "16px" }} />
                            </IconButton>
                            <Box
                              component="img"
                              src={values.home_image}
                              alt="Preview"
                              sx={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions Footer */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, pt: 3, borderTop: "1px solid #e8edf5" }}>
                    <Button
                      onClick={() => router.back()}
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        borderRadius: "20px",
                        px: 4,
                        py: 1,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#f44336",
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        border: "none",
                        "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)", color: "#d32f2f", border: "none" }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !dirty}
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        borderRadius: "20px",
                        px: 4,
                        py: 1,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        border: "none",
                        color: (loading || !dirty) ? "#94a3b8" : "#ffffff",
                        bgcolor: (loading || !dirty) ? "#f1f5f9" : "#0c66e4",
                        "&:hover": {
                          bgcolor: (loading || !dirty) ? "#f1f5f9" : "#0052cc",
                          border: "none",
                        },
                        "&:disabled": {
                          color: "#94a3b8",
                          bgcolor: "#f1f5f9",
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Create Provider"}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoanFormPage;

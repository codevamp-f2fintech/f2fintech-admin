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
import PercentIcon from '@mui/icons-material/Percent';
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
import axios from "axios";

const LoanFormPage = () => {
  const router = useRouter();
  const [ loading, setLoading ] = useState( false );
  const { createLoanProvider } = useCreateLoanProvider( "create-loan-provider" );

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
  const handleImageUpload = ( file: File, setFieldValue ) => {
    if ( !file ) return;

    // Create a temporary URL for the selected file
    const imageUrl = URL.createObjectURL( file );

    // Store the file and image URL in the state
    setFieldValue( "home_image", imageUrl ); // Set preview URL in Formik state
    setFieldValue( "image_file", file ); // Store the actual file object for upload
  };

  // Handle form submission
  const handleSubmit = async ( values ) => {
    setLoading( true );
    console.log( "values", values );

    // If there's an image file, upload it to S3 first
    if ( values.image_file )
    {
      try
      {
        const formDataToUpload = new FormData();
        formDataToUpload.append( "document", values.image_file );
        formDataToUpload.append(
          "folder",
          `loan-provider/${ values.image_file.name }`
        );

        const uploadResponse = await axios.post(
          `${ process.env.NEXT_PUBLIC_WEB_URL }/upload-to-s3`,
          formDataToUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Once uploaded, update the formData with the uploaded image URL
        const uploadedImageUrl = uploadResponse.data.data;
        values.home_image = uploadedImageUrl; // Update the home_image with the S3 URL

        // Now create the loan provider
        await createLoanProvider( values );
        router.push( "/loan-provider" );
      } catch ( error )
      {
        console.error( "Error uploading image:", error );
      }
    } else
    {
      // If no image, proceed with creating the loan provider without an image
      await createLoanProvider( values );
      router.push( "/loan-provider" );
    }

    setLoading( false );
  };

  return (
    <Container sx={{ py: 4, backgroundColor: "white", borderRadius: "20px" }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h6" component="h1" fontWeight="bold" gutterBottom>
          Create Loan Provider
        </Typography>
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {( { setFieldValue, values, touched, errors } ) => (
          <Form>
            <Grid container spacing={3}>
              {/* Loan Provider Name */}
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  fullWidth
                  label="Loan Provider Name"
                  name="title"
                  error={touched.title && Boolean( errors.title )}
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
                    onChange={( e ) => setFieldValue( "country", e.target.value )}
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
                    ].map( ( country ) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ) )}
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
                  error={touched.interest_rate && Boolean( errors.interest_rate )}
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
                  required
                  error={touched.max_tenure && Boolean( errors.max_tenure )}
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
                  error={touched.min_amount && Boolean( errors.min_amount )}
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
                  error={touched.max_amount && Boolean( errors.max_amount )}
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
                  error={touched.charges && Boolean( errors.charges )}
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
                  error={touched.description && Boolean( errors.description )}
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
                  error={
                    touched.short_description &&
                    Boolean( errors.short_description )
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
                  error={
                    touched.long_description && Boolean( errors.long_description )
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
                  error={touched.minimum_kyc && Boolean( errors.minimum_kyc )}
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
                  error={
                    touched.document_required &&
                    Boolean( errors.document_required )
                  }
                  helperText={
                    touched.document_required && errors.document_required
                  }
                  required
                />
              </Grid>
              {/* Home Image */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    {/* Upload Icon with Label */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #ccc",
                        borderRadius: "8%",
                        width: "146px",
                        height: "104px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "border-color 0.3s ease, color 0.3s ease",
                        "&:hover": {
                          borderColor: "rgb(33, 38, 54)",
                          "& svg": {
                            color: "rgb(33, 38, 54)", // Darker icon color on hover
                          },
                        },
                      }}
                      component="label"
                      required
                    >
                      <AddPhotoAlternateIcon
                        sx={{
                          fontSize: "32px",
                          color: "#aaa",
                          mb: 1,
                          transition: "color 0.3s ease",
                        }}
                      />
                      <Typography variant="body2">Upload Photo</Typography>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={( e ) => {
                          const file = e.target.files?.[ 0 ];
                          if ( file )
                          {
                            handleImageUpload( file, setFieldValue ); // Handle image upload
                          }
                        }}
                      />
                    </Box>

                    {/* Display Selected File Preview */}
                    {values.home_image && (
                      <Box
                        sx={{
                          position: "relative",
                          width: "150px",
                          height: "106px",
                        }}
                      >
                        {/* Delete Icon */}
                        <IconButton
                          onClick={() => {
                            // Clean up preview URL only if it exists
                            if ( values.home_image )
                            {
                              URL.revokeObjectURL( values.home_image );
                            }
                            setFieldValue( "home_image", "" ); // Reset the preview
                            setFieldValue( "image_file", null ); // Reset the file
                          }}
                          sx={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            backgroundColor: "white",
                            zIndex: 1,
                            p: "4px",
                            "&:hover": {
                              color: "rgb(255, 102, 94)",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: "18px" }} />
                        </IconButton>

                        {/* Image Preview */}
                        <Box
                          component="img"
                          src={values.home_image} // Use the temporary URL for the preview
                          alt="Profile Preview"
                          sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "8px",
                            border: "1px solid #aaa",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </FormControl>
              </Grid>

              {/* Submit button */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  ml: "47vw",
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
                  {loading ? <CircularProgress size={24} /> : "Create Provider"}
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

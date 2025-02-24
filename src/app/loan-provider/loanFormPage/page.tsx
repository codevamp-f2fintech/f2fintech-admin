"use client";

import React, { useState } from "react";
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
import { ArrowBackRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useCreateLoanProvider } from "@/hooks/loanProvider";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AddPhotoAlternate as AddPhotoAlternateIcon } from "@mui/icons-material"; 

const LoanFormPage = () => {
  const router = useRouter();
  const [ loading, setLoading ] = useState( false );
  const { createLoanProvider } = useCreateLoanProvider( "create-loan-provider" );

  const [ formData, setFormData ] = useState( {
    interestRate: "",
    maxLoanAmount: "",
    maxTenure: "",
    minAmount: "",
    isHome: "",
    homeImage: "",
    title: "",
    description: "",
    shortDescription: "",
    longDescription: "",
    charges: "",
    minimumKyc: "",
    documentReq: "",
  } );

  const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const { name, value } = e.target;
    setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) );
  };

  const handleSelectChange = ( e: SelectChangeEvent ) => {
    const { name, value } = e.target;
    setFormData( ( prev ) => ( { ...prev, [ name ]: value } ) );
  };

  const handleSubmit = async ( e: React.FormEvent ) => {
    e.preventDefault();
    setLoading( true );
    const res = await createLoanProvider( formData );
    console.log( "loan prov res", res );
    setLoading( false );
  };

  return (
    <Container sx={{ py: 4}}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Create Loan Provider
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Interest Rate */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              value={formData.interestRate}
              onChange={handleInputChange}
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
            <TextField
              fullWidth
              label="Maximum Loan Amount"
              name="maxLoanAmount"
              type="number"
              value={formData.maxLoanAmount}
              onChange={handleInputChange}
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

          {/* Max Tenure */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Tenure"
              name="maxTenure"
              type="number"
              value={formData.maxTenure}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Minimum Amount */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Amount"
              name="minAmount"
              type="number"
              value={formData.minAmount}
              onChange={handleInputChange}
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

          {/* Title */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Short Description */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Short Description"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Long Description */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Long Description"
              name="longDescription"
              value={formData.longDescription}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Charges */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Charges"
              name="charges"
              value={formData.charges}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Minimum KYC */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum KYC"
              name="minimumKyc"
              value={formData.minimumKyc}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Document Required */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Document Required"
              name="documentReq"
              value={formData.documentReq}
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Is Home Loan */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Is Home Loan?</InputLabel>
              <Select
                label="Is Home Loan?"
                name="isHome"
                value={formData.isHome}
                onChange={handleSelectChange}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Home Image */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px dashed #cccccc",
                  borderRadius: "8px",
                  padding: 2,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "border-color 0.3s ease",
                  width: "10vw",
                  "&:hover": {
                    borderColor: "#f06292", // Border color on hover
                  },
                }}
                component="label"
              >
                {/* Icon for image upload */}
                <AddPhotoAlternateIcon
                  sx={{
                    fontSize: "48px",
                    color: "#cccccc",
                    mb: 1,
                    transition: "color 0.3s ease",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#cccccc" }}>
                  Upload image
                </Typography>
                {/* File input */}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={( e ) => {
                    const file = e.target.files?.[ 0 ];
                    if ( file )
                    {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData( ( prev ) => ( {
                          ...prev,
                          homeImage: reader.result as string, // Store Base64 or File URL
                        } ) );
                      };
                      reader.readAsDataURL( file );
                    }
                  }}
                />
              </Box>

              {/* Image Preview */}
              {formData.homeImage && (
                <Box
                  mt={2}
                  display="flex"
                  justifyContent="center"
                  sx={{
                    border: "1px solid #ddd",
                    padding: 1,
                    borderRadius: "8px",
                    height: "30vh"
                  }}
                >
                  <img
                    src={formData.homeImage}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </FormControl>
          </Grid>


        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{
              bgcolor: "#f06292",
              color: "white",
              "&:hover": {
                bgcolor: "#9D50BB",
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
              bgcolor: "#f06292",
              "&:hover": {
                bgcolor: "#9D50BB",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Provider"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoanFormPage;

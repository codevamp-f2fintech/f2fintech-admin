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
  SelectChangeEvent,
} from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const LoanFormPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/loan-provider");
    }, 2000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Create
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              value={formData.interestRate}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Loan Amount"
              name="maxLoanAmount"
              type="number"
              value={formData.maxLoanAmount}
              onChange={handleInputChange}
              required
            />

          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Tenure"
              name="maxTenure"
              type="number"
              value={formData.maxTenure}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Amount"
              name="minAmount"
              type="number"
              value={formData.minAmount}
              onChange={handleInputChange}
              required
            />
          </Grid>
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Home Image"
              name="homeImage"
              value={formData.homeImage}
              onChange={handleInputChange}
              required
            />
          </Grid>
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

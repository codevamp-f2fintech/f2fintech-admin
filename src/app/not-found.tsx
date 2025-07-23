"use client";
import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function Simple404Page() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // background: "linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center">
          {/* 404 Number - Simple and Clean */}
          <Box mb={8} position="relative">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "7rem", md: "8rem" },
                fontWeight: 800,
                color: "grey.200",
                mb: 2,
                userSelect: "none",
              }}
            >
              404
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,

                fontSize: { xs: "7rem", md: "8rem" },
                fontWeight: 800,
              }}
            >
              404
            </Box>
          </Box>

          {/* Error Message */}
          <Box mb={8}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.5rem", md: "3rem" },
                fontWeight: 700,
                color: "grey.800",
                mb: 3,
              }}
            >
              Page not found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "grey.600",
                fontSize: { xs: "1.125rem", md: "1.25rem" },
                maxWidth: "lg",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Sorry, we couldn't find the page you're looking for. It might have
              been moved, deleted, or you entered the wrong URL.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mb={8}
          >
            <Button
              onClick={handleGoHome}
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 1,
              }}
            >
              Go to homepage
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 1,
                borderColor: "grey.300",
                color: "grey.700",
                bgcolor: "white",
                "&:hover": {
                  bgcolor: "grey.50",
                },
              }}
            >
              Go back
            </Button>
          </Stack>

          {/* Help Section */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              boxShadow: 1,
              border: "1px solid",
              borderColor: "grey.200",
              p: 4,
              maxWidth: "md",
              mx: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 500, color: "grey.800", mb: 3 }}
            >
              Need help?
            </Typography>
            <Stack spacing={2}>
              <Link
                href="#"
                color="grey.600"
                underline="hover"
                sx={{ "&:hover": { color: "primary.main" } }}
              >
                Search our site
              </Link>
              <Link
                href="#"
                color="grey.600"
                underline="hover"
                sx={{ "&:hover": { color: "primary.main" } }}
              >
                Contact support
              </Link>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

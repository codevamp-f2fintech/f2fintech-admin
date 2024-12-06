"use client";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Unauthorised: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        textAlign: "center",
        width: "90vw",
      }}
    >
      <Box
        sx={{
          flex: 1.5,
          height: "100%",
          position: "relative",
        }}
      >
        <Image
          src="/un.png"
          alt="Unauthorized Access"
          layout="fill"
          objectFit="cover"
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Typography
          variant="h4"
          color="error"
          sx={{ fontWeight: "700", lineHeight: "5rem" }}
          gutterBottom
        >
          Unauthorized Access
        </Typography>
        <Typography variant="body1" color="black" sx={{ mb: 4 }}>
          You don’t have permission to view this page. Please log in with the
          correct account or contact the administrator.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGoHome}
          sx={{ width: "15vw" }}
        >
          Go Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorised;

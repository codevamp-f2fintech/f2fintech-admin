"use client";
import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Utility } from "@/utils";

const Unauthorised: React.FC = () => {
  const router = useRouter();
  const { decodedToken } = Utility();

  const handleGoHome = () => {
    const role = decodedToken?.role;
    if (role === "super admin") {
      router.push("/company");
    } else if (role === "credit") {
      router.push("/ticket");
    } else if (role === "sales") {
      router.push("/home");
    } else {
      router.push("/");
    }
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
          sx={{ width: "15vw", mt: 2 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorised;

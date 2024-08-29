"use client";
import React from "react";
import { Box, keyframes } from "@mui/material";
import { styled } from "@mui/system";

const rotateAnimation = keyframes`
  0%, 40% { transform: rotate(0); }
  80%, 100% { transform: rotate(0.5turn); }
`;

const translateAnimation = keyframes`
  80%, 100% { transform: translate(calc(var(--s, 1) * 14px)); }
`;

// Styled component for loader
const LoaderContainer = styled(Box)({
  width: "60px",
  height: "16px",
  display: "flex",
  justifyContent: "space-between",
  animation: `${rotateAnimation} 2s infinite alternate`,
  "&::before, &::after": {
    content: '""',
    width: "16px",
    height: "16px",
    background: "#3FB8AF",
    animation: `${translateAnimation} 1s infinite alternate`,
  },
  "&::after": {
    background: "#FF3D7F",
    "--s": "-1",
  },
});

// Styled component for the background container
const BackgroundContainer = styled(Box)({
  background: "#FFFFFF",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "fixed",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  bgcolor: "rgba(255, 255, 255, 0.8)",
});
const Loader: React.FC = () => {
  return (
    <BackgroundContainer>
      <LoaderContainer />
    </BackgroundContainer>
  );
};

export default Loader;

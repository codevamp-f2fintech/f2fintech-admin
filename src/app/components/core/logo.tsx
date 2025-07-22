"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import { NoSsr } from "@/app/components/core/no-ssr";

const DEFAULT_HEIGHT = 60;
const DEFAULT_WIDTH = 40;

export interface LogoProps {
  height?: number;
  width?: number;
  collapsed?: boolean;
}

export function Logo({
  collapsed,
}: // width = DEFAULT_WIDTH,
LogoProps): React.JSX.Element {
  const url = "/img/f2Fintechlogo.png"; // Path to your image

  return (
    <Box
      alt="logo"
      component="img"
      src={url}
      sx={{
        height: collapsed ? "7vh" : "16vh",
        width: collapsed ? "7vw" : "50vw",
        objectFit: "contain",
        borderRadius: "10px",
        backgroundColor: "#deebff",
      }}
    />
  );
}

export interface DynamicLogoProps {
  height?: number;
  width?: number;
}

export function DynamicLogo({
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();

  return (
    <NoSsr
      fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}
    >
      <Logo height={height} width={width} {...props} />
    </NoSsr>
  );
}

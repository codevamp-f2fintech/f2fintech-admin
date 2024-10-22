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
        background:
          "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
        borderRadius: "10px",
        "&:hover": {
          transform: "scale(1.1)",
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
        },
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

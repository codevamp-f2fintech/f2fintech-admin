import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { SxProps } from "@mui/material/styles";

export interface BudgetProps {
  name: string;
  sx?: SxProps;
  value: number | string;
  amount?: number | null | undefined;
  Icon: any;
  iconColor?: string;
  iconBgColor?: string;
}

export function Budget ( {
  name,
  sx,
  value,
  amount,
  Icon,
  iconColor = "#fff",
  iconBgColor = "#3f51b5",
}: BudgetProps ): React.JSX.Element {
  const hasAmount = amount !== null && amount !== undefined;
  return (
    <Card
      sx={{
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        padding: "12px",
        height: "130px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        position: "relative",
        transition: "all 150ms ease",
        willChange: "transform",
        ":hover": {
          transform: "scale(1.015)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
        ...sx,
      }}
    >

      {/* Header - Fixed height */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        height: "40px",
        flexShrink: 0
      }}>
        <Avatar
          sx={{
            backgroundColor: iconBgColor,
            color: iconColor,
            height: 32,
            width: 32,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            flexShrink: 0
          }}
        >
          {Icon && React.createElement( Icon, { sx: { fontSize: 18 } } )}
        </Avatar>

        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "text.secondary",
            lineHeight: 1.2,
            flex: 1,
          }}
        >
          {name}
        </Typography>
      </Box>

      {/* Content Area - Flexible but constrained */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 0.5
      }}>
        {/* Main Count */}
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111",
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>

        {/* Amount - Smaller text to fit */}
        {hasAmount && (
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#666",
              lineHeight: 1.9,
            }}
          >
            ₹{new Intl.NumberFormat( "hi-IN" ).format( amount )}
          </Typography>
        )}
      </Box>

    </Card>
  );
}

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

export interface BudgetProps {
  name: string;
  sx?: SxProps;
  value: number | string;
  amount?: number | null | undefined;
  Icon: any;
  setDate?: ( date: string ) => void;
  iconColor?: string;
  iconBgColor?: string;
}

const formatAmountInIndianStyle = ( amount: string | number ) => {
  const number = parseFloat( amount );
  return new Intl.NumberFormat( 'hi-IN' ).format( number );
};

export function Budget ( {
  name,
  sx,
  value,
  amount,
  Icon,
  setDate,
  iconColor = "#ffffff",
  iconBgColor = "#1976d2",
}: BudgetProps ): React.JSX.Element {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery( theme.breakpoints.down( "sm" ) );

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        height: "100%",
        minHeight: "140px",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        },
        ...sx
      }}
    >
      <Box sx={{ ml: "1vw", mt: "1vh" }}>
        <Avatar
          sx={{
            backgroundColor: "white",
            color: "black",
            height: "45px",
            width: "45px",
          }}
        >
          {Icon && React.createElement( Icon, { sx: { fontSize: 20 } } )}
        </Avatar>
      </Box>
      <CardContent sx={{
        padding: isSmallScreen ? "12px" : "16px",
        height: "100%",
        boxSizing: "border-box"
      }}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <Box sx={{ diaplay: "flex", flexDirection: "column" }}>
            <Tooltip title={name} placement="top" arrow>
              <Typography
                color="text.secondary"
                variant="overline"
                fontSize={isSmallScreen ? "0.7rem" : "0.8rem"}
                fontWeight={600}
                sx={{
                  letterSpacing: "0.5px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3
                }}
              >
                {name}
              </Typography>
            </Tooltip>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontSize: isSmallScreen ? "1.8rem" : "2.2rem",
              marginTop: "4px",
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1.2,
              wordBreak: "break-word"
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0 }}>

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: 2
          }}>
            <Box sx={{ flex: 1 }} />

            <Box sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "left",
              gap: 2,
              width: "30vw",
            }}>
              {amount !== null && amount !== undefined && (
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: isSmallScreen ? "1.2rem" : "1.4rem",
                    fontWeight: "bold",
                    color: theme.palette.mode === "dark" ? "primary.light" : "primary.dark",
                    whiteSpace: "nowrap"
                  }}
                >
                  &#8377;{formatAmountInIndianStyle( amount )}
                </Typography>
              )}

            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { SxProps } from "@mui/material/styles";
import { getIconColors } from "@/utils/iconColors";
import useMediaQuery from "@mui/material/useMediaQuery";

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
  const isDesktop = useMediaQuery( "(min-width:900px)" );
  return (
    <Card
      sx={{
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        padding: "12px",
        height: isDesktop ? "50vh" : "auto",
        minHeight: { xs: "120px", sm: "130px", md: "50vh" },

        // 📱 Small Mobile
        "@media (max-width: 360px)": {
          padding: "10px",
          height: "12vh",
          gap: 0.5,
          borderRadius: "10px",
        },

        // 📱 iPad & Tablets
        "@media (min-width: 1024px) and (max-width: 1366px)": {
          height: "10vh",
          padding: "14px",
          gap: 1.2,
        },

        // 💻 Laptop & Desktop — INCREASE HEIGHT HERE
        "@media (min-width: 1280px)": {
          height: "20vh",    // 🔥 You can make 70vh or 80vh also
        },

        ...sx,
      }}
    >
      {/* Header - Flexible height on mobile */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 1.5 },
        minHeight: { xs: "32px", sm: "40px" },
        flexShrink: 0,
      }}>

        <Avatar
          sx={{
            backgroundColor: iconBgColor,
            color: iconColor,
            height: { xs: 28, sm: 32 },
            width: { xs: 28, sm: 32 },
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            flexShrink: 0,
            mb: {
              xs: 5, sm: 0, md: 0, lg: 0
            }
          }}
        >
          {Icon && React.createElement( Icon, { sx: { fontSize: { xs: 16, sm: 18 } } } )}
        </Avatar>
        <Typography
          sx={{
            fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" },
            fontWeight: 600,
            color: "text.secondary",
            lineHeight: 1.3,
            flex: 1,

            // Mobile: wrap to multiple lines (NO truncation)
            // Desktop: single line with ellipsis

            whiteSpace: { xs: "normal", md: "nowrap" },
            overflow: { xs: "visible", md: "hidden" },
            textOverflow: { xs: "clip", md: "ellipsis" },
            wordBreak: "break-word",

            // ⭐ MOST IMPORTANT — wrap enable on mobile
            width: { xs: "20vw", md: "auto" },
            height: { xs: "10vh", md: "auto" },


            "@media (max-width: 375px)": {
              fontSize: "0.7rem",
              lineHeight: 1.2,
            }
          }}
        >
          {name}
        </Typography>
      </Box>

      {/* Content Area - Better spacing on mobile */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 0.25, sm: 0.5 },
        py: { xs: 0.5, sm: 1 },
        position: {
          xs: 'relative',
          md: 'inherit',
          lg: 'inherit',
          sm: 'inherit',
          marginTop: "10px"
        },
      }}>
        {/* Main Count */}
        <Typography
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
            fontWeight: 700,
            color: "#111",
            lineHeight: 1.1,
            marginRight: '15px'
          }}
        >
          {value}
        </Typography>

        {/* Amount */}
        {hasAmount && (
          <Typography
            sx={{
              fontSize: { xs: "0.65rem", sm: "0.95rem", md: "1rem" },
              fontWeight: 600,
              color: "#666",
              lineHeight: 1.2,
              position: {
                xs: 'absolute',
                md: 'inherit',
                lg: 'inherit',
                sm: 'inherit',

              }, right: {
                xs: '50px',
                md: 'inheirit',
                lg: 'inherit'
              }

            }}
          >
            ₹{new Intl.NumberFormat( "hi-IN" ).format( amount )}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
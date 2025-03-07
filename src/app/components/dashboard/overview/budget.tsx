import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export interface BudgetProps {
  name: string;
  sx?: SxProps;
  value: string;
  Icon: any; // Changed from string to any to accept a component
  setDate?: ( date: string ) => void;
}

export function Budget ( {
  name,
  sx,
  value,
  Icon,
  setDate,
}: BudgetProps ): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        height: "100%",
        ...sx
      }}
    >
      <CardContent sx={{ padding: "16px" }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            height: "100%"
          }}
        >
          <Stack spacing={1}>
            <Typography
              color="inherit"
              variant="overline"
              fontSize="0.8rem"
              fontWeight= { 600 }
              sx={{ }}
            >
              {name}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontSize: "2.5rem",
                marginTop: "8px",
                fontWeight: 500
              }}
            >
              {value}
            </Typography>
          </Stack>
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
        </Stack>
      </CardContent>
    </Card>
  );
}
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
  amount: any;
  Icon: any; // Changed from string to any to accept a component
  setDate?: (date: string) => void;
}

const formatAmountInIndianStyle = (amount: string) => {
  const number = parseFloat(amount);
  return new Intl.NumberFormat('hi-IN').format(number);
};

export function Budget({
  name,
  sx,
  value,
  amount,
  Icon,
  setDate,
}: BudgetProps): React.JSX.Element {
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
          spacing={2}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            height: "100%"
          }}
        >
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Typography
              color="inherit"
              variant="overline"
              fontSize="0.8rem"
              fontWeight={600}
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

          <Stack
            direction="column"
            spacing={1}
            alignItems="flex-end"
          >
            <Avatar
              sx={{
                backgroundColor: "white",
                color: "black",
                height: "45px",
                width: "45px",
              }}
            >
              {Icon && React.createElement(Icon, { sx: { fontSize: 20 } })}
            </Avatar>
            {amount !== null && amount !== undefined && (
              <Typography
                variant="h5"
                sx={{
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                &#8377;{formatAmountInIndianStyle(amount)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card >
  );
}
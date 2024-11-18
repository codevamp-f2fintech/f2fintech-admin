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
  Icon: string;
}

export function Budget({ name, sx, value, Icon }: BudgetProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={3}>
              <Typography color="white" variant="overline" fontSize="0.9rem">
                {name}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "white",
                color: "black",
                height: "45px",
                width: "45px",
              }}
            >
              {Icon && <Icon sx={{ fontSize: 20 }} />}
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

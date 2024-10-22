import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";

export interface BudgetProps {
  name: string;
  sx?: SxProps;
  value: string;
}

export function Budget({ name, sx, value }: BudgetProps): React.JSX.Element {
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
              <Typography color="black" variant="overline" fontSize="0.9rem">
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
              <UsersIcon fontSize="1.3rem" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
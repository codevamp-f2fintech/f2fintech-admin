import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { Bolt as BoltIcon } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { Utility } from "@/utils";

interface HistoryProps {
  ticketHistory: Array<{
    id: number;
    ticket_id: number;
    action: string;
    created_at: string;
  }>;
}

const History: React.FC<HistoryProps> = ({ ticketHistory }) => {
  const { capitalizeFirstLetter } = Utility();
  return (
    <Box
      sx={{
        height: "30vh",
        overflowY: "auto",
        padding: "10px",
        borderRadius: "8px",
        "&::-webkit-scrollbar": {
          display: "none", // This hides the scrollbar
        },
      }}
    >
      {ticketHistory.length ? (
        ticketHistory.map((history) => {
          const dateObj = new Date(history.created_at);
          const capitalizedAction = capitalizeFirstLetter(
            history.action.replace(/<\/?[^>]+(>|$)/g, "")
          );

          return (
            <React.Fragment key={history.id}>
              <Divider sx={{ my: 1 }} />
              <Box mt={1} display="flex">
                <BoltIcon
                  fontSize="small"
                  sx={{
                    color: "#2c3ce3",
                    marginRight: "1vw",
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    width: "32vw",
                    color: "white",
                  }}
                >
                  {capitalizedAction}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    ml: "3vw",
                    color: "cyan",
                  }}
                >
                  {format(dateObj, "dd MMM yyyy HH:mm")} (
                  {formatDistanceToNow(dateObj)} ago)
                </Typography>
              </Box>
            </React.Fragment>
          );
        })
      ) : (
        <Typography
          variant="body2"
          mt={2}
          sx={{
            textAlign: "center",
            color: "white",
          }}
        >
          No history
        </Typography>
      )}
    </Box>
  );
};

export default History;

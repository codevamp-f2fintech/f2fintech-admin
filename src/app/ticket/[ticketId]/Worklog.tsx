import { Box, Typography, Paper } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDistanceToNow } from "date-fns";

import { Utility } from "@/utils";
import { TicketLogsData } from "@/types/ticketLogs";
import { User } from "@/types/user";

interface WorkLogListProps {
  userData: User;
  workLog: TicketLogsData;
}

const WorkLogList: React.FC<WorkLogListProps> = ({ userData, workLog }) => {
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
      {workLog?.length ? (
        workLog.map((log) => {
          const loggedBy = userData?.data?.results.find(
            (user) => user.id == log.user_id
          );
          return (
            <Paper
              key={log.id}
              elevation={3}
              sx={{
                padding: ".5rem",
                marginBottom: "1vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f5f8fa", // Light Gray
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                marginBottom=".5rem"
                padding=".5rem"
              >
                <Typography fontWeight="bold" sx={{ mr: "1vw" }}>
                  {capitalizeFirstLetter(loggedBy?.username)}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: "0.85rem",
                    mr: "20VW",
                  }}
                >
                  logged <b>{log.time_spent}</b>
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: ".8rem",
                  }}
                >
                  {formatDistanceToNow(new Date(log.created_at))} ago
                </Typography>
              </Box>

              {/* Work description */}
              <Typography
                sx={{
                  margin: "10px 18px 0 20px",
                  color: "#333",
                  padding: "10px",
                  backgroundColor: "#E8F0FE", // Lighter blue background
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              >
                {capitalizeFirstLetter(log.work_description)}
              </Typography>
            </Paper>
          );
        })
      ) : (
        <Box
          mt={2}
          mb={3}
          p={3}
          borderRadius={2}
          bgcolor="background.paper"
          boxShadow={3}
          textAlign="center"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            background: "linear-gradient(to right, #f5f5f5, #e0e0e0)",
            width: "300px",
            height: "100px",
            margin: "auto",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 40, mb: 0 }} />
          <Typography variant="body2" mt={2} sx={{ padding: "0 10px" }}>
            No work has been logged for this issue
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkLogList;

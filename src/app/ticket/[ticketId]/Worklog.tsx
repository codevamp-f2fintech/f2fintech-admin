import { Box, Typography, Paper, useMediaQuery, useTheme } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDistanceToNow } from "date-fns";

import { Utility } from "@/utils";
import { TicketLogsData } from "@/types/ticketLogs";
import { User } from "@/types/user";
import { format } from "date-fns";

interface WorkLogListProps {
  userData: User;
  workLog: TicketLogsData;
}

const WorkLogList: React.FC<WorkLogListProps> = ( { userData, workLog } ) => {
  const { capitalizeFirstLetter } = Utility();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery( muiTheme.breakpoints.down( 'sm' ) ); // 0-599px
  const isTablet = useMediaQuery( muiTheme.breakpoints.between( 'sm', 'md' ) ); // 600-899px
  const isIpad = useMediaQuery( muiTheme.breakpoints.between( 'md', 'lg' ) ); // 900-1199px
  const isDesktop = useMediaQuery( muiTheme.breakpoints.up( 'lg' ) ); // 1200px+

  return (
    <Box
      sx={{
        height: "30vh",
        overflowY: "auto",
        width: "100%",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(12, 102, 228, 0.2)",
          borderRadius: "3px",
        }
      }}
    >
      {workLog?.length ? (
        workLog.map( ( log ) => {
          const loggedBy = userData?.data?.results.find(
            ( user ) => user.id == log.user_id
          );
          return (
            <Paper
              key={log.id}
              elevation={0}
              sx={{
                padding: 2,
                marginBottom: 2,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--mui-palette-neutral-100)",
                border: "1px solid var(--mui-palette-neutral-200)",
                borderRadius: "12px",
                width: "100%",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                sx={{ mb: 1, gap: 2 }}
              >
                <Typography fontWeight="bold" sx={{ color: "text.primary", fontSize: "0.95rem" }}>
                  {capitalizeFirstLetter( loggedBy?.username )}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "primary.main",
                    backgroundColor: "primary.light",
                    px: 1,
                    borderRadius: "4px"
                  }}
                >
                  {log.time_spent}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.8rem",
                    color: "text.secondary",
                    ml: "auto"
                  }}
                >
                  {format( new Date( log.created_at ), "PPpp" )}
                </Typography>
              </Box>

              {/* Work description */}
              <Typography
                sx={{
                  color: "text.primary",
                  padding: 1.5,
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  border: "1px solid rgba(0,0,0,0.05)",
                  lineHeight: 1.6,
                }}
              >
                {capitalizeFirstLetter( log.work_description )}
              </Typography>
            </Paper>
          );
        } )
      ) : (
        <Box
          mt={2}
          p={4}
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            color: "text.secondary",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            No work has been logged for this issue
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkLogList;

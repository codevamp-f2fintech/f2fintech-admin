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
        padding: "10px",
        borderRadius: "8px",
        width: isMobile ? "77vw" : isTablet ? "80vw" : isIpad ? "80vw" : "46.5vw",
        "&::-webkit-scrollbar": {
          display: "none",
        },
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
              elevation={3}
              sx={{
                padding: ".5rem",
                marginBottom: "1vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f5f8fa",
                width: isMobile ? "71vw" : isTablet ? "78.5vw" : isIpad ? "80vw" : "45vw",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                marginBottom=".5rem"
                padding=".5rem"
                sx={{ justifyContent: isMobile ? "center" : isTablet ? "center" : isIpad ? "center" : "flex-start" }}
              >
                <Typography fontWeight="bold" sx={{ mr: "1vw", fontSize: isMobile ? ".6rem" : isTablet ? "1rem" : isIpad ? "1rem" : "" }}>
                  {capitalizeFirstLetter( loggedBy?.username )}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: isMobile ? "0.5rem" : isTablet ? ".8rem" : isIpad ? "1rem" : "",
                    mr: "20VW",
                  }}
                >
                  logged {log.time_spent}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: isMobile ? "0.5rem" : isIpad ? "1rem" : "",
                    color: "red"
                  }}
                >
                  {format( new Date( log.created_at ), "PPpp" )}
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
                {capitalizeFirstLetter( log.work_description )}
              </Typography>
            </Paper>
          );
        } )
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

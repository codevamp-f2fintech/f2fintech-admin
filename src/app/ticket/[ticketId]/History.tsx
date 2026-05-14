import React from "react";
import { Box, Divider, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Bolt as BoltIcon } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";

import { TicketHistory } from "@/types/tickethistory";
import { Utility } from "@/utils";
import { useGetTicketHistory } from "@/hooks/tickethistory";

interface HistoryProps {
  ticketId: string | string[];
  activeSection: string;
}

const History: React.FC<HistoryProps> = ( { ticketId, activeSection } ) => {
  const [ hasFetched, setHasFetched ] = React.useState( false );
  const muiTheme = useTheme();
  const { capitalizeFirstLetter } = Utility();
  const isMobile = useMediaQuery( muiTheme.breakpoints.down( 'sm' ) ); // 0-599px
  const isTablet = useMediaQuery( muiTheme.breakpoints.between( 'sm', 'md' ) ); // 600-899px
  const isIpad = useMediaQuery( muiTheme.breakpoints.between( 'md', 'lg' ) ); // 900-1199px
  const isDesktop = useMediaQuery( muiTheme.breakpoints.up( 'lg' ) ); // 1200px+

  const { value: ticketHistory, refetch } = useGetTicketHistory(
    {} as TicketHistory,
    hasFetched ? `get-ticket-histories/${ ticketId }` : ''
  );

  React.useEffect( () => {
    if ( activeSection === "History" && !hasFetched )
    {
      refetch();
      setHasFetched( true );
    }
  }, [ activeSection, hasFetched, refetch ] );

  return (
    <Box
      sx={{
        height: "30vh",
        overflowY: "auto",
        padding: "10px",
        borderRadius: "8px",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {ticketHistory?.data?.length ? (
        ticketHistory.data.map( ( history ) => {
          const dateObj = new Date( history.created_at );
          const capitalizedAction = capitalizeFirstLetter(
            history.action.replace( /<\/?[^>]+(>|$)/g, "" )
          );

          return (
            <React.Fragment key={history.id}>
              <Divider sx={{ my: 1 }} />
              <Box mt={1} display="flex">
                <BoltIcon
                  fontSize="small"
                  sx={{
                    color: "primary.main",
                    marginRight: 2,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "text.primary",
                    flexGrow: 1,
                  }}
                >
                  {capitalizedAction}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    ml: 2,
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {format( dateObj, "dd MMM yyyy HH:mm" )} (
                  {formatDistanceToNow( dateObj )} ago)
                </Typography>
              </Box>
            </React.Fragment>
          );
        } )
      ) : (
        <Typography
          variant="body2"
          mt={2}
          sx={{
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          No Ticket History Available
        </Typography>
      )}
    </Box>
  );
};

export default History;

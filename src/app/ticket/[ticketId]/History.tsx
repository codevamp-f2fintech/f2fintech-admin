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
                    color: "#2c3ce3",
                    marginRight: "1vw",
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: isMobile ? ".6rem" : isTablet ? ".8rem" : "",
                    width: isMobile ? "30vw" : isTablet ? "30vh" : isIpad ? "40vw" : "50vw",
                    color: "black",
                  }}
                >
                  {capitalizedAction}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    ml: "3vw",
                    color: "red",
                    fontSize: isMobile ? ".6rem" : "",
                    width: isMobile ? "30vw" : "32vw",
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
            color: "white",
          }}
        >
          No Ticket History Available
        </Typography>
      )}
    </Box>
  );
};

export default History;

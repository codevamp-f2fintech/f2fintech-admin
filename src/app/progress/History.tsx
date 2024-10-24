import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Bolt as BoltIcon } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";

interface HistoryProps {
    ticketHistory: Array<{
        id: number;
        ticket_id: number;
        action: string;
        created_at: string;
    }>;
}

const History: React.FC<HistoryProps> = ({ ticketHistory }) => {

    return (
        <Box>
            {ticketHistory.length ? (
                ticketHistory.map((history, index) => {
                    const dateObj = new Date(history.created_at);
                    return (
                        <React.Fragment key={history.id}>
                            <Divider sx={{ my: 1 }} />
                            <Box mt={1} display='flex'>
                                <BoltIcon
                                    fontSize="small"
                                    sx={{
                                        color: "#2c3ce3",
                                        marginRight: "5px",
                                    }}
                                />
                                <Typography variant="body1"
                                    dangerouslySetInnerHTML={{ __html: history.action }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {format(dateObj, 'dd MMM yyyy HH:mm')} ({formatDistanceToNow(dateObj)} ago)
                                </Typography>
                            </Box>
                        </React.Fragment>
                    )
                })
            ) : (
                <Typography
                    variant="body2"
                    mt={2}
                    sx={{ padding: "0 10px" }}
                >
                    No history
                </Typography>
            )}
        </Box >
    );
}

export default History;

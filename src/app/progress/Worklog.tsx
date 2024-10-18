import { Box, Typography, Paper } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDistanceToNow } from "date-fns";

interface WorkLogListProps {
    ticketData: Array<{
        time_spent: string;
        work_description: string;
        created_at: string;
    }>;
}

const WorkLogList: React.FC<WorkLogListProps> = ({ ticketData }) => {
    return (
        <Box>
            {ticketData.length ? ticketData.map((log, index) => (
                <Paper
                    key={index}
                    elevation={3}
                    sx={{
                        width: '40%',
                        padding: "10px",
                        marginBottom: "15px",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#f5f8fa", // Light Gray
                    }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-evenly"
                        marginBottom="5px"
                    >
                        <Typography fontWeight="bold">Faraz Husain</Typography>

                        <Typography
                            sx={{
                                fontWeight: "500",
                                fontSize: "0.85rem",
                            }}
                        >
                            logged <b>{log.time_spent}</b>
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: "500",
                                fontSize: "0.85rem",
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
                        {log.work_description}
                    </Typography>
                </Paper>
            )) :
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
                        background:
                            "linear-gradient(to right, #f5f5f5, #e0e0e0)",
                        width: "300px",
                        height: "100px",
                        margin: 'auto'
                    }}
                >
                    <AccessTimeIcon sx={{ fontSize: 40, mb: 0 }} />
                    <Typography
                        variant="body2"
                        mt={2}
                        sx={{ padding: "0 10px" }}
                    >
                        No work has been logged for this issue yet
                    </Typography>
                </Box>
            }
        </Box>
    );
};

export default WorkLogList;

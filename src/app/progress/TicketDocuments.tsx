import { Box, Grid, Paper, Typography } from "@mui/material";

const TicketDocuments = ({
    isMobile,
    isTab,
    documents
}) => {
    return (
        <Grid item xs={12} md={8}>
            <Paper
                elevation={5}
                sx={{
                    padding: 2,
                    marginTop: isMobile ? "2vh" : isTab ? "2rem" : "5vh",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "10px",
                    width: isMobile ? "73vw" : isTab ? "52vw" : "43.5vw",
                    background: `
                          linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
                        `,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        mb: 0,
                        mt: 0,
                        color: "white",
                        fontSize: isMobile
                            ? ".7rem"
                            : isTab
                                ? "1rem"
                                : "1rem",
                    }}
                >
                    Documents:
                </Typography>
                {documents.length > 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            gap: 1,
                        }}
                    >
                        {documents.map((doc, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: ".8rem",
                                    background: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s ease",
                                    width: "30vw",
                                    marginLeft: "1.5rem",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        transition: "transform 0.3s ease",
                                    },
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{ color: "black", flexGrow: 1 }}
                                >
                                    {doc.type}
                                </Typography>
                                <a
                                    href={doc.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: "none",
                                        color: "black",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Open
                                </a>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No documents available.</Typography>
                )}
            </Paper>
        </Grid>
    )
}

export default TicketDocuments;

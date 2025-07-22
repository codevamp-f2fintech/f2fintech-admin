import React, { useState, memo } from "react";
import { Box, Grid, Paper, Typography, Button } from "@mui/material";
import PdfViewer from "@/app/components/common/PdfViewer";

const TicketDocuments = ({ isMobile, isTab, documents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAttachment, setShowAttachment] = useState({});
  const itemsPerPage = 3;

  const toggleAttachment = (id) => {
    setShowAttachment((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalPages = Math.ceil(documents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDocuments = documents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isPDF = (url) => url.toLowerCase().endsWith(".pdf");

  return (
    <Grid item xs={12} md={8}>
      <Paper
        elevation={5}
        sx={{
          p: { xs: 2, md: 3 },
          my: { xs: 4, md: 4 },
          mx: "auto",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "12px",
          backgroundColor: "#fff",
          width: { xs: "100%", sm: "100%", md: "150%" },
          maxWidth: "800px",
          boxShadow: "0px 4px 20px rgba(149, 117, 205, 0.3)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: "#172B4D",
            fontWeight: 600,
            fontSize: { xs: "1.2rem", md: "1.3rem" },
            width: "100%",
            textAlign: "center",
          }}
        >
          Documents
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
            {displayedDocuments.map((doc, index) => (
              <React.Fragment key={index}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: ".8rem",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s ease",
                    width: isMobile ? "50vw" : isTab ? "43vw" : "38.5vw",
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
                  <Button
                    onClick={() => {
                      if (!isPDF(doc.document_url)) {
                        toggleAttachment(index);
                      }
                    }}
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.85rem",
                      bgcolor: "#f06292",
                      color: "white",
                      width: isTab ? "10vw" : isMobile ? "10vw" : "7vw",
                      "&:hover": {
                        bgcolor: "#9D50BB",
                        color: "black",
                      },
                    }}
                  >
                    {isPDF(doc.document_url) ? (
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "10px",
                        }}
                      >
                        Open PDF
                      </a>
                    ) : (
                      "View"
                    )}
                  </Button>
                </Box>

                {/* Conditional rendering of the attachment */}
                {showAttachment[index] && (
                  <Box
                    sx={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1000,
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: 2,
                      textAlign: "center",
                      height: isMobile ? "40vh" : isTab ? "40vh" : "100%",
                      width: isMobile ? "80vw" : isTab ? "60vw" : "100%",
                    }}
                  >
                    <Box>
                      <img
                        src={doc.document_url}
                        alt={`Attachment for ${doc.type}`}
                        style={{
                          height: isMobile ? "33vh" : isTab ? "35vh" : "90vh",
                          borderRadius: "8px",
                          marginLeft: "15vw",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        onClick={() => toggleAttachment(index)}
                        variant="contained"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontSize: "0.85rem",
                          color: "white",
                          bgcolor: "red",
                          marginLeft: "10vw",
                          "&:hover": {
                            bgcolor: "darkgray",
                            color: "black",
                          },
                        }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <Typography
            sx={{
              color: "#5E6C84",
              fontFamily: "",
            }}
          >
            No documents available.
          </Typography>
        )}
        {documents.length > itemsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 2,
              width: isMobile ? "55vw" : isTab ? "44vw" : "38vw",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                mr: ".5rem",
                textTransform: "none",
                fontSize: isMobile ? ".6rem" : "0.85rem",
                bgcolor: "#f06292",
                color: "white",
                "&:hover": {
                  bgcolor: "#9D50BB",
                  color: "black",
                },
                height: isMobile ? "3vh" : isTab ? "3vh" : "",
                width: isMobile ? "1vw" : isTab ? "" : "5vw",
              }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                fontSize: isMobile ? ".6rem" : "0.85rem",
                bgcolor: "#f06292",
                color: "white",
                "&:hover": {
                  bgcolor: "#9D50BB",
                  color: "black",
                },
                height: isMobile ? "3vh" : isTab ? "3vh" : "",
                width: "5vw",
              }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                textAlign: "center",
                flexGrow: 1,
                mt: isMobile ? "" : isTab ? "1rem" : ".5rem",
                mr: isMobile ? "1rem" : isTab ? "20vw" : "20vw",
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>
        )}
      </Paper>
    </Grid>
  );
};

export default memo(TicketDocuments);

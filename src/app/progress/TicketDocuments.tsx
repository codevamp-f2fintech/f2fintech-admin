import React, { useState } from "react";
import { Box, Grid, Paper, Typography, Button } from "@mui/material";

const TicketDocuments = ({ isMobile, isTab, documents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(documents.length / itemsPerPage);

  // Calculate the documents to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDocuments = documents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Grid item xs={12} md={8}>
      <Paper
        elevation={5}
        sx={{
          padding: 2,
          marginTop: isMobile ? "2vh" : isTab ? "2rem" : "5vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
            mb: 2,
            mt: 0,
            color: "white",
            fontSize: isMobile ? ".7rem" : isTab ? "1rem" : "1rem",
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
            {displayedDocuments.map((doc, index) => (
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
        {/* Pagination Controls */}
        {documents.length > itemsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                textAlign: "center",
                flexGrow: 1,
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>
    </Grid>
  );
};

export default TicketDocuments;

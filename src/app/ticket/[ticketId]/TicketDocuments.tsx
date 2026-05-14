import React, { useState, memo, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import PdfViewer from "@/app/components/common/PdfViewer";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { axiosInstance } from "@/apis/config/axiosConfig";
import { Utility } from "@/utils";

const TicketDocuments = ({
  isMobile,
  isTab,
  isIpad,
  documents,
  customerId,
  onDocumentUploaded,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAttachment, setShowAttachment] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 3;
  const { capitalizeFirstLetter, decodedToken } = Utility();

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

  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Check if the user is online
      if (!navigator.onLine) {
        return;
      }

      // Check file size limit (10MB = 10,485,760 bytes)
      if (file.size > 10485760) {
        handleToast(`${file.name} exceeds the 10MB limit`, "error");
        return;
      }

      setSelectedFile(file);
      await uploadDocument(file);
    }
  };

  // Upload document function (similar to Step3Form logic)
  const uploadDocument = async (file) => {
    let attachmentUrl = null;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("document", file);
    formData.append("folder", `document/${file.name}`);

    try {
      // First upload to S3
      const uploadResponse = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_WEB_URL}/upload-to-s3`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      attachmentUrl = uploadResponse.data.data;

      if (attachmentUrl) {
        // Then create document record in database
        await axiosInstance.post(`${process.env.NEXT_PUBLIC_WEB_URL}/create-document`, {
          document_url: attachmentUrl,
          customer_id: customerId,
          type: "general document", // You can change this type as needed
        });

        // Call callback to refresh documents list if provided
        if (onDocumentUploaded) {
          onDocumentUploaded();
        }
      }
    } catch (err) {
      console.error("Error uploading document:", err);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("add-document-input");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  // Handler for button click to trigger file input
  const handleAddDocumentClick = () => {
    document.getElementById("add-document-input").click();
  };

  const isPDF = (url) => url.toLowerCase().endsWith(".pdf");

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between",
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            pb: 1.5,
            gap: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#172B4D",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
            }}
          >
            Documents
          </Typography>

          <Tooltip title="Upload a new document">
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                onClick={handleAddDocumentClick}
                disabled={isUploading}
                sx={{
                  px: { xs: 2, sm: 3 },
                  minWidth: 'fit-content',
                }}
              >
                {isUploading ? "Uploading..." : "Add Document"}
              </Button>
            </span>
          </Tooltip>
          <input
            id="add-document-input"
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Box>
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
                    padding: "1rem",
                    background: "var(--mui-palette-neutral-100)",
                    border: "1px solid var(--mui-palette-neutral-200)",
                    borderRadius: "8px",
                    width: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "#fff",
                      borderColor: "primary.main",
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: "#172B4D", fontWeight: 500, flexGrow: 1, fontSize: "0.95rem" }}
                  >
                    {capitalizeFirstLetter(doc.type)}
                  </Typography>
                  <Tooltip title={isPDF(doc.document_url) ? "Open PDF in new tab" : "View Document Image"}>
                    <span>
                      <Button
                        onClick={() => {
                          if (!isPDF(doc.document_url)) {
                            toggleAttachment(index);
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: "primary.main",
                          borderColor: "primary.main",
                          px: 2,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        {isPDF(doc.document_url) ? (
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            Open PDF
                          </a>
                        ) : (
                          "View"
                        )}
                      </Button>
                    </span>
                  </Tooltip>
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
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 3,
              pt: 2,
              borderTop: "1px solid rgba(0,0,0,0.08)",
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default memo(TicketDocuments);

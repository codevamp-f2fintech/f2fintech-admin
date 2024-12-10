import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AudioFileIcon from "@mui/icons-material/Audiotrack";

import Toast from "../components/common/Toast";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "@mui/icons-material";
import { RootState } from "@/redux/store";
import { useModifyTicket } from "@/hooks/ticket";

const TicketVoiceNotes = ({
  isMobile,
  isTab,
  notes,
  storedTicketId,
  voiceNoteUrl,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [selectedAudioFile, setSelectedAudioFile] = useState();
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();
  const { modifyTicket } = useModifyTicket("update-ticket");

  const totalPages = Math.ceil(notes ? notes?.length / itemsPerPage : 0);

  // Calculate the notes to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedNotes = notes?.slice(startIndex, startIndex + itemsPerPage);

  const handleAttachmentAudioDelete = async () => {
    await modifyTicket(+storedTicketId, {
      voice_note_url: null,
    });
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the file input value
    }
  };

  // Create comment handler, memoized
  const handleVoiceNoteUpload = useCallback(async () => {
    console.log("selectedAudioFile", selectedAudioFile);
    try {
      let attachmentUrl = null;

      if (selectedAudioFile) {
        try {
          const formData = new FormData();
          formData.append("document", selectedAudioFile);
          formData.append("folder", `voice-note/${selectedAudioFile.name}`);

          const uploadResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_WEB_URL}/upload-to-s3`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          attachmentUrl = uploadResponse.data.data;
          // update ticket api update-ticket/:ticketId
          const updatedData = { voice_note_url: attachmentUrl };

          await modifyTicket(+storedTicketId, updatedData);
          setUploaded(true);
          toastAndNavigate(dispatch, true, "info", "Uploaded Successfully");
        } catch (err) {
          console.log("Error uploading attachment:", err);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "Error uploading voice note"
          );
        }
      }
    } catch (error) {
      console.log("Error uploading voice note:", error);
    }
  }, [selectedAudioFile, toastAndNavigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedAudioFile(file);
  };

  console.log("AudioFile>>", notes, voiceNoteUrl);
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
          background: `linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)`,
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
          Voice Note:
        </Typography>

        {/* Display existing notes */}
        {notes?.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            {displayedNotes?.map((doc, index) => (
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
                {/* Add Audio Player for Each Note */}
                <audio controls sx={{ width: "100%" }}>
                  <source src={doc.document_url} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            ))}
          </Box>
        ) : (
          // <Typography>No notes available.</Typography>
          <></>
        )}

        {/* File upload section */}
        {!selectedAudioFile && (
          <IconButton
            component="label"
            sx={{ mt: 2, background: "white", p: 1, borderRadius: "50%" }}
          >
            <AudioFileIcon sx={{ color: "#6a1b9a" }} />
            <input
              ref={inputRef}
              hidden
              multiple
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
          </IconButton>
        )}

        {/* Display selected audio files */}
        {(voiceNoteUrl || selectedAudioFile) && (
          <Box sx={{ width: "100%", maxWidth: "40vw", mt: 2 }}>
            <Box
              key={0}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography>{selectedAudioFile?.name}</Typography>
              <IconButton onClick={handleAttachmentAudioDelete} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
              {selectedAudioFile && !uploaded && (
                <Upload onClick={handleVoiceNoteUpload} />
              )}
              {/* Audio Player for Each Selected File */}
              <audio controls style={{ width: "100%" }}>
                {selectedAudioFile ? (
                  <>
                    {/* Check the MIME type of the selected file */}
                    <source
                      src={URL.createObjectURL(selectedAudioFile)}
                      type={
                        selectedAudioFile.type === "audio/mpeg"
                          ? "audio/mpeg"
                          : selectedAudioFile.type === "audio/ogg"
                          ? "audio/ogg"
                          : "audio/wav" // Default to WAV if MIME type is unknown
                      }
                    />
                  </>
                ) : voiceNoteUrl ? (
                  <>
                    {/* Add multiple sources for different file types */}
                    <source src={voiceNoteUrl} type="audio/mpeg" />
                    <source src={voiceNoteUrl} type="audio/ogg" />
                    <source src={voiceNoteUrl} type="audio/wav" />
                  </>
                ) : (
                  <p>Your browser does not support the audio element.</p>
                )}
              </audio>
            </Box>
          </Box>
        )}
      </Paper>
      {/* Integrate the Toast component */}
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Grid>
  );
};

export default TicketVoiceNotes;

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

import Toast from "../../components/common/Toast";
import { Utility } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "@mui/icons-material";
import { AppDispatch, RootState } from "@/redux/store";
import { useModifyTicket } from "@/hooks/ticket";

const TicketVoiceNotes = ({ isMobile, isTab, ticketDetailData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [selectedAudioFile, setSelectedAudioFile] = useState();
  const [uploaded, setUploaded] = useState(false);
  const [voiceNote, setVoiceNote] = useState(ticketDetailData?.voiceNoteUrl);
  const inputRef = useRef(null);
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();
  const { modifyTicket } = useModifyTicket("update-ticket");

  // Calculate the notes to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  // const displayedNotes = notes?.slice(startIndex, startIndex + itemsPerPage);

  const handleAttachmentAudioDelete = async () => {
    await modifyTicket(ticketDetailData?.ticketId, {
      voice_note_url: null,
    });
    setVoiceNote("");
    setSelectedAudioFile(null);
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
          const attachmentUrl = uploadResponse.data.data;
          await modifyTicket(ticketDetailData?.ticketId, {
            voice_note_url: attachmentUrl,
          });

          setVoiceNote(attachmentUrl);
          setUploaded(true);
          setSelectedAudioFile(null);
          toastAndNavigate(dispatch, true, "success", "Voice note uploaded successfully");
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
    const file = e.target.files?.[0];
    setSelectedAudioFile(file);
  };

  console.log("AudioFile>>", ticketDetailData?.voiceNoteUrl);
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
          bgcolor: "#9575cd",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            mt: 0,
            color: "white",
            fontSize: isMobile ? ".7rem" : isTab ? "1rem" : "1.1rem",
          }}
        >
          Voice Note:
        </Typography>

        {/* File upload section */}
        {!selectedAudioFile && !voiceNote && (
          <IconButton
            component="label"
            sx={{ mt: 2, background: "white", p: 1, borderRadius: "50%" }}
          >
            <AudioFileIcon sx={{ color: "#6a1b9a" }} />
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
          </IconButton>
        )}

        {/* Display selected audio files */}
        {(voiceNote || selectedAudioFile) && (
          <Box
            sx={{
              width: "100%",
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              key={0}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                width: isMobile ? "100vw" : isTab ? "90vw" : "30vw",
              }}
            >
              <Typography>{selectedAudioFile?.name || "Voice Note"}</Typography>
              <IconButton onClick={handleAttachmentAudioDelete} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
              {selectedAudioFile && !uploaded && (
                <Upload onClick={handleVoiceNoteUpload} />
              )}
              {/* Audio Player for Each Selected File */}
              <audio controls style={{ width: "100%" }}>
                {selectedAudioFile ? (
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
                ) : voiceNote ? (
                  <>
                    <source src={voiceNote} type="audio/mpeg" />
                    <source src={voiceNote} type="audio/ogg" />
                    <source src={voiceNote} type="audio/wav" />
                  </>
                ) : (
                  <p>Your browser does not support the audio element.</p>
                )}
              </audio>
            </Box>
          </Box>
        )}
      </Paper>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Grid>
  );
};

export default TicketVoiceNotes;

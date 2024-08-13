"use client";
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  Paper,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("In Progress");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      // Handle file upload logic here (e.g., send to API)
      console.log("Uploading file:", selectedFile);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "100vh",
        width: "100vw",

        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{ padding: 4, width: "100%", maxWidth: 1200, height: "80vh" }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            WEB - Customer profile image upload
          </Typography>
          <Box display="flex" alignItems="center">
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                startIcon={<AttachFileIcon />}
                sx={{ marginRight: 1 }}
              >
                Attach
              </Button>
            </label>
            <Button
              variant="outlined"
              size="small"
              sx={{ marginRight: 1 }}
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload File
            </Button>
            <Button variant="outlined" size="small" sx={{ marginRight: 1 }}>
              Add a child issue
            </Button>
            <Button variant="outlined" size="small" sx={{ marginRight: 1 }}>
              Link issue
            </Button>
            <MoreVertIcon />
          </Box>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        <Box>
          <Typography variant="body1" paragraph>
            1. Customer has updated profile pic
          </Typography>
          <Typography variant="body1" paragraph></Typography>
          <Typography variant="body1"></Typography>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Activity</Typography>
          <Typography variant="body2">Newest first</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a comment..."
              multiline
              rows={3}
              sx={{ marginTop: 2 }}
            />
            <Typography
              variant="caption"
              sx={{ display: "block", marginTop: 1 }}
            >
              Pro tip: press <strong>M</strong> to comment
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6">Pinned fields</Typography>
              <Typography variant="body2" paragraph>
                Click on the pin next to a field label to start pinning.
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Assignee</Typography>
                <Typography variant="body2" fontWeight="bold">
                  Tuba Khan
                </Typography>
              </Box>
              {/* Add more fields as needed */}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

"use client";
import React, { useState, MouseEvent } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Bolt as BoltIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";
import { useMode, ColorModeContext } from "../../../theme";

export default function Home() {
  const [theme, colorMode] = useMode();
  const [status, setStatus] = useState("WorkFlow");
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<null | Date>(null);

  const handleFileUpload = () => {
    if (selectedFile) {
      console.log("Uploading file:", selectedFile);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (selectedStatus: string) => {
    setStatus(selectedStatus);
    setAnchorEl(null);
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container
            maxWidth={false}
            sx={{
              height: "100vh",
              width: "100vw",
              backgroundColor: "#f0f2f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 2,
            }}
          >
            <AppBar
              position="fixed"
              sx={{
                boxShadow: "none",
              }}
            >
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ flexGrow: 1, textAlign: "center" }}
                >
                  F2 Fintech Sales Ticketing System
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: "#ffffff",
                    color: theme.palette.primary.main,
                  }}
                >
                  RA
                </Avatar>
              </Toolbar>
            </AppBar>

            <Grid
              container
              spacing={2}
              sx={{ width: "100%", maxWidth: 1600, mt: 10 }}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 4,
                    height: "75vh",
                    borderRadius: 3,
                    marginTop: "-20px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      WEB - Customer Profile Image Upload
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          component="span"
                          startIcon={<AttachFileIcon />}
                          variant="contained"
                          sx={{ textTransform: "none", mr: 2 }}
                        >
                          Attach
                        </Button>
                      </label>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider />

                  <Box mt={2}>
                    <Typography variant="body1" paragraph>
                      1. Customer has updated profile pic
                    </Typography>
                  </Box>

                  <Divider />

                  <Box mt={2} mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Activity:
                      <Typography
                        sx={{
                          backgroundColor: "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          padding: "6px",
                          marginLeft: "10px",
                          display: "inline-block",
                        }}
                      >
                        Work log
                      </Typography>
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Add a comment..."
                    multiline
                    rows={3}
                    sx={{ mt: 1 }}
                  />

                  <Box mt={2} display="flex" justifyContent="flex-start">
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ textTransform: "none" }}
                      onClick={() => console.log("Comment button clicked")}
                    >
                      Comment
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    height: "75vh",
                    borderRadius: 3,
                    marginTop: "-20px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 2,
                        backgroundColor: theme.palette.secondary.main,
                      }}
                    >
                      {status}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(status)}
                    >
                      <MenuItem onClick={() => handleClose("TO DO")}>
                        TO DO
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("PROGRESS")}>
                        PROGRESS
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("REVIEW")}>
                        REVIEW
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("DONE")}>
                        DONE
                      </MenuItem>
                    </Menu>
                    <IconButton>
                      <BoltIcon color="action" />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="bold">
                    Details Shown Below:
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" fontWeight="bold">
                      Assignee
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>RA</Avatar>
                      <Typography variant="body2">Ritu Anuragi</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" fontWeight="bold">
                      TimeLog
                    </Typography>
                    <DateTimePicker
                      label="Choose Date & Time"
                      value={selectedDateTime}
                      onChange={(newValue) => setSelectedDateTime(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      )}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" fontWeight="bold">
                      Original estimate
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#e8eaf6",
                        fontSize: "12px",
                        borderRadius: "4px",
                        padding: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      2d
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </LocalizationProvider>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}

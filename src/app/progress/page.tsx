"use client";

import React, { useState, MouseEvent, useEffect } from "react";

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
  Autocomplete,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Bolt as BoltIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ThemeProvider } from "@mui/material/styles";

import { useMode, ColorModeContext } from "../../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useGetCustomers } from "@/hooks/customer";
import { useGetUsers } from "@/hooks/user";
import { useGetTicketActivities, useDeleteTicketActivity, useCreateTicketActivity, useModifyTicketActivity } from "@/hooks/ticketActivities";
import { fetchStatusAndDocuments, fetchEmployeeStatus } from "../../redux/features/employeeSlice";

import { RootState } from "../../redux/store";
import { Utility } from "@/utils";
import { setCustomers } from "@/redux/features/customerSlice";
import Loader from "../components/common/Loader";
import TrackingForm from "./trackingForm";
import ProgressBar from "../components/common/ProgressBar";
import { useGetTickets } from "@/hooks/ticket";
import WorkLogList from "./Worklog";

const Progress: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false); // for tracking form to open

  const [theme, colorMode] = useMode();
  const dispatch = useDispatch();
  const { getLocalStorage } = Utility();
  const original_estimate = getLocalStorage("ids")?.estimate;
  const ids = getLocalStorage("ids");

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [commentsState, setCommentsState] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<string>("Comments");
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");

  const [employeeAnchorEl, setEmployeeAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [timeLoggingEstimate, setTimeLoggingEstimate] = useState({
    isHovered: false,
    originalEstimate: original_estimate,
    timeSpent: 0
  });
  const [progress, setProgress] = useState(0); // State to store progress percentage
  const [overage, setOverage] = useState(0); // Orange part (exceeding estimated time)

  const [ticketId, setTicketId] = useState("");
  const { customer } = useSelector((state: RootState) => state.customer);
  const storedTicketId = ticketId?.split('-')[1];

  // Fetch customers
  const { data } = useGetCustomers([], `get-loan-applications`);
  const { value: comments } = useGetTicketActivities([], `get-all-ticket-activities/${storedTicketId}`);

  // Hook for deleting ticket activity
  const { deleteTicketActivity, error } = useDeleteTicketActivity('delete-ticket-activity');

  // Hook for creating new ticket activity (comment)
  const { createTicketActivity, error: createError } = useCreateTicketActivity('create-ticket-activity');

  // Hook for modifying ticket activity (editing comments)
  const { modifyTicketActivity, error: modifyError } = useModifyTicketActivity('update-ticket-activity');


  useEffect(() => {
    if (comments && Array.isArray(comments) && comments.length > 0) {
      setCommentsState(comments);
      console.log("Updated commentsState:", comments);
    } else {
      console.log("No comments Here");
    }
  }, [comments]);

  useEffect(() => {
    if (data?.success === true) {
      dispatch(setCustomers(data.data));
    }
  }, [data]);

  useEffect(() => {
    const storedTicketId = getLocalStorage("ticketId");
    if (storedTicketId) {
      setTicketId(storedTicketId);
    }
  }, []);

  const { user } = useGetUsers([], `get-users`);

  const { value: ticketData } = useGetTickets([], `get-ticket-logs/${storedTicketId}`);


  useEffect(() => {
    if (ticketData?.data) {
      const totalHours = ticketData.data.reduce((acc: number, ticket: any) => {
        return acc + parseTimeSpent(ticket.time_spent);
      }, 0);

      const finalTime = convertHoursToDaysAndHours(totalHours);
      console.log(finalTime, 'final total time');
      setTimeLoggingEstimate({
        ...timeLoggingEstimate,
        timeSpent: finalTime
      });
      const calculatedProgress = Math.min((totalHours / parseTimeSpent(timeLoggingEstimate.originalEstimate)) * 100, 100); // max 100%
      const calculatedOverage = totalHours > parseTimeSpent(timeLoggingEstimate.originalEstimate) ? ((totalHours - parseTimeSpent(timeLoggingEstimate.originalEstimate)) / parseTimeSpent(timeLoggingEstimate.originalEstimate)) * 100 : 0;

      console.log((totalHours - parseTimeSpent(timeLoggingEstimate.originalEstimate)) / parseTimeSpent(timeLoggingEstimate.originalEstimate), 'total')
      setProgress(calculatedProgress); // Blue bar
      setOverage(calculatedOverage); // Orange bar
    }
  }, [ticketData, ticketId]);

  const parseTimeSpent = (timeSpent: string): number => {
    const timeRegex = /^(\d+)([hdm])$/;
    const match = timeSpent.match(timeRegex);

    if (!match) return 0; // Return 0 if the format is invalid

    const [, value, unit] = match;
    const numericValue = parseInt(value, 10);

    switch (unit) {
      case 'h': // hours
        return numericValue;
      case 'd': // days (assuming 1 day = 8 working hours)
        return numericValue * 8;
      case 'm': // minutes (convert to hours)
        return numericValue / 60;
      default:
        return 0;
    }
  };

  // Function to convert hours back into 'Xd Yh' format
  const convertHoursToDaysAndHours = (totalHours: number): string => {
    const totalMinutes = Math.round(totalHours * 60); // Convert total hours to total minutes
    const days = Math.floor(totalMinutes / (8 * 60)); // 1 day = 8 hours = 480 minutes
    const remainingMinutesAfterDays = totalMinutes % (8 * 60); // Remaining minutes after accounting for days
    const hours = Math.floor(remainingMinutesAfterDays / 60); // Convert remaining minutes to hours
    const minutes = remainingMinutesAfterDays % 60; // Get remaining minutes

    let formattedTime = '';

    if (days > 0) {
      formattedTime += `${days}d`;
    }
    if (hours > 0 || days === 0) { // Show hours if there are any, or if there are no days
      formattedTime += `${days > 0 ? ' ' : ''}${hours}h`;
    }
    if (minutes > 0) {
      formattedTime += `${(days > 0 || hours > 0) ? ' ' : ''}${minutes}m`; // Add space if days or hours exist
    }

    return formattedTime || '0h';
  };


  const { status: employeeStatus, loanStatus, documents } = useSelector((state: RootState) => state.employee);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setTimeLoggingEstimate((prevState) => ({
      ...prevState,
      originalEstimate: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  useEffect(() => {
    if (ids) {
      dispatch(
        fetchStatusAndDocuments({
          applicationId: ids.applicationId,
          customerId: ids.customerId,
        })
      );
      dispatch(fetchEmployeeStatus(ids.applicationId));
    }
  }, [ids.applicationId, ids.customerId, dispatch]);


  useEffect(() => {
    if (ids.customerId) {
      const selectedCustomer = customer.find((cust) => cust.Id === ids.customerId);
      if (selectedCustomer) {
        setSelectedCustomer(selectedCustomer);
      }
    }
  }, [ids.customerId, customer]);


  const handleBack = () => {
    window.history.back();
  };
  const handleEmployeeClick = (event: MouseEvent<HTMLButtonElement>) => {
    setEmployeeAnchorEl(event.currentTarget);
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteTicketActivity(commentId);
      setCommentsState((prevComments) =>
        prevComments.filter((comment) => comment.ticket_id !== commentId)
      );
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error('Error while deleting the comment:', error);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    try {
      const newCommentData = {
        ticket_id: ticketId,
        comment: newComment,
        created_at: new Date().toISOString(),
      };
      const createdComment = await createTicketActivity(newCommentData);

      if (createdComment) {
        setCommentsState((prevComments) => [...prevComments, createdComment]);
        setNewComment("");
      }
      console.log("Comment created successfully");
    } catch (error) {
      console.error('Error while creating the comment:', error);
    }

  };

  const handleEditComment = (commentId: number, ticketId: number, commentText: string) => {
    setEditingCommentId(commentId); // Set the commentId for editing
    setEditedComment(commentText); // Set the current comment text to be edited
  };

  const handleSaveEditComment = async (commentId: number, ticketId: number) => {
    if (!editedComment.trim()) return;

    try {
      const updatedCommentData = {
        comment: editedComment,
        updated_at: new Date().toISOString(),
      };


      const updatedComment = await modifyTicketActivity(ticketId, commentId, updatedCommentData);

      if (updatedComment) {
        // Update the comments state with the modified comment
        setCommentsState((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId && comment.ticket_id === ticketId
              ? { ...comment, ...updatedComment }
              : comment
          )
        );
        setEditingCommentId(null); // Reset after save
        setEditedComment(""); // Clear the edited comment state
      }
    } catch (error) {
      console.error("Error while modifying the comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(newFiles);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (yes) => {
    setAnchorEl(null);
  };

  const showComments = () => setActiveSection("Comments");
  const showHistory = () => setActiveSection("History");
  const showWorkLog = () => setActiveSection("WorkLog");

  if (!selectedCustomer) {
    return <Loader />;
  }

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
              paddingTop: 7,
            }}
          >
            <AppBar position="fixed" sx={{ boxShadow: "none" }}>
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
                  F2 Fintech Sales Ticketing System
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: "#ffffff",
                    color: theme.palette.primary.main,
                  }}
                  alt={selectedCustomer.Name}
                  src={selectedCustomer.Image}
                />
              </Toolbar>
            </AppBar>

            <Grid
              container
              spacing={2}
              sx={{ width: "100%", mt: 5 }}
            >
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={5}
                  sx={{
                    padding: 4,
                    height: "auto",
                    marginTop: "-50px",
                    background: "#fff",
                    marginLeft: "-60px",
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: "#2c3ce3",
                        textDecoration: "underline",
                        fontSize: "24px",
                      }}
                    >
                      <Typography variant="h6">
                        Ticket ID: {ticketId}
                      </Typography>
                    </Typography>
                    <Box display="flex" alignItems="center" ml={2}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          component="span"
                          startIcon={<AttachFileIcon />}
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                          }}
                        >
                          Attach Files
                        </Button>
                      </label>
                    </Box>
                  </Box>

                  <Box
                    mt={2}
                    p={2}
                    border={1}
                    borderColor="rgba(0, 0, 0, 0.1)"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    sx={{ borderRadius: "14px" }}
                  >
                    <Avatar src={selectedCustomer.Image} sx={{ width: 80, height: 80 }} />

                    <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: "background.paper" }}>
                      <Grid container spacing={2}>
                        {/* Name and Email */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Name:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Name}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Email:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Email}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* Contact and Amount */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Contact:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Contact}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Designation:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Designation}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Location:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Location}
                            </Typography>
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              tenure:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.Tenure}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            component="span"
                            sx={{ color: "black", mr: 1 }}
                          >
                            Amount:
                          </Typography>
                          <Typography component="span" sx={{ color: "blue" }}>
                            {selectedCustomer.Amount}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            <Typography
                              component="span"
                              sx={{ color: "black", mr: 1 }}
                            >
                              Application Date:
                            </Typography>
                            <Typography component="span" sx={{ color: "blue" }}>
                              {selectedCustomer.applicationDate}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>

                  <Grid item xs={12} md={8}>
                    <Paper
                      elevation={5}
                      sx={{
                        padding: 2,
                        marginTop: "30px",
                        background: "#fff",
                        display: "flex",
                        width: "145%",
                        flexDirection: "row",
                        borderRadius: "10px",
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
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
                                mt: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px",
                                backgroundColor: "#F5F5F5",
                                borderRadius: "8px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{ color: "#2C3CE3", flexGrow: 1 }}
                              >
                                {doc.type}
                              </Typography>
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#2C3CE3",
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

                  <Box mt={2} mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Activity:
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor: activeSection === "Comments" ? "lightblue" : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showComments}
                      >
                        Comments
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor: activeSection === "History" ? "lightblue" : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showHistory}
                      >
                        History
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          backgroundColor: activeSection === "WorkLog" ? "lightblue" : "#e8eaf6",
                          fontSize: "12px",
                          borderRadius: "4px",
                          marginLeft: "10px",
                          padding: "6px",
                          cursor: "pointer",
                        }}
                        onClick={showWorkLog}
                      >
                        Work Log
                      </Typography>
                    </Typography>

                  </Box>


                  {activeSection === "Comments" && (
                    <Box mt={2} mb={3} sx={{ position: "relative" }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Add a comment..."
                        multiline
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{
                          mt: 1,
                          bgcolor: "#ffffff",
                          borderRadius: 1,
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          pr: 5,
                        }}
                      />

                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: 45,
                          right: 12,
                          borderRadius: "50%",
                        }}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <AttachFileIcon />
                      </IconButton>

                      <Box mt={1} display="flex" justifyContent="flex-start" alignItems="center">
                        <Button
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                            mr: 2,
                          }}
                          onClick={handleCreateComment}
                        >
                          Comment
                        </Button>
                      </Box>

                      {/* Comments list displayed below the Add Comment button */}
                      <Box mt={3}>
                        <Typography variant="h6">New Comments :</Typography>
                        {comments && comments.data ? (
                          comments.data.map((comment, index) => (
                            <Box
                              key={index}
                              mt={1}
                              p={2}
                              border={1}
                              borderColor="grey.300"
                              borderRadius={4}
                            >
                              {editingCommentId === comment.id ? (
                                <Box>
                                  <TextField
                                    fullWidth
                                    multiline
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                    rows={3}
                                    variant="outlined"
                                  />
                                  <Box mt={1}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleSaveEditComment(comment.id, comment.ticket_id)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="text"
                                      color="secondary"
                                      sx={{ ml: 2 }}
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </Button>
                                  </Box>
                                </Box>
                              ) : (
                                <Box>
                                  <Typography variant="body1">{comment.comment}</Typography>
                                  <Box mt={1}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => handleEditComment(comment.id, comment.ticket_id, comment.comment)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={{ ml: 2 }}
                                      onClick={() => handleDeleteComment(comment.ticket_id)}
                                    >
                                      Delete
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          ))
                        ) : (
                          <Typography>No comments available</Typography>
                        )}

                      </Box>
                    </Box>
                  )}

                  {activeSection === "History" && (
                    <>
                      <Box mt={2}>
                        <Typography variant="h6" fontWeight="bold">
                          History:
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box mt={1}>
                          <Typography variant="body1">
                            <BoltIcon
                              fontSize="small"
                              sx={{
                                color: "#2C3CE3",
                                marginRight: "5px",
                              }}
                            />
                            <strong>16 Aug 2003:</strong> Action performed by
                            Rajiv.
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: "24px" }}
                          >
                            Updated customer information.
                          </Typography>
                        </Box>
                        <Box mt={1}>
                          <Typography variant="body1">
                            <BoltIcon
                              fontSize="small"
                              sx={{
                                color: "#2C3CE3",
                                marginRight: "5px",
                              }}
                            />
                            <strong>15 Aug 2003:</strong> Action performed by
                            Anjali.
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: "24px" }}
                          >
                            Approved loan application.
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {activeSection === "WorkLog" && (
                    <WorkLogList ticketData={ticketData?.data} />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={4}
                  sx={{
                    padding: 3,
                    height: "60vh",
                    marginTop: "-50px",
                    width: "400px",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      padding: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        flexGrow: 1,
                        marginLeft: "-18px",
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
                    >
                      Loan Status:
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 2,
                        minWidth: "100px",
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        fontWeight: "bold",
                        ":hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      {selectedCustomer.status}
                    </Button>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(selectedCustomer.status)}
                    >
                      <MenuItem onClick={() => handleClose("submitted")}>
                        Submitted
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("under_review")}>
                        Under Review
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("approved")}>
                        Approved
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("hold")}>
                        Hold
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("disbursed")}>
                        Disbursed
                      </MenuItem>
                      <MenuItem onClick={() => handleClose("rejected")}>
                        Rejected
                      </MenuItem>
                    </Menu>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      padding: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        flexGrow: 1,
                        marginLeft: "-18px",
                        color: "#2c3ce3",
                        fontWeight: "bold",
                      }}
                    >
                      Employee Status:
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={handleEmployeeClick}
                      sx={{
                        textTransform: "none",
                        paddingX: 2,
                        minWidth: "100px",
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        fontWeight: "bold",
                        ":hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      {employeeStatus}
                    </Button>

                    {/* <Menu
                      anchorEl={employeeAnchorEl}
                      open={Boolean(employeeAnchorEl)}
                      onClose={() => handleEmployeeClose(employeeStatus)}
                    >
                      <MenuItem onClick={() => handleEmployeeClose("hold")}>
                        Hold
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleEmployeeClose("forwarded")}
                      >
                        Forwarded
                      </MenuItem>
                      <MenuItem onClick={() => handleEmployeeClose("close")}>
                        Closed
                      </MenuItem>
                      <MenuItem onClick={() => handleEmployeeClose("done")}>
                        Done
                      </MenuItem>
                    </Menu> */}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" flexDirection="column">
                    <label htmlFor="file-upload"></label>
                    <input
                      accept="image/*, .pdf"
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                    />
                    { }
                    {selectedFiles.length > 0 && (
                      <Box mt={2}>
                        {selectedFiles.map((file, index) => (
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 1, bgcolor: "#f0f0f0", p: 1 }}
                          >
                            <Typography variant="body2">{file.name}</Typography>
                            <IconButton
                              sx={{
                                color: "red",
                              }}
                              onClick={() => removeFile(index)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Assignee
                    </Typography>
                    <Autocomplete
                      options={[]}
                      // getOptionLabel={(option) => option.name}
                      style={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Assignee"
                          variant="outlined"
                        />
                      )}
                      value={selectedCustomer}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}
                    onMouseEnter={() => setTimeLoggingEstimate((prevState) => ({ ...prevState, isHovered: true }))}
                    onMouseLeave={() => setTimeLoggingEstimate((prevState) => ({ ...prevState, isHovered: false }))}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Original estimate:
                    </Typography>

                    {!timeLoggingEstimate.isHovered ? (
                      <Typography variant="body2" sx={{ borderRadius: '50%', backgroundColor: '#DFE1E6', padding: '6px' }}>
                        {timeLoggingEstimate.originalEstimate}
                      </Typography>
                    ) : (
                      <TextField
                        // variant="outlined"
                        value={timeLoggingEstimate.originalEstimate}
                        onChange={handleInputChange}
                        onFocus={() => setTimeLoggingEstimate((prevState) => ({ ...prevState, isHovered: true }))}
                        onBlur={() => setTimeLoggingEstimate((prevState) => ({ ...prevState, isHovered: false }))}
                        sx={{
                          width: "60%",
                          border: 'none !important',
                          height: '20% !important',
                          backgroundColor: timeLoggingEstimate.isHovered ? "#e0e0e0" : "transparent",
                          // borderRadius: "4px",
                          visibility: timeLoggingEstimate.isHovered ? "show" : "hidden"
                        }}
                      />
                    )}
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        marginTop: "20px",
                        padding: "0px 1px",
                      }}
                    >
                      Time tracking
                    </Typography>

                    <Box display="flex" width='60%' mt={2}>
                      <ProgressBar setOpenDialog={setOpenDialog} timeLoggingEstimate={timeLoggingEstimate}
                        progress={progress} overage={overage}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

            </Grid>
          </Container>
          <TrackingForm openDialog={openDialog} setOpenDialog={setOpenDialog} timeLoggingEstimate={timeLoggingEstimate} setTimeLoggingEstimate={setTimeLoggingEstimate}
            progress={progress} setProgress={setProgress} overage={overage} setOverage={setOverage}
          />
        </LocalizationProvider>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default Progress;

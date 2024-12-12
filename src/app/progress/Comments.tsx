/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Avatar,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";

import { formatDistanceToNow } from "date-fns";
import Toast from "../components/common/Toast";
import {
  useGetTicketActivities,
  useDeleteTicketActivity,
  useCreateTicketActivity,
  useModifyTicketActivity,
} from "@/hooks/ticketActivities";

const ITEMS_PER_PAGE = 3;

interface CommentsProps {
  storedTicketId: number;
  theme: any;
  userData: object;
}

const Comments = ({ storedTicketId, theme, userData }: CommentsProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const { toast } = useSelector((state: RootState) => state.toast);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [showAttachment, setShowAttachment] = useState({});

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, decodedToken, toastAndNavigate } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  // Fetch comments data
  const { value: comments, refetch } = useGetTicketActivities(
    [],
    `get-all-ticket-activities/${storedTicketId}`
  );

  // Hook for creating new ticket activity (comment)
  const { createTicketActivity } = useCreateTicketActivity(
    "create-ticket-activity"
  );

  // Hook for deleting ticket activity
  const { deleteTicketActivity } = useDeleteTicketActivity(
    "delete-ticket-activity"
  );

  // Hook for modifying ticket activity (editing comments)
  const { modifyTicketActivity } = useModifyTicketActivity(
    "update-ticket-activity"
  );

  // Create comment handler, memoized
  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim()) return; // Don't allow empty comments

    try {
      let attachmentUrl = null;

      if (attachment) {
        try {
          const formData = new FormData();
          formData.append("document", attachment);
          formData.append("folder", `comment/${attachment.name}`);

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
        } catch (err) {
          console.log("Error uploading attachment:", err);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "Error uploading attachment"
          );
        }
      }

      const newCommentData = {
        ticket_id: storedTicketId,
        user_id: decodedToken()?.id,
        comment: newComment,
        attachment: attachmentUrl,
      };
      const createdComment = await createTicketActivity(newCommentData);
      if (createdComment) {
        setNewComment("");
        setAttachment(null);
        setAttachmentPreview("");
        toastAndNavigate(dispatch, true, "info", "Commented Successfully");
        refetch(); // Refetch the comments after successful creation
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Creating Comment");
      console.log("Error creating the comment:", error);
    }
  }, [attachment, newComment, storedTicketId, refetch]);

  // Delete comment handler, memoized
  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      try {
        await deleteTicketActivity(commentId);
        toastAndNavigate(dispatch, true, "info", "Deleted Successfully");
        await refetch(); // Refetch comments after successful deletion
      } catch (error) {
        toastAndNavigate(dispatch, true, "error", "Error Deleting Comment");
        console.log("Error deleting the comment:", error);
      }
    },
    [deleteTicketActivity, refetch, dispatch, toastAndNavigate]
  );

  // Start editing a comment
  const handleEditComment = useCallback(
    (commentId: number, commentText: string) => {
      setEditingCommentId(commentId);
      setEditedComment(commentText);
    },
    []
  );

  // Save edited comment handler, memoized
  const handleSaveEditComment = useCallback(
    async (commentId: number, ticketId: number) => {
      if (!editedComment.trim()) return;
      try {
        const updatedCommentData = {
          comment: editedComment,
          updated_at: new Date().toISOString(),
        };
        const updatedComment = await modifyTicketActivity(
          ticketId,
          commentId,
          updatedCommentData
        );
        if (updatedComment) {
          setEditingCommentId(null); // Reset editing mode
          setEditedComment("");
          setAttachment(null);
          toastAndNavigate(dispatch, true, "info", "Updated Successfully");
          refetch(); // Refetch comments after successful update
        }
      } catch (error) {
        toastAndNavigate(dispatch, true, "error", "Error Updating Comment");
        console.log("Error Updating the comment:", error);
      }
    },
    [editedComment, modifyTicketActivity, refetch, dispatch, toastAndNavigate]
  );

  // Cancel editing comment
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditedComment("");
  }, []);

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);

    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setAttachmentPreview(previewUrl);
    } else {
      setAttachmentPreview("");
    }
  };

  const handleAttachmentDelete = () => {
    setAttachment(null);
    setAttachmentPreview("");
  };

  // Pagination Logic
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const paginatedComments =
    comments && comments.data
      ? comments.data.slice(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
        )
      : [];

  const toggleAttachment = (commentId) => {
    setShowAttachment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <Box mt={2} mb={2} sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "relative",
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Add a comment..."
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{
            mt: 1,
            bgcolor: "#ffffff",
            borderRadius: 2,
            "&::-webkit-scrollbar": {
              display: "none", // This hides the scrollbar
            },
          }}
        />
        <IconButton
          component="label"
          sx={{ position: "absolute", bottom: 8, right: 8 }}
        >
          <AttachFileIcon />
          <input type="file" hidden onChange={handleAttachmentChange} />
        </IconButton>
      </Box>
      {attachment && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography>{attachment.name}</Typography>
          {attachmentPreview && (
            <Box
              component="img"
              src={attachmentPreview}
              alt="Preview"
              sx={{
                maxHeight: 100,
                maxWidth: 100,
                ml: 2,
                borderRadius: 2,
              }}
            />
          )}
          <IconButton onClick={handleAttachmentDelete} sx={{ ml: 2 }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      <Box
        mt={1}
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            bgcolor: theme.palette.primary.main,
            m: 1,
          }}
          onClick={handleCreateComment}
        >
          Comment
        </Button>
      </Box>

      <Box mt={3}>
        {paginatedComments.length > 0 ? (
          paginatedComments.map((comment) => {
            const commentedBy = userData?.results.find(
              (user) => user.id == comment.user_id
            );
            return (
              <Box
                key={comment.id}
                mt={2}
                p={2}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  height: "auto",
                }}
              >
                {/* User Avatar */}
                <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                  {commentedBy?.username?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  {/* Comment Header: User Name, Date */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: isTab ? 0 : 0.5,
                    }}
                  >
                    <Typography fontWeight="bold" sx={{ marginRight: "8px" }}>
                      {capitalizeFirstLetter(commentedBy?.username)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="cornsilk"
                      sx={{ ml: "20vw" }}
                    >
                      {formatDistanceToNow(new Date(comment.created_at))} ago
                    </Typography>
                  </Box>

                  {/* Comment Content / Edit Mode */}
                  {editingCommentId === comment.id ? (
                    <Box>
                      <TextField
                        sx={{
                          bgcolor: "white",
                          borderRadius: "10px",
                          "& .MuiFilledInput-root": {
                            "&:before, &:after": {
                              display: "none",
                            },
                          },
                        }}
                        fullWidth
                        multiline
                        value={editedComment}
                        onChange={(e) =>
                          setEditedComment(
                            capitalizeFirstLetter(e.target.value)
                          )
                        }
                        rows={3}
                        variant="filled"
                      />
                      <Box mt={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ color: "white", bgcolor: "green" }}
                          onClick={() =>
                            handleSaveEditComment(comment.id, comment.ticket_id)
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ ml: 2, color: "white", bgcolor: "red" }}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          height: "12vh",
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            display: "none",
                          },
                        }}
                      >
                        {/* Comment Text */}
                        <Typography
                          variant="body1"
                          sx={{ mb: 1, color: "white" }}
                        >
                          {capitalizeFirstLetter(comment.comment)}
                        </Typography>
                        {/* Attachment Preview (if present) */}
                        {comment.attachment && (
                          <Box>
                            {/* Button to toggle the attachment visibility */}
                            <Button
                              onClick={() => toggleAttachment(comment.id)}
                              variant="contained"
                              sx={{
                                textTransform: "none",
                                fontSize: "0.85rem",
                                bgcolor: "gray",
                                color: "white",
                                "&:hover": {
                                  bgcolor: "darkgray",
                                  color: "black",
                                },
                              }}
                            >
                              {showAttachment[comment.id]
                                ? "Hide Attachment"
                                : "View Attachment"}
                            </Button>

                            {/* Conditional rendering of the attachment */}
                            {showAttachment[comment.id] && (
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
                                  height: isMobile
                                    ? "40vh"
                                    : isTab
                                    ? "40vh"
                                    : "100%",
                                  width: isMobile
                                    ? "80vw"
                                    : isTab
                                    ? "60vw"
                                    : "100%",
                                }}
                              >
                                <Box>
                                  <img
                                    src={comment.attachment}
                                    alt="Attachment Preview"
                                    style={{
                                      height: isMobile
                                        ? "33vh"
                                        : isTab
                                        ? "35vh"
                                        : "90vh",
                                      width: isMobile
                                        ? "72vw"
                                        : isTab
                                        ? "55vw"
                                        : "80vw",
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
                                    width: "20vw",
                                    marginLeft: "45vw",
                                  }}
                                >
                                  {/* Close button */}
                                  <Button
                                    onClick={() => toggleAttachment(comment.id)}
                                    variant="contained"
                                    size="small"
                                    sx={{
                                      textTransform: "none",
                                      fontSize: "0.85rem",
                                      color: "white",
                                      bgcolor: "red",
                                      mr: "1vw",
                                      "&:hover": {
                                        bgcolor: "darkgray",
                                        color: "black",
                                      },
                                    }}
                                  >
                                    Close
                                  </Button>
                                  {/* Delete button */}
                                  <Button
                                    size="small"
                                    sx={{
                                      textTransform: "none",
                                      fontSize: "0.85rem",
                                      color: "white",
                                      bgcolor: "red",
                                      "&:hover": {
                                        bgcolor: "darkgray",
                                        color: "black",
                                      },
                                    }}
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Action Buttons: Edit, Delete */}
                      </Box>
                      <Box
                        sx={{
                          width: "25%",
                          mt: isTab ? "2vh" : "1vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          size="small"
                          sx={{
                            textTransform: "none",
                            fontSize: "0.85rem",
                            bgcolor: "gray",
                            color: "white",
                            "&:hover": {
                              bgcolor: "darkgray",
                              color: "black",
                            },
                          }}
                          onClick={() =>
                            handleEditComment(comment.id, comment.comment)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          sx={{
                            textTransform: "none",
                            fontSize: "0.85rem",
                            color: "white",
                            bgcolor: "gray",
                            ml: "1vw",
                            "&:hover": {
                              bgcolor: "darkgray",
                              color: "black",
                            },
                          }}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography>No comments available</Typography>
        )}
        <Pagination
          count={
            comments && comments.data
              ? Math.ceil(comments.data.length / ITEMS_PER_PAGE)
              : 0
          }
          page={currentPage}
          onChange={handlePageChange}
          sx={{ mt: 2 }}
        />
      </Box>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
};

export default React.memo(Comments);

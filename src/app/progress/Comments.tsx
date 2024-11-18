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
import { formatDistanceToNow } from "date-fns";

import Toast from "../components/common/Toast";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  useGetTicketActivities,
  useDeleteTicketActivity,
  useCreateTicketActivity,
  useModifyTicketActivity,
} from "@/hooks/ticketActivities";
import { Utility } from "@/utils";

const ITEMS_PER_PAGE = 3;

interface CommentsProps {
  storedTicketId: number;
  theme: any;
}

const Comments = ({ storedTicketId, theme }: CommentsProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const { toast } = useSelector((state: RootState) => state.toast);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination

  const dispatch: AppDispatch = useDispatch();
  const { decodedToken, toastAndNavigate } = Utility();
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
            `${process.env.NEXT_PUBLIC_API_URL}/upload-to-s3`,
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
  }, [
    attachment,
    newComment,
    storedTicketId,
    createTicketActivity,
    refetch,
    dispatch,
    toastAndNavigate,
  ]);

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

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

  return (
    <Box mt={2} mb={2} sx={{ position: "relative" }}>
      <Box sx={{ position: "relative", mb: 2 }}>
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
          paginatedComments.map((comment) => (
            <Box
              key={comment.id}
              mt={2}
              p={2}
              sx={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {/* User Avatar */}
              <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                {decodedToken()?.username?.charAt(0).toUpperCase()}
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
                    {capitalizeFirstLetter(decodedToken()?.username)}
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
                            display: "none", // Removes the underline
                          },
                        },
                      }}
                      fullWidth
                      multiline
                      value={editedComment}
                      onChange={(e) =>
                        setEditedComment(capitalizeFirstLetter(e.target.value))
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
                  <Box>
                    {/* Comment Text */}
                    <Typography variant="body1" sx={{ mb: 1, color: "white" }}>
                      {capitalizeFirstLetter(comment.comment)}
                    </Typography>
                    {/* Attachment Preview (if present) */}
                    {comment.attachment && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ color: "white" }}>
                          <a
                            href={comment.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "cyan",
                              textDecoration: "underline",
                            }}
                          >
                            *View Attachment
                          </a>
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons: Edit, Delete */}
                    <Box
                      sx={{
                        width: "20%",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "space-between",
                        color: "#5e6c84",
                        mt: isTab ? "2vh" : "5vh",
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
                          padding: "4px",
                          bgcolor: "gray",
                          ml: "2vw",
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
                  </Box>
                )}
              </Box>
            </Box>
          ))
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

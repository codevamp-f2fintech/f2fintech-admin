/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useState, useCallback, useRef, useEffect } from "react";
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
import Toast from "../../components/common/Toast";
import {
  useGetTicketActivities,
  useDeleteTicketActivity,
  useCreateTicketActivity,
  useModifyTicketActivity,
} from "@/hooks/ticketActivities";
import useIntersectionObserver from "@/hooks/IntersectionObserver";
import { TicketActivities } from "@/types/ticketActivities";
import { User } from "@/types/user";

const ITEMS_PER_PAGE = 3;

interface CommentsProps {
  storedTicketId: string | string[];
  userData: User;
}

const Comments = ({ storedTicketId, userData }: CommentsProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string | undefined>("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const { toast } = useSelector((state: RootState) => state.toast);
  const [currentPage, setCurrentPage] = useState(1);    // Current page for pagination
  const [showAttachment, setShowAttachment] = useState({});
  const [hasFetched, setHasFetched] = useState(false);   // New state to track if data is already fetched
  const commentRef = useRef(null);
  const isVisible = useIntersectionObserver(commentRef);

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, decodedToken, toastAndNavigate } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const { value: comments, refetch } = useGetTicketActivities(
    {} as TicketActivities,
    hasFetched ? `get-ticket-activities/${storedTicketId}` : ''
  );

  const { createTicketActivity } = useCreateTicketActivity(
    "create-ticket-activity"
  );
  const { deleteTicketActivity } = useDeleteTicketActivity(
    "delete-ticket-activity"
  );
  const { modifyTicketActivity } = useModifyTicketActivity(
    "update-ticket-activity"
  );

  useEffect(() => {
    if (isVisible && !hasFetched) {
      refetch();
      setHasFetched(true);
    }
  }, [isVisible, hasFetched]);

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
        refetch();
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Creating Comment");
      console.log("Error creating the comment:", error);
    }
  }, [attachment, newComment, storedTicketId, refetch]);

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      try {
        await deleteTicketActivity(commentId);
        toastAndNavigate(dispatch, true, "info", "Deleted Successfully");
        await refetch();
      } catch (error) {
        toastAndNavigate(dispatch, true, "error", "Error Deleting Comment");
        console.log("Error deleting the comment:", error);
      }
    },
    [deleteTicketActivity, refetch, dispatch, toastAndNavigate]
  );

  const handleEditComment = useCallback(
    (commentId: number, commentText: string) => {
      setEditingCommentId(commentId);
      setEditedComment(commentText);
    },
    []
  );

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
          refetch();
        }
      } catch (error) {
        toastAndNavigate(dispatch, true, "error", "Error Updating Comment");
        console.log("Error Updating the comment:", error);
      }
    },
    [editedComment, modifyTicketActivity, refetch, dispatch, toastAndNavigate]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditedComment("");
  }, []);

  const handleAttachmentChange = (e: any) => {
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

  const toggleAttachment = (commentId: any) => {
    setShowAttachment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <Box mt={2} mb={2} sx={{ position: "relative" }} ref={commentRef}>
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
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "transparent", // Remove border
              },
              "&:hover fieldset": {
                borderColor: "transparent", // Remove border on hover
              },
              "&.Mui-focused fieldset": {
                borderColor: "transparent", // Remove border on focus
              },
            },
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
            bgcolor: "#f06292",
            textAlign: "center",
            textTransform: "uppercase",
            backgroundSize: "200% auto",
            color: "white",
            borderRadius: "10px",
            display: "block",
            "&:hover": {
              bgcolor: "#9D50BB",
            },
          }}
          onClick={handleCreateComment}
        >
          Comment
        </Button>
      </Box>

      <Box mt={3}>
        {paginatedComments.length > 0 ? (
          paginatedComments.map((comment: any) => {
            const commentedBy = userData?.data?.results?.find(
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
                <Avatar sx={{ bgcolor: "white", mr: 2, color: "black" }}>
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
                      color="#FFFFFF"
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
                          height: isTab ? "6vh" : isMobile ? "10vh" : "12vh",
                          overflowY: "auto",

                          "&::-webkit-scrollbar": {
                            display: "none",
                          },
                        }}
                      >
                        {/* Comment Text */}
                        <Typography
                          variant="body1"
                          sx={{ mb: 1, color: "white", fontSize: ".9rem" }}
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
                                bgcolor: "#9D50BB",
                                color: "white",
                                width: isTab
                                  ? "14vw"
                                  : isMobile
                                    ? "35vw"
                                    : "9vw",
                                fontSize: isTab ? "" : isMobile ? ".6rem" : "0.85rem",
                                "&:hover": {
                                  bgcolor: "#f06292",
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
                                    ? "70vh"
                                    : isTab
                                      ? "70vh"
                                      : "100%",
                                  width: isMobile
                                    ? "95vw"
                                    : isTab
                                      ? "85vw"
                                      : "100%",
                                }}
                              >
                                <Box>
                                  <img
                                    src={comment.attachment}
                                    alt="Attachment Preview"
                                    style={{
                                      height: isMobile
                                        ? "62vh"
                                        : isTab
                                          ? "65vh"
                                          : "90vh",
                                      width: isMobile
                                        ? "89vw"
                                        : isTab
                                          ? "78vw"
                                          : "80vw",
                                      borderRadius: "8px",
                                      marginLeft: isMobile
                                        ? ""
                                        : isTab
                                          ? ""
                                          : "15vw",
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "20vw",
                                    marginLeft: isTab ? "30vw" : "45vw",
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
                            bgcolor: "#f06292",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#9D50BB",
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
                            bgcolor: "#f06292",
                            ml: "1vw",
                            "&:hover": {
                              bgcolor: "#9D50BB",
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

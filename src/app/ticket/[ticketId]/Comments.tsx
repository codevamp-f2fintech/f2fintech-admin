/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
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

import { format } from "date-fns";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showAttachment, setShowAttachment] = useState({});
  const [hasFetched, setHasFetched] = useState(false);
  const commentRef = useRef(null);
  const isVisible = useIntersectionObserver(commentRef);

  const dispatch: AppDispatch = useDispatch();
  const { capitalizeFirstLetter, decodedToken, toastAndNavigate } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const { value: comments, refetch } = useGetTicketActivities(
    {} as TicketActivities,
    hasFetched ? `get-ticket-activities/${storedTicketId}` : ""
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

  // Helper function to get file extension from URL
  const getFileExtensionFromUrl = (url: string) => {
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const extension = filename.split(".").pop()?.toLowerCase();
      return extension || "";
    } catch (error) {
      return "";
    }
  };

  // Helper function to check if attachment is PDF
  const isPdfAttachment = (attachmentUrl: string) => {
    const extension = getFileExtensionFromUrl(attachmentUrl);
    return extension === "pdf";
  };

  // Helper function to check if attachment is Excel based on URL
  const isExcelAttachment = (attachmentUrl: string) => {
    const extension = getFileExtensionFromUrl(attachmentUrl);
    const excelExtensions = ["xlsx", "xls", "csv", "xlsm", "xlsb"];
    return excelExtensions.includes(extension);
  };

  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim()) return;

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
          setEditingCommentId(null);
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

  // RECOMMENDED: Replace your existing toggleAttachment function with this
  const toggleAttachment = (commentId, attachmentUrl) => {
    if (isExcelAttachment(attachmentUrl)) {
      // Microsoft Office Online Viewer is most reliable for Excel files
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        attachmentUrl
      )}`;

      // Try opening the file
      const newWindow = window.open(officeViewerUrl, "_blank");

      // If popup is blocked or fails, provide alternative options
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === "undefined"
      ) {
        // Show options modal or direct download
        const shouldDownload = window.confirm(
          "Unable to open file in viewer. Would you like to download it instead?"
        );

        if (shouldDownload) {
          // Create download link
          const link = document.createElement("a");
          link.href = attachmentUrl;
          link.download = "";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } else if (isPdfAttachment(attachmentUrl)) {
      window.open(attachmentUrl, "_blank");
    } else {
      // For images and other files, use existing modal behavior
      setShowAttachment((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    }
  };

  // Solution 3: Client-side Excel parsing using XLSX library
  // Add this to your component imports
  // import * as XLSX from 'xlsx';

  const [excelData, setExcelData] = useState(null);
  const [showExcelModal, setShowExcelModal] = useState({});

  const parseExcelFile = async (attachmentUrl) => {
    try {
      const response = await fetch(attachmentUrl);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Get first worksheet
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      return data;
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      return null;
    }
  };

  const handleExcelView = async (commentId, attachmentUrl) => {
    const data = await parseExcelFile(attachmentUrl);
    if (data) {
      setExcelData({ [commentId]: data });
      setShowExcelModal((prev) => ({ ...prev, [commentId]: true }));
    } else {
      // Fallback to external viewer
      window.open(
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          attachmentUrl
        )}`,
        "_blank"
      );
    }
  };

  // Excel data display modal component
  const ExcelModal = ({ commentId, data, onClose }) => (
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
        maxHeight: "80vh",
        maxWidth: "90vw",
        overflow: "auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Excel File Preview</Typography>
        <Button onClick={onClose} variant="contained" color="error">
          Close
        </Button>
      </Box>

      <Box sx={{ overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    backgroundColor: rowIndex === 0 ? "#f5f5f5" : "white",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </table>
      </Box>
    </Box>
  );

  // Solution 4: Improved button with better UX
  const ExcelFileButton = ({ commentId, attachmentUrl }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
      setLoading(true);

      try {
        // Try Office Online first
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          attachmentUrl
        )}`;
        const newWindow = window.open(officeUrl, "_blank");

        // Check if window opened successfully
        if (!newWindow) {
          // Popup blocked, try alternative
          window.location.href = officeUrl;
        }
      } catch (error) {
        console.error("Error opening Excel file:", error);
        // Fallback to download
        const link = document.createElement("a");
        link.href = attachmentUrl;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Button
        onClick={handleClick}
        disabled={loading}
        variant="contained"
        sx={{
          textTransform: "none",
          bgcolor: "#155fcc",
          color: "white",
          "&:hover": {
            bgcolor: "#",
            color: "black",
          },
          "&:disabled": {
            bgcolor: "#ccc",
          },
        }}
      >
        {loading ? "Opening..." : "Open Excel File"}
      </Button>
    );
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
            boxShadow: "0px 4px 20px rgba(149, 117, 205, 0.3)",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "transparent",
              },
              "&:hover fieldset": {
                borderColor: "transparent",
              },
              "&.Mui-focused fieldset": {
                borderColor: "transparent",
              },
            },
            "&::-webkit-scrollbar": {
              display: "none",
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
            bgcolor: "#155fcc",
            textAlign: "center",
            textTransform: "uppercase",
            backgroundSize: "200% auto",
            color: "white",
            borderRadius: "10px",
            display: "block",
            "&:hover": {
              bgcolor: "#155fcc",
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
                <Avatar sx={{ bgcolor: "white", mr: 2, color: "black" }}>
                  {commentedBy?.username?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
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
                      color="#000"
                      sx={{ ml: "20vw" }}
                    >
                      {format(
                        new Date(comment.created_at),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )}
                    </Typography>
                  </Box>

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
                          sx={{ ml: 2, color: "white", bgcolor: "#f06292" }}
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
                        <Typography
                          variant="body1"
                          sx={{ mb: 1, color: "gray", fontSize: ".9rem" }}
                        >
                          {capitalizeFirstLetter(comment.comment)}
                        </Typography>
                        {comment.attachment && (
                          <Box>
                            <Button
                              onClick={() =>
                                toggleAttachment(comment.id, comment.attachment)
                              }
                              variant="contained"
                              sx={{
                                textTransform: "none",
                                bgcolor: "#0c66e4",
                                color: "white",
                                width: isTab
                                  ? "14vw"
                                  : isMobile
                                  ? "35vw"
                                  : "9vw",
                                fontSize: isTab
                                  ? ""
                                  : isMobile
                                  ? ".6rem"
                                  : "0.85rem",
                                "&:hover": {
                                  bgcolor: "#0c66e4",
                                  color: "black",
                                },
                              }}
                            >
                              {isExcelAttachment(comment.attachment)
                                ? "Open Excel File"
                                : showAttachment[comment.id]
                                ? "Hide Attachment"
                                : "View Attachment"}
                            </Button>

                            {/* Only show modal for non-Excel files */}
                            {!isExcelAttachment(comment.attachment) &&
                              showAttachment[comment.id] && (
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
                                    <Button
                                      onClick={() =>
                                        toggleAttachment(
                                          comment.id,
                                          comment.attachment
                                        )
                                      }
                                      variant="contained"
                                      size="small"
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.85rem",
                                        color: "white",
                                        bgcolor: "#f06292",
                                        mr: "1vw",
                                        "&:hover": {
                                          bgcolor: "red",
                                          color: "white",
                                        },
                                      }}
                                    >
                                      Close
                                    </Button>
                                    <Button
                                      size="small"
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.85rem",
                                        color: "white",
                                        bgcolor: "#f06292",
                                        "&:hover": {
                                          bgcolor: "red",
                                          color: "white",
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
                            bgcolor: "#155fcc",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#9D50BB",
                              color: "white",
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
                              bgcolor: "red",
                              color: "white",
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
          <Typography
            sx={{
              color: "black",
            }}
          >
            No comments available
          </Typography>
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

export default memo(Comments);

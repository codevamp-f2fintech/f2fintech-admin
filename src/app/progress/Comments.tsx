import axios from "axios";
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
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

interface CommentsProps {
    storedTicketId: number;
    theme: any;
}

const Comments = ({ storedTicketId, theme }: CommentsProps) => {
    const [newComment, setNewComment] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editedComment, setEditedComment] = useState<string>("");
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState('');
    const { toast } = useSelector((state: RootState) => state.toast);

    const dispatch: AppDispatch = useDispatch();
    const { toastAndNavigate } = Utility();

    // Fetch comments data
    const { value: comments, refetch } = useGetTicketActivities(
        [],
        `get-all-ticket-activities/${storedTicketId}`
    );

    // Hook for creating new ticket activity (comment)
    const { createTicketActivity } = useCreateTicketActivity("create-ticket-activity");

    // Hook for deleting ticket activity
    const { deleteTicketActivity } = useDeleteTicketActivity("delete-ticket-activity");

    // Hook for modifying ticket activity (editing comments)
    const { modifyTicketActivity } = useModifyTicketActivity("update-ticket-activity");

    // Create comment handler, memoized
    const handleCreateComment = useCallback(async () => {
        if (!newComment.trim()) return;  // Don't allow empty comments

        try {
            let attachmentUrl = null;

            if (attachment) {
                try {
                    const formData = new FormData();
                    formData.append("document", attachment);
                    formData.append("folder", `comment/${attachment.name}`);

                    const uploadResponse = await axios.post('http://localhost:8080/api/v1/upload-to-s3',
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        });
                    attachmentUrl = uploadResponse.data.data;
                } catch (err) {
                    console.log("Error uploading attachment:", err);
                    toastAndNavigate(dispatch, true, "error", "Error uploading attachment");
                }
            }

            const newCommentData = {
                ticket_id: storedTicketId,
                comment: newComment,
                attachment: attachmentUrl
            };
            const createdComment = await createTicketActivity(newCommentData);
            if (createdComment) {
                setNewComment("");
                setAttachmentPreview('');
                toastAndNavigate(dispatch, true, "info", "Commented Successfully");
                refetch();  // Refetch the comments after successful creation
            }
        } catch (error) {
            toastAndNavigate(dispatch, true, "error", "Error Creating Comment");
            console.log("Error creating the comment:", error);
        }
    }, [attachment, newComment, storedTicketId, createTicketActivity, refetch, dispatch, toastAndNavigate]);

    // Delete comment handler, memoized
    const handleDeleteComment = useCallback(async (commentId: number) => {
        try {
            await deleteTicketActivity(commentId);
            toastAndNavigate(dispatch, true, "info", "Deleted Successfully");
            await refetch(); // Refetch comments after successful deletion
        } catch (error) {
            toastAndNavigate(dispatch, true, "error", "Error Deleting Comment");
            console.log("Error deleting the comment:", error);
        }
    }, [deleteTicketActivity, refetch, dispatch, toastAndNavigate]);

    // Start editing a comment
    const handleEditComment = useCallback((commentId: number, commentText: string) => {
        setEditingCommentId(commentId);
        setEditedComment(commentText);
    }, []);

    // Save edited comment handler, memoized
    const handleSaveEditComment = useCallback(async (commentId: number, ticketId: number) => {
        if (!editedComment.trim()) return;
        try {
            const updatedCommentData = {
                comment: editedComment,
                updated_at: new Date().toISOString(),
            };
            const updatedComment = await modifyTicketActivity(ticketId, commentId, updatedCommentData);
            if (updatedComment) {
                setEditingCommentId(null); // Reset editing mode
                setEditedComment("");
                toastAndNavigate(dispatch, true, "info", "Updated Successfully");
                refetch(); // Refetch comments after successful update
            }
        } catch (error) {
            toastAndNavigate(dispatch, true, "error", "Error Updating Comment");
            console.log("Error Updating the comment:", error);
        }
    }, [editedComment, modifyTicketActivity, refetch, dispatch, toastAndNavigate]);

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
            setAttachmentPreview('');
        }
    };

    const handleAttachmentDelete = () => {
        setAttachment(null);
        setAttachmentPreview('');
    };

    console.log("attachment comments", attachment);
    console.log(comments.data, 'comments')

    return (
        <Box mt={2} mb={2} sx={{ position: "relative" }}>
            <Box sx={{ position: "relative", mb: 2 }}>
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
                        borderRadius: 2,
                        border: "1px solid rgba(0, 0, 0, 0.1)"
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
                            sx={{ maxHeight: 100, maxWidth: 100, ml: 2, borderRadius: 2 }}
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
                {comments && comments.data ? (
                    comments.data.map((comment) => (
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
                                {comment.userInitials || "U"}
                            </Avatar>

                            <Box sx={{ flexGrow: 1 }}>
                                {/* Comment Header: User Name, Date */}
                                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                    <Typography fontWeight="bold" sx={{ marginRight: "8px" }}>
                                        {comment.userName || "Anonymous"}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {formatDistanceToNow(new Date(comment.created_at))} ago
                                    </Typography>
                                </Box>

                                {/* Comment Content / Edit Mode */}
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
                                        {/* Comment Text */}
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            {comment.comment}
                                        </Typography>
                                        {/* Attachment Preview (if present) */}
                                        {comment.attachment && (
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <Typography variant="body2" color="primary">
                                                    <a href={comment.attachment} target="_blank" rel="noopener noreferrer">
                                                        View Attachment
                                                    </a>
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Action Buttons: Edit, Delete */}
                                        <Box sx={{ width: '20%', display: "flex", alignItems: "center", flexDirection: 'space-between', color: "#5e6c84" }}>
                                            <Button
                                                size="small"
                                                sx={{ textTransform: "none", fontSize: "0.85rem", color: "#5e6c84" }}
                                                onClick={() => handleEditComment(comment.id, comment.comment)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                sx={{ textTransform: "none", fontSize: "0.85rem", color: "#5e6c84", padding: "4px" }}
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
            </Box>
            <Toast
                alerting={toast.toastAlert}
                severity={toast.toastSeverity}
                message={toast.toastMessage}
            />
        </Box>
    );
};

export default Comments;

"use client";
import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Typography,
  Avatar,
  Box,
  Checkbox,
  Chip,
  useMediaQuery,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  Paper,
  CardContent,
  Card,
  TextField,
  TableCell,
  TableRow,
  Modal,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  MailRounded,
  PhoneRounded,
  AccessTimeRounded,
  LocationOnRounded,
  Close,
  DeleteForever,
  DeleteOutline,
  ExpandMore,
  ExpandLess,
  DeleteOutlined,
} from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from '@mui/icons-material/Business';
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useCreateTicket } from "@/hooks/ticket";
import { Utility } from "@/utils";
import { useModifyCustomerApplication } from "@/hooks/customerApplication";
import { fetcher } from "@/apis/apiClient";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { resetCustomerApplications } from "@/redux/features/customerApplicationSlice";
import { resetTickets } from "@/redux/features/ticketSlice";
import { axiosInstance } from "@/apis/config/axiosConfig";

interface ApplicationCardProps {
  customerApplication: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerContact?: string;
    customerProfileImage?: string;
    customerLocation?: string;
    customerState?: string;
    state?: string;
    applicationAmount: string;
    loanType: string;
    leadType?: string;
    applicationTenure: number;
    applicationDate: string;
    applicationId: number;
    ticketId?: number;
    ticketStatus?: string;
    loanStatus?: string;
    userRole?: string;
    applicationProvider?: string;
    showDeleteButton?: boolean;
    disbursed_At?: string;
    disbursed_Amount?: number;
    approved_At?: string;
    approved_Amount?: number;
    due_date?: string;
    source?: string;
    applicationSource?: string;
    existing_loans?: string;
    existingLoans?: string;
    onDelete: (applicationId: string, customerName: string) => void;
  };
  handleStartClick?: (ticketId: number) => void;
  showDeleteButton?: boolean;
  refetch?: () => Promise<void>;
  userRole?: string;
  handleDeleteTicket?: (ticketId: number) => void;
  isApplication?: boolean;
  toggleListView?: string;
  mainIndex?: number;
  validateCompanyForCheckbox?: () => boolean;
}

function InfoRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string | undefined;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          color: "#6E44FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(110, 68, 255, 0.1)",
          borderRadius: "50%",
          padding: "8px",
        }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          fontSize: "small",
        })}
      </Box>
      <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium" }}>
        {text}
      </Typography>
    </Box>
  );
}

function InfoChip({
  icon,
  text,
  color = "#6E44FF",
}: {
  icon: React.ReactNode;
  text: string | undefined;
  color?: string;
}) {
  return (
    <Chip
      icon={React.cloneElement(icon as React.ReactElement, {
        fontSize: "small",
        sx: { color: color },
      })}
      label={text}
      variant="outlined"
      size="small"
      sx={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}10`,
        fontWeight: "medium",
        "& .MuiChip-icon": {
          color: color,
        },
      }}
    />
  );
}

const DirectBadge: React.FC = () => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "#3f50b5",
      color: "white",
      fontSize: "0.65rem",
      fontWeight: "bold",
      px: 0.8,
      py: 0.2,
      borderRadius: "4px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      boxShadow: "0 2px 4px rgba(63, 80, 181, 0.3)",
      verticalAlign: "middle",
      lineHeight: 1,
    }}
  >
    Direct
  </Box>
);

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  customerApplication,
  handleStartClick = null,
  showDeleteButton = false,
  refetch = null,
  onDelete,
  userRole,
  handleDeleteTicket,
  handleDeleteApplication,
  isApplication = false,
  toggleListView,
  mainIndex,
  validateCompanyForCheckbox
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showComment, setShowComment] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [commentData, setCommentData] = useState<any[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(dayjs().add(2, 'day'));
  const [isPickingUp, setIsPickingUp] = useState<boolean>(false);
  const [pickupEvent, setPickupEvent] = useState<React.MouseEvent | undefined>(undefined);

  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();
  const {
    calculateDaysAgo,
    capitalizeFirstLetter,
    decodedToken,
    formatTenure,
  } = Utility();

  const [showOtpComponent, setShowOtpComponent] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");
  const isIpad = useMediaQuery("(min-width:1000px) and (max-width:1300px)");
  const [deleteReason, setDeleteReason] = useState<string>("");

  const isOverdue = React.useMemo(() => {
    if (!customerApplication.due_date || customerApplication.approved_At) return false;
    return dayjs().isAfter(dayjs(customerApplication.due_date), 'day');
  }, [customerApplication.due_date, customerApplication.approved_At]);


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(
      customerApplication.applicationId,
      customerApplication.customerName
    );
  };

  const { createTicket } = useCreateTicket("create-ticket");
  const { modifyCustomerApplication: modifyiedCustomerApplication } =
    useModifyCustomerApplication("update-loan-application");

  const toggleHistory = () => setShowHistory((prev) => !prev);
  const toggleExpanded = () => setExpanded((prev) => !prev);
  const toggleComment = () => setShowComment((prev) => !prev);

  const formattedCreatedAt = customerApplication?.applicationDate
    ? `Application At: ${new Date(customerApplication.applicationDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`
    : "Created At: N/A";

  const openConfirmDialog = (e) => {
    e.stopPropagation();
    setOpenDeleteDialog(true);
  };

  const closeConfirmDialog = () => {
    setOpenDeleteDialog(false);
  };

  const confirmDelete = async () => {
    if (!deleteReason.trim()) {
      toastAndNavigate(
        dispatch,
        true,
        "error",
        "Please provide a reason for deletion",
        null,
        null,
        true
      );
      return;
    }

    if (handleDeleteTicket && !isApplication) {
      try {
        await handleDeleteTicket(customerApplication.ticketId, deleteReason);
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Ticket deleted successfully",
          null,
          null,
          false
        );
        closeConfirmDialog();
      } catch (error) {
        console.log("Error deleting ticket:", error);
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "Failed to delete ticket. Please try again.",
          null,
          null,
          true
        );
      }
    }
    if (isApplication && handleDeleteApplication) {
      handleDeleteApplication(customerApplication.applicationId);
    }
  };

  useEffect(() => {
    if (showHistory && customerApplication?.ticketId) {
      const fetchHistoryData = async () => {
        try {
          const response = await axiosInstance.get(
            `get-ticket-histories/${customerApplication.ticketId}`
          );
          const data = response.data;

          if (data.statusCode === 200) {
            setHistoryData(data.data);
          } else {
            console.error("Failed to fetch history data:", data.message);
          }
        } catch (error) {
          console.error("Error fetching history data:", error);
        }
      };
      fetchHistoryData();
    }
  }, [showHistory, customerApplication?.ticketId]);

  useEffect(() => {
    if (showComment && customerApplication?.ticketId) {
      const fetchCommentData = async () => {
        try {
          const response = await axiosInstance.get(
            `get-ticket-activities/${customerApplication.ticketId}`
          );
          const data = response.data;

          if (data.statusCode === 200) {
            setCommentData(data.data);
          } else {
            console.error("Failed to fetch comment data:", data.message);
          }
        } catch (error) {
          console.error("Error fetching comment data:", error);
        }
      };
      fetchCommentData();
    }
  }, [showComment, customerApplication?.ticketId]);

  const handleCheckboxClick = (e?: React.MouseEvent) => {
    // Validate company selection
    if (validateCompanyForCheckbox && !validateCompanyForCheckbox()) {
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    setPickupEvent(e);
    setPickupDate(dayjs().add(2, 'day'));
    setShowPickupModal(true);
  };

  const confirmPickup = async () => {
    if (!pickupDate) {
      toastAndNavigate(
        dispatch,
        true,
        "error",
        "Please select an expected decision date.",
        null,
        null,
        true
      );
      return;
    }

    setIsPickingUp(true);
    try {
      const userInfo = decodedToken();

      const ticketResponse = await createTicket({
        customer_application_id: customerApplication.applicationId,
        user_id: decodedToken()?.id,
        status: "operations",
        due_date: pickupDate.toISOString(),
      });

      if (ticketResponse?.statusCode === 409) {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          "This Application Is Already Picked By Another User. Please Pick Another Application.",
          null,
          null,
          false,
          true
        );

        dispatch(resetCustomerApplications(customerApplication.applicationId));
      } else {
        dispatch(resetTickets());
        await modifyiedCustomerApplication(customerApplication.applicationId, {
          is_picked: 1,
        });
        dispatch(resetCustomerApplications(customerApplication.applicationId));
        setShowPickupModal(false);
      }
    } catch (error) {
      console.log("Error in checkbox change:", error);
    } finally {
      setIsPickingUp(false);
    }
  };

  useEffect(() => {
    // Collapse when it's an application
    if (isApplication) {
      setExpanded(false);
    }
  }, [isApplication]);

  const formatRupees = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const ListView = () => {
    const [showAttachment, setShowAttachment] = useState({});

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

    const isPdfAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      return extension === "pdf";
    };

    const isExcelAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const excelExtensions = ["xlsx", "xls", "csv", "xlsm", "xlsb"];
      return excelExtensions.includes(extension);
    };

    const isImageAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
      ];
      return imageExtensions.includes(extension);
    };

    const toggleAttachment = (commentId: number | string, attachmentUrl: string) => {
      if (isExcelAttachment(attachmentUrl)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          attachmentUrl
        )}`;

        const newWindow = window.open(officeViewerUrl, "_blank");

        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          const shouldDownload = window.confirm(
            "Unable to open file in viewer. Would you like to download it instead?"
          );

          if (shouldDownload) {
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
        setShowAttachment((prev) => ({
          ...prev,
          [commentId]: !prev[commentId],
        }));
      }
    };

    return (
      <>
        <Grid item xs={20} key={customerApplication.customerId}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: {
                xs: "14vh",
                sm: "inherit",
                md: "inherit",
              },
              mb: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-2px)",
              },
              overflowY: { xs: "scroll", sm: "visible" },
              scrollbarWidth: { xs: "thin", sm: "none" },
              "&::-webkit-scrollbar": {
                width: "6px",
                display: { xs: "block", sm: "none" },
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: "3px",
              },
              WebkitOverflowScrolling: { xs: "touch", sm: "auto" },
            }}
          >
            <ListItem
              sx={{
                flexDirection: isMobile ? "row" : "row",
                alignItems: isMobile ? "stretch" : "center",
                p: 1,
                backgroundColor: "#f5f8ff",
                color: "#1e3a5f",
                borderBottom: "1px solid rgba(12,66,160,0.08)",
              }}
            >
              <ListItemAvatar sx={{ minWidth: isMobile ? "auto" : 60 }}>
                <Avatar
                  alt={capitalizeFirstLetter(
                    customerApplication.customerName.split(".")[1]?.trim() ||
                    customerApplication.customerName
                      .split(" ")
                      .slice(1)
                      .join(" ")
                  )}
                  src={customerApplication.customerProfileImage}
                  sx={{
                    width: isMobile ? 40 : 32,
                    height: isMobile ? 40 : 32,
                    background: "#1e3a5f",
                    color: "white",
                    fontSize: isMobile ? 16 : 20,
                    fontWeight: "bold",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(12,66,160,0.2)",
                    mx: isMobile ? "auto" : 0,
                    mb: isMobile ? 0.25 : 0,
                  }}
                />
              </ListItemAvatar>

              {/* Main Content */}
              <ListItemText
                sx={{
                  flex: 1,
                  ml: isMobile ? 0 : 1,
                  textAlign: isMobile ? "center" : "left",
                }}
                primary={
                  <Typography
                    variant={isMobile ? "body1" : "subtitle1"}
                    sx={{
                      fontWeight: "semibold",
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                        md: ".5rem",
                        lg: "1.125rem",
                        xl: "1.25rem",
                      },
                      color: "#000",
                      mb: 0.25,
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {customerApplication.customerName?.toUpperCase()}
                    {(customerApplication.source === "website" || customerApplication.applicationSource === "website") && <DirectBadge />}
                  </Typography>
                }
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: 0.5,
                      flexWrap: "wrap",
                      alignItems: isMobile ? "center" : "flex-start",
                    }}
                  >
                    <InfoChip
                      icon={<CurrencyRupeeIcon />}
                      text={formatRupees(customerApplication.applicationAmount)}
                      color="#0c66e4"
                    />
                    {customerApplication.applicationProvider && (
                      <InfoChip
                        icon={<AccountBalanceIcon />}
                        text={customerApplication.applicationProvider}
                        color="#0c66e4"
                      />
                    )}
                    <InfoChip
                      icon={<AccountBalanceIcon />}
                      text={customerApplication?.loanType}
                      color="#0c66e4"
                    />
                    <InfoChip
                      icon={<BusinessIcon />}
                      text={customerApplication?.leadType}
                      color="#0c66e4"
                    />
                    <InfoChip
                      icon={<AccessTimeRounded />}
                      text={formatTenure(customerApplication.applicationTenure)}
                      color="#0c66e4"
                    />
                    {/* <InfoChip
                      icon={<AccessTimeRounded />}
                      text={capitalizeFirstLetter( customerApplication.loan_category )}
                      color="#0c66e4"
                    /> */}
                    {userRole !== "sales" && (
                      <>
                        {userRole === "admin" ||
                          customerApplication.ticketStatus !== "disbursed" ? (
                          <InfoChip
                            icon={<MailRounded />}
                            text={customerApplication.customerEmail}
                            color="#33415c"
                          />
                        ) : (
                          <InfoChip
                            icon={<MailRounded />}
                            text="N/A"
                            color="#33415c"
                          />
                        )}
                      </>
                    )}

                    {customerApplication.customerLocation && (
                      <InfoChip
                        icon={<LocationOnRounded />}
                        text={capitalizeFirstLetter(
                          customerApplication.customerLocation
                        )}
                        color="#33415c"
                      />
                    )}
                    {customerApplication.customerState && (
                      <InfoChip
                        icon={<LocationOnRounded />}
                        text={capitalizeFirstLetter(
                          customerApplication.customerState
                        )}
                        color="#33415c"
                      />
                    )}
                    <InfoChip
                      icon={<AccessTimeRounded />}
                      text={
                        customerApplication?.disbursedAt
                          ? `Disbursed: ${new Date(customerApplication.disbursedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}`
                          : "Not Disbursed"
                      }
                      color="#33415c"
                    />
                    <InfoChip
                      icon={<AccessTimeRounded />}
                      text={
                        customerApplication?.approved_At
                          ? `Approved: ${new Date(customerApplication.approved_At).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}`
                          : "Not Approved"
                      }
                      color="#33415c"
                    />
                    <InfoChip
                      icon={<AccessTimeRounded />}
                      text={
                        customerApplication?.due_date
                          ? `Expected: ${new Date(customerApplication.due_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}`
                          : "No Expected Date"
                      }
                      color={isOverdue ? "#D32F2F" : "#33415c"}
                    />
                    <Chip
                      label={formattedCreatedAt}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "#33415c",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                }
              />

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "row" : "column",
                  gap: 0.5,
                  alignItems: "center",
                  mt: isMobile ? 0.5 : 0,
                }}
              >
                {/* Delete Button */}
                {(showDeleteButton ||
                  (userRole === "admin" && handleDeleteTicket)) && (
                    <IconButton
                      onClick={openConfirmDialog}
                      sx={{
                        color: "#f44336",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": {
                          backgroundColor: "rgba(244, 67, 54, 0.1)",
                          color: "#d32f2f",
                        },
                      }}
                      size="small"
                    >
                      <DeleteOutline sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                {/* Expand/Collapse Button */}
                {!isApplication && (
                  <IconButton
                    onClick={toggleExpanded}
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.2)",
                      },
                    }}
                    size="small"
                  >
                    {expanded ? (
                      <ExpandLess sx={{ fontSize: 18 }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                )}

                {/* Pick Checkbox */}
                {decodedToken()?.role !== "sales" && !handleStartClick && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ mr: 0.5, color: "white", fontWeight: "bold" }}
                    >
                      Pick
                    </Typography>
                    <Checkbox
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckboxClick(e);
                      }}
                      size="small"
                      sx={{
                        color: toggleListView === "table" ? "#666" : toggleListView === "list" ? "white" : "black",
                        "&.Mui-checked": {
                          color: "#FFD93D",
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </ListItem>

            {/* Expanded Details */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ p: 1, bgcolor: "#c4d5eb" }}>
                {!showHistory && !showComment ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  ></Box>
                ) : showHistory ? (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#333", mb: 1 }}
                    >
                      History
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: "120px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#f1f1f1",
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#888",
                          borderRadius: "3px",
                        },
                      }}
                    >
                      {historyData.length > 0 ? (
                        historyData.map((history, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              mb: 1,
                              p: 1,
                              bgcolor: "#f5f5f5",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "black",
                                fontWeight: "medium",
                                mb: 0.25,
                              }}
                            >
                              <strong>
                                {capitalizeFirstLetter(
                                  history.action.split(" ")[0]
                                )}
                              </strong>
                              {` ${history.action.substring(
                                history.action.indexOf(" ") + 1
                              )}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#1976d2" }}
                            >
                              {new Date(history.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              ({calculateDaysAgo(history.created_at)} days ago)
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          No history data available.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : showComment ? (
                  // Enhanced Comment Data Section with Image Preview
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#333", mb: 1 }}
                    >
                      Comments
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#f1f1f1",
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#888",
                          borderRadius: "3px",
                        },
                      }}
                    >
                      {commentData?.length > 0 ? (
                        commentData.map((comment, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              mb: 1,
                              p: 1,
                              bgcolor: "#f5f5f5",
                              borderRadius: 1,
                            }}
                          >
                            {/* User Name */}
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: "bold",
                                color: "black",
                                mb: 0.25,
                              }}
                            >
                              {capitalizeFirstLetter(
                                comment?.user?.username || "Anonymous"
                              )}
                            </Typography>

                            {/* Comment Text */}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "black",
                                fontStyle: "normal",
                                mb: 0.5,
                              }}
                            >
                              {capitalizeFirstLetter(comment.comment)}
                            </Typography>

                            {/* Attachment Section */}
                            {comment.attachment && (
                              <Box sx={{ mb: 0.5 }}>
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
                                    bgcolor: "#0c66e4",
                                    color: "white",
                                    fontSize: "0.7rem",
                                    padding: "3px 6px",
                                    minHeight: "auto",
                                    "&:hover": {
                                      bgcolor: "#085cb8",
                                    },
                                  }}
                                >
                                  {isExcelAttachment(comment.attachment)
                                    ? "Open Excel File"
                                    : isPdfAttachment(comment.attachment)
                                      ? "Open PDF"
                                      : showAttachment[comment.id]
                                        ? "Hide Attachment"
                                        : "View Attachment"}
                                </Button>
                              </Box>
                            )}

                            {/* Meta Info */}
                            <Typography
                              variant="caption"
                              sx={{ color: "#1976d2" }}
                            >
                              {new Date(comment.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              ({calculateDaysAgo(comment.created_at)} days ago)
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          No comments available.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : null}

                {/* Action Buttons */}
                {handleStartClick && customerApplication.ticketId && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1,
                      flexDirection: isMobile ? "column" : "row",
                    }}
                  >
                    {userRole !== "sales" && (
                      <Button
                        variant="contained"
                        onClick={handleStartClick}
                        sx={{
                          bgcolor: "#0c66e4",
                          "&:hover": {
                            bgcolor: "#0c66e4",
                          },
                        }}
                      >
                        Visit Ticket
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={toggleHistory}
                      sx={{
                        borderColor: "#667eea",
                        color: "#667eea",
                        "&:hover": {
                          borderColor: "#5a6fd8",
                          bgcolor: "rgba(102, 126, 234, 0.04)",
                        },
                      }}
                    >
                      {showHistory ? "Close History" : "Show History"}
                    </Button>
                    {userRole === "sales" && (
                      <Button
                        variant="outlined"
                        onClick={toggleComment}
                        sx={{
                          borderColor: "#667eea",
                          color: "#667eea",
                          "&:hover": {
                            borderColor: "#5a6fd8",
                            bgcolor: "rgba(102, 126, 234, 0.04)",
                          },
                        }}
                      >
                        {showComment ? "Close Comments" : "Comments"}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        {Object.keys(showAttachment).some((key) => showAttachment[key]) &&
          (() => {
            const activeCommentId = Object.keys(showAttachment).find(
              (key) => showAttachment[key]
            );
            const activeComment = commentData.find(
              (comment) => comment.id.toString() === activeCommentId
            );

            if (!activeComment || !activeComment.attachment) return null;

            return (
              <>
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    zIndex: 999,
                  }}
                  onClick={() =>
                    toggleAttachment(activeComment.id, activeComment.attachment)
                  }
                />

                {/* Modal Content */}
                <Box
                  sx={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
                    padding: 2,
                    textAlign: "center",
                    height: isMobile ? "80vh" : isTab ? "80vh" : "85vh",
                    width: isMobile ? "95vw" : isTab ? "85vw" : "80vw",
                    maxHeight: "90vh",
                    maxWidth: "90vw",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header with close button */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      borderBottom: "1px solid #eee",
                      pb: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "black" }}>
                      Attachment Preview
                    </Typography>
                    <Button
                      onClick={() =>
                        toggleAttachment(
                          activeComment.id,
                          activeComment.attachment
                        )
                      }
                      variant="contained"
                      size="small"
                      sx={{
                        minWidth: "auto",
                        padding: "4px 8px",
                        bgcolor: "#f06292",
                        color: "white",
                        "&:hover": {
                          bgcolor: "red",
                        },
                      }}
                    >
                      ✕
                    </Button>
                  </Box>

                  {/* Image Display */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                      borderRadius: "4px",
                    }}
                  >
                    <img
                      src={activeComment.attachment}
                      alt="Attachment Preview"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <Box
                      sx={{
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "200px",
                        color: "#666",
                        flexDirection: "column",
                      }}
                    >
                      <Typography>Unable to preview this file</Typography>
                      <Button
                        href={activeComment.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        Download File
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </>
            );
          })()}
      </>
    );
  };

  const GridView = () => {
    const isSalesUser =
      userRole === "sales" || decodedToken()?.role === "sales";
    const [showAttachment, setShowAttachment] = useState({});

    // Helper functions for file handling
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

    const isPdfAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      return extension === "pdf";
    };

    const isExcelAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const excelExtensions = ["xlsx", "xls", "csv", "xlsm", "xlsb"];
      return excelExtensions.includes(extension);
    };

    const isImageAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
      ];
      return imageExtensions.includes(extension);
    };

    const toggleAttachment = (commentId: number | string, attachmentUrl: string) => {
      if (isExcelAttachment(attachmentUrl)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          attachmentUrl
        )}`;

        const newWindow = window.open(officeViewerUrl, "_blank");

        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          const shouldDownload = window.confirm(
            "Unable to open file in viewer. Would you like to download it instead?"
          );

          if (shouldDownload) {
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
        // For images and other files, use modal behavior
        setShowAttachment((prev) => ({
          ...prev,
          [commentId]: !prev[commentId],
        }));
      }
    };

    return (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
        item
        xs={12}
        sm={6}
        md={4}
        key={customerApplication.customerId}
      >
        <Card
          sx={{
            maxWidth: 345,
            borderRadius: 4,
            overflow: "visible",
            position: "relative",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            backgroundImage: "linear-gradient(135deg, #fff 0%, #fff 100%)",
            backgroundBlendMode: "multiply, screen, normal",
            pt: isMobile ? 3 : isTab ? 4 : 5,
            minHeight: isMobile ? "220px" : isTab ? "280px" : "320px",
            height: "auto",
            mt: 5,
          }}
        >
          {/* Delete Button */}
          {showDeleteButton && (
            <IconButton
              onClick={openConfirmDialog}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "",
                backgroundColor: "#adb5bd",
                "&:hover": {
                  backgroundColor: "#adb5bd",
                  color: "#d32f2f",
                },
                zIndex: 1,
              }}
              size="small"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          )}
          <CardContent sx={{ pt: 0, pb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar
                alt={capitalizeFirstLetter(
                  customerApplication.customerName.split(".")[1]?.trim() ||
                  customerApplication.customerName
                    .split(" ")
                    .slice(1)
                    .join(" ")
                )}
                src={customerApplication.customerProfileImage}
                sx={{
                  width: 80,
                  height: 80,
                  background: "#1e3a5f",
                  color: "white",
                  fontSize: 36,
                  fontWeight: "bold",
                  position: "absolute",
                  top: -40,
                  left: "50%",
                  transform: "translateX(-50%)",
                  border: "4px solid white",
                  boxShadow: "0 4px 10px rgba(12,66,160,0.3)",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: .5,
              }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{
                  mb: 1,
                  color: "black",
                  fontWeight: "bold",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  textAlign: "center",
                  fontSize: isTab ? "1rem" : "1rem",
                  height: isMobile ? "7vh" : isIpad ? "7vh" : isTab ? "5vh" : "8vh",
                  width: isMobile ? "80vw" : isTab ? "25vw" : "30vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {customerApplication.customerName?.toUpperCase()}
                {(customerApplication.source === "website" || customerApplication.applicationSource === "website") && <DirectBadge />}
              </Typography>
              {/* Delete button for admin only */}
              {userRole === "admin" && handleDeleteTicket && (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    top: { xs: "1vh", sm: "2vh", md: "2.5vh" },
                    ml: { xs: "40vw", sm: "25vw", md: "17vw" },
                    width: { xs: "15%", sm: "12%", md: "10%" },
                    borderRadius: "50px",
                    backgroundColor: "transparent",
                    color: "#e5383b",
                    boxShadow: "none",
                    minWidth: "auto",
                    padding: { xs: "6px", sm: "8px", md: "10px" },
                    "&:hover": {
                      bgcolor: "#cc0000",
                      color: "white",
                    },
                    "& .MuiButton-startIcon": {
                      margin: { xs: 0, sm: 0, md: 0 },
                    },
                  }}
                  onClick={openConfirmDialog}
                >
                  <DeleteOutlined fontSize="small" />
                </Button>
              )}
            </Box>

            {!showHistory && !showComment ? (
              <Box
                sx={{
                  display: "flex",
                  gap: isSalesUser ? 1 : 1.5,
                  flexDirection: "column",
                  bgcolor: "rgba(255,255,255,0.9)",
                  borderRadius: "10px 10px 0px 0px",
                  p: isSalesUser ? 1.5 : 2,
                  height: isSalesUser
                    ? isMobile
                      ? "30vh"
                      : isTab
                        ? "28vh"
                        : "40vh"
                    : isMobile
                      ? "42vh"
                      : isTab
                        ? "30vh"
                        : "58vh",
                }}
              >
                {userRole !== "sales" && (
                  <InfoRow
                    icon={<MailRounded
                      sx={{
                        fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                      }} />}
                    text={
                      userRole === "admin" ||
                        customerApplication.ticketStatus !== "disbursed"
                        ? customerApplication.customerEmail
                        : "N/A"
                    }
                  />
                )}

                <InfoRow
                  icon={<CurrencyRupeeIcon
                    sx={{
                      fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                    }} />}
                  text={formatRupees(customerApplication.applicationAmount)}
                />
                <InfoRow
                  icon={<AccessTimeRounded
                    sx={{
                      fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                    }} />}
                  text={formatTenure(customerApplication.applicationTenure)}
                />
                <InfoRow
                  icon={<AccountBalanceIcon
                    sx={{
                      fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                    }} />}
                  text={
                    `${customerApplication.applicationProvider
                      ? capitalizeFirstLetter(customerApplication.applicationProvider)
                      : "No provider available"
                    }${customerApplication.loanCategory ?
                      `, ${capitalizeFirstLetter(customerApplication.loanCategory)}`
                      : ""
                    }`
                  }
                />
                <InfoRow
                  icon={<BusinessIcon
                    sx={{
                      fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                    }} />}
                  text={
                    customerApplication.loanType
                      ? capitalizeFirstLetter(customerApplication.loanType)
                      : "No lead type available"
                  }
                />
                {(customerApplication.customerLocation || customerApplication.customerState) && (
                  <InfoRow
                    icon={<LocationOnRounded
                      sx={{
                        fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                      }} />}
                    text={`${capitalizeFirstLetter(customerApplication.customerLocation || "")}${customerApplication.customerLocation && customerApplication.customerState ? ", " : ""
                      }${capitalizeFirstLetter(customerApplication.customerState || "")}`}
                  />
                )}

                <InfoRow
                  icon={<AccessTimeRounded sx={{
                    fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                  }} />}
                  text={
                    customerApplication.disbursedAt
                      ? `Disbursed At: ${new Date(customerApplication.disbursedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}`
                      : "Not Disbursed"
                  }
                />
                <InfoRow
                  icon={<AccessTimeRounded sx={{
                    fontSize: { xs: 16, sm: 18, md: 15 } // responsive icon size
                  }} />}
                  text={
                    customerApplication.approved_At
                      ? `Disbursed At: ${new Date(customerApplication.approved_At).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}`
                      : "Not Approved"
                  }
                />

                {/* Existing Loans Display */}
                {/* {(customerApplication.existingLoans || (customerApplication as any).existing_loans) && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6E44FF', mb: 0.5, display: 'block' }}>
                      Existing Loans
                    </Typography>
                    {(() => {
                      try {
                        const loans = JSON.parse(customerApplication.existingLoans || (customerApplication as any).existing_loans);
                        if (Array.isArray(loans) && loans.length > 0) {
                          return loans.map((loan, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#333', ml: 1 }}>
                              • {capitalizeFirstLetter(loan.which_loan || 'Loan')}: ₹{loan.loan_amount || loan.running_loan_amount || 'N/A'}
                            </Typography>
                          ));
                        }
                      } catch (e) {
                        return <Typography variant="caption" sx={{ color: '#666' }}>Error parsing loans</Typography>;
                      }
                      return null;
                    })()}
                  </Box>
                )} */}
              </Box>
            ) : showHistory ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isSalesUser ? 1 : 1.5,
                  bgcolor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  p: isSalesUser ? 1.5 : 2,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
                  overflowY: "scroll",
                  height: isSalesUser
                    ? isMobile
                      ? "30vh"
                      : isTab
                        ? "28vh"
                        : "35vh"
                    : isMobile
                      ? "42vh"
                      : isTab
                        ? "38vh"
                        : "60vh",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {historyData.length > 0 ? (
                  historyData.map((history, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", flexDirection: "column", mb: 2 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "black", fontStyle: "normal", mb: 1 }}
                      >
                        <strong>
                          {capitalizeFirstLetter(history.action.split(" ")[0])}
                        </strong>
                        {` ${history.action.substring(
                          history.action.indexOf(" ") + 1
                        )}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "blue" }}>
                        Created At:{" "}
                        {new Date(history.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}{" "}
                        ({calculateDaysAgo(history.created_at)} days ago)
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    No history data available.
                  </Typography>
                )}
              </Box>
            ) : showComment ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  bgcolor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                  p: 2,
                  minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
                  maxHeight: isMobile ? "35vh" : isTab ? "20vh" : "20vh",
                  overflowY: "scroll",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {commentData?.length > 0 ? (
                  commentData.map((comment, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", flexDirection: "column", mb: 2 }}
                    >
                      {/* User Name */}
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "black" }}
                      >
                        {capitalizeFirstLetter(
                          comment?.user?.username || "Anonymous"
                        )}
                      </Typography>

                      {/* Comment Text */}
                      <Typography
                        variant="body2"
                        sx={{ color: "black", fontStyle: "normal", mb: 1 }}
                      >
                        {capitalizeFirstLetter(comment.comment)}
                      </Typography>

                      {/* Attachment Section */}
                      {comment.attachment && (
                        <Box sx={{ mb: 1 }}>
                          <Button
                            onClick={() =>
                              toggleAttachment(comment.id, comment.attachment)
                            }
                            variant="contained"
                            size="small"
                            sx={{
                              textTransform: "none",
                              bgcolor: "#0c66e4",
                              color: "white",
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              "&:hover": {
                                bgcolor: "#085cb8",
                                color: "white",
                              },
                            }}
                          >
                            {isExcelAttachment(comment.attachment)
                              ? "Open Excel File"
                              : isPdfAttachment(comment.attachment)
                                ? "Open PDF"
                                : showAttachment[comment.id]
                                  ? "Hide Attachment"
                                  : "View Attachment"}
                          </Button>

                          {/* Image/PDF Preview Modal */}
                          {!isExcelAttachment(comment.attachment) &&
                            !isPdfAttachment(comment.attachment) &&
                            showAttachment[comment.id] && (
                              <>
                                {/* Backdrop */}
                                <Box
                                  sx={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100vw",
                                    height: "100vh",
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    zIndex: 999,
                                  }}
                                  onClick={() =>
                                    toggleAttachment(
                                      comment.id,
                                      comment.attachment
                                    )
                                  }
                                />

                                {/* Modal Content */}
                                <Box
                                  sx={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1000,
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "0px 4px 20px rgba(0, 0, 0, 0.3)",
                                    padding: 2,
                                    textAlign: "center",
                                    height: isMobile
                                      ? "80vh"
                                      : isTab
                                        ? "80vh"
                                        : "85vh",
                                    width: isMobile
                                      ? "95vw"
                                      : isTab
                                        ? "85vw"
                                        : "80vw",
                                    maxHeight: "90vh",
                                    maxWidth: "90vw",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  {/* Header with close button */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 2,
                                      borderBottom: "1px solid #eee",
                                      pb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{ color: "black" }}
                                    >
                                      Attachment Preview
                                    </Typography>
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
                                        minWidth: "auto",
                                        padding: "4px 8px",
                                        bgcolor: "#f06292",
                                        color: "white",
                                        "&:hover": {
                                          bgcolor: "red",
                                        },
                                      }}
                                    >
                                      ✕
                                    </Button>
                                  </Box>

                                  {/* Image Display */}
                                  <Box
                                    sx={{
                                      flex: 1,
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      overflow: "hidden",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <img
                                      src={comment.attachment}
                                      alt="Attachment Preview"
                                      style={{
                                        maxHeight: "100%",
                                        maxWidth: "100%",
                                        objectFit: "contain",
                                        borderRadius: "4px",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "block";
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        display: "none",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "200px",
                                        color: "#666",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <Typography>
                                        Unable to preview this file
                                      </Typography>
                                      <Button
                                        href={comment.attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ mt: 1 }}
                                      >
                                        Download File
                                      </Button>
                                    </Box>
                                  </Box>
                                </Box>
                              </>
                            )}
                        </Box>
                      )}

                      {/* Meta Info */}
                      <Typography variant="caption" sx={{ color: "blue" }}>
                        {new Date(comment.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}{" "}
                        ({calculateDaysAgo(comment.created_at)} days ago)
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    No comments available.
                  </Typography>
                )}
              </Box>
            ) : null}

            {handleStartClick && customerApplication.ticketId ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "0px 0px 12px 12px",
                  borderTop: "1px solid #e5e7eb",
                  bgcolor: "#ffffff",
                  boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
                }}
              >
                {userRole !== "sales" && (
                  <Button
                    fullWidth
                    position="fixed"
                    variant="contained"
                    sx={{
                      py: 1.25,
                      px: 2,
                      height: "40px",
                      borderRadius: "8px",
                      bgcolor: "#0066cc",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(0, 102, 204, 0.25)",
                      "&:hover": {
                        bgcolor: "#0052a3",
                        boxShadow: "0 4px 12px rgba(0, 102, 204, 0.35)",
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                    onClick={handleStartClick}
                  >
                    Visit Ticket
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.25,
                    px: 2,
                    height: "40px",
                    borderRadius: "8px",
                    borderWidth: "1.5px",
                    borderColor: "#d1d5db",
                    color: "#4b5563",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    bgcolor: "white",
                    "&:hover": {
                      bgcolor: "#f9fafb",
                      borderColor: "#0066cc",
                      color: "#0066cc",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                  onClick={toggleHistory}
                >
                  {showHistory ? "Close History" : "Show History"}
                </Button>
                {userRole === "sales" && (
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 1.25,
                      px: 2,
                      height: "44px",
                      borderRadius: "8px",
                      borderWidth: "1.5px",
                      borderColor: "#d1d5db",
                      color: "#4b5563",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      textTransform: "none",
                      bgcolor: "white",
                      "&:hover": {
                        bgcolor: "#f9fafb",
                        borderColor: "#0066cc",
                        color: "#0066cc",
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                    onClick={toggleComment}
                  >
                    {showComment ? "Comments" : "Comments"}
                  </Button>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <Chip
                  label={formattedCreatedAt}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    fontWeight: "bold",
                    "& .MuiChip-label": { color: "#6E44FF" },
                  }}
                />
                {decodedToken()?.role === "sales" ? null : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ mr: 1, color: "white", fontWeight: "bold" }}
                    >
                      Pick
                    </Typography>
                    <Checkbox
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckboxClick(e);
                      }}
                      size="small"
                      sx={{
                        color: toggleListView === "table" ? "#666" : toggleListView === "list" ? "white" : "black",
                        "&.Mui-checked": {
                          color: "#FFD93D",
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };
  const TableView = ({ index }: { index: any }) => {
    const [showAttachment, setShowAttachment] = useState({});
    const [currentAttachment, setCurrentAttachment] = useState(null);

    // Helper functions for file handling
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

    const isPdfAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      return extension === "pdf";
    };

    const isExcelAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const excelExtensions = ["xlsx", "xls", "csv", "xlsm", "xlsb"];
      return excelExtensions.includes(extension);
    };

    const isImageAttachment = (attachmentUrl: string) => {
      const extension = getFileExtensionFromUrl(attachmentUrl);
      const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
      ];
      return imageExtensions.includes(extension);
    };

    const handleOpenAttachment = (commentId: number | string, attachmentUrl: string) => {
      if (isExcelAttachment(attachmentUrl)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          attachmentUrl
        )}`;

        const newWindow = window.open(officeViewerUrl, "_blank");

        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          const shouldDownload = window.confirm(
            "Unable to open file in viewer. Would you like to download it instead?"
          );

          if (shouldDownload) {
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
        setCurrentAttachment({ commentId, url: attachmentUrl });
        setShowAttachment((prev) => ({ ...prev, [commentId]: true }));
      }
    };

    const handleCloseAttachment = () => {
      if (currentAttachment) {
        setShowAttachment((prev) => ({
          ...prev,
          [currentAttachment.commentId]: false,
        }));
        setCurrentAttachment(null);
      }
    };
    return (
      <>
        <TableRow
          key={customerApplication.customerId}
          sx={{
            "&:nth-of-type(odd)": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
          }}
        >
          <TableCell>
            <Typography variant="body2" sx={{ fontWeight: "bold", whiteSpace: isTab ? "normal" : "", }}>
              {index}
            </Typography>
          </TableCell>

          {/* Name */}
          <TableCell>
            <Typography variant="body2" sx={{ fontWeight: "bold", whiteSpace: isTab ? "normal" : "normal", minWidth: isTab ? "15vw" : "", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>

              {customerApplication.customerName?.toUpperCase()}
              {(customerApplication.source === "website" || customerApplication.applicationSource === "website") && <DirectBadge />}
            </Typography>
          </TableCell>

          {/* Email */}
          {userRole !== "sales" && (
            <TableCell sx={{ minWidth: isMobile ? "45vw" : isTab ? "15vw" : "10vw", maxWidth: "15vw" }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "normal",
                  wordBreak: "break-word",   // breaks inside long words
                  overflowWrap: "anywhere", // ensures even long emails wrap
                }}
              >
                {userRole === "admin" || customerApplication.ticketStatus !== "disbursed"
                  ? customerApplication.customerEmail
                  : "N/A"}
              </Typography>
            </TableCell>

          )
          }

          {/* Amount */}
          <TableCell>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "medium",
                color: "#00796B",
                fontSize: ".9rem",
                "&:hover": {
                  color: "#004D40",
                  cursor: "pointer",
                },
              }}
              className="amount-link"
            >
              {formatRupees(customerApplication.applicationAmount)}
            </Typography>
          </TableCell>

          {/* Provider */}
          <TableCell>
            <Typography
              variant="body2"
              sx={{
                color: "#6A0DAD",
                fontWeight: 600,
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: isTab ? "8vw" : "8vw",
              }}
            >
              {customerApplication.applicationProvider || "N/A"}
            </Typography>
          </TableCell>

          {/* Loan Category */}
          <TableCell>
            <Typography variant="body2">
              {capitalizeFirstLetter(customerApplication.loanType)}
            </Typography>
          </TableCell>

          {/* Lead Type */}
          <TableCell>
            <Typography
              variant="body2"
              sx={{
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                maxWidth: '10vw',
              }}
            >
              {capitalizeFirstLetter(customerApplication.leadType || "Null")}
            </Typography>
          </TableCell>

          {/* Tenure */}
          <TableCell>
            <Typography variant="body2">
              {formatTenure(customerApplication.applicationTenure)}
            </Typography>
          </TableCell>

          {/* Location */}
          <TableCell>
            <Typography variant="body2">
              {customerApplication.customerLocation
                ? capitalizeFirstLetter(customerApplication.customerLocation)
                : "N/A"}
              ,<br></br>
              {customerApplication.customerState
                ? capitalizeFirstLetter(customerApplication.customerState)
                : "N/A"}
            </Typography>
          </TableCell>

          {/* Application date */}
          {!isApplication && <TableCell >
            <Typography variant="body2">
              {customerApplication?.applicationDate
                ? new Date(customerApplication.applicationDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : "N/A"}
            </Typography>
          </TableCell>}

          {/* Created At */}
          <TableCell>
            <Typography variant="body2">
              {customerApplication?.createdAt || customerApplication?.applicationDate
                ? new Date(customerApplication.createdAt || customerApplication.applicationDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : "N/A"}
            </Typography>
          </TableCell>
          {/* Disbursed At */}
          {!isApplication &&
            <TableCell>
              <Typography variant="body2">
                {customerApplication?.disbursedAt
                  ? new Date(customerApplication.disbursedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : "Not Disbursed"}
              </Typography>
            </TableCell>
          }

          {/* Approved At */}
          {!isApplication &&
            <TableCell>
              <Typography variant="body2">
                {customerApplication?.approvedAt || customerApplication?.approved_At
                  ? new Date((customerApplication.approvedAt || customerApplication.approved_At)!).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  : "Not Approved"}
              </Typography>
              {!(customerApplication?.approvedAt || customerApplication?.approved_At) && customerApplication?.due_date && (
                <Typography variant="caption" sx={{ color: isOverdue ? "#D32F2F" : "text.secondary", display: 'block', mt: 0.5, fontWeight: isOverdue ? 'bold' : 'normal' }}>
                  Expected: {new Date(customerApplication.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
              )}
            </TableCell>
          }

          {/* Actions */}
          <TableCell>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {/* Delete Button */}
              {(showDeleteButton ||
                (userRole === "admin" && handleDeleteTicket)) && (
                  <IconButton
                    onClick={openConfirmDialog}
                    sx={{
                      color: "#f44336",
                      "&:hover": {
                        backgroundColor: "rgba(244, 67, 54, 0.1)",
                        color: "#d32f2f",
                      },
                    }}
                    size="small"
                  >
                    <DeleteOutline sx={{ fontSize: 18 }} />
                  </IconButton>
                )}

              {/* History Button (only for tickets) */}
              {handleStartClick && customerApplication.ticketId && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleHistory}
                  sx={{
                    borderColor: "#667eea",
                    color: "#667eea",
                    "&:hover": {
                      borderColor: "#5a6fd8",
                      bgcolor: "rgba(102, 126, 234, 0.04)",
                    },
                    textTransform: "none",
                    fontSize: "0.75rem",
                  }}
                >
                  {showHistory ? "Close History" : "History"}
                </Button>
              )}

              {/* Comments Button (only for tickets) */}
              {handleStartClick &&
                customerApplication.ticketId &&
                userRole === "sales" && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleComment}
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5a6fd8",
                        bgcolor: "rgba(102, 126, 234, 0.04)",
                      },
                      textTransform: "none",
                      fontSize: "0.75rem",
                    }}
                  >
                    {showComment ? "Close Comments" : "Comments"}
                  </Button>
                )}

              {/* Pick Checkbox */}
              {decodedToken()?.role !== "sales" && !handleStartClick && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ mr: 0.5, fontWeight: "bold" }}
                  >
                    Pick
                  </Typography>
                  <Checkbox
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckboxClick(e);
                    }}
                    size="small"
                    sx={{
                      color: toggleListView === "table" ? "#666" : toggleListView === "list" ? "white" : "black",
                      "&.Mui-checked": {
                        color: "#FFD93D",
                      },
                    }}
                  />
                </Box>
              )}

              {/* Visit Ticket Button (if applicable) */}
              {handleStartClick &&
                customerApplication.ticketId &&
                userRole !== "sales" && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      handleStartClick(customerApplication.ticketId)
                    }
                    sx={{
                      bgcolor: "#1976D2",
                      "&:hover": { bgcolor: "#1565C0" },
                      textTransform: "none",
                      fontSize: "0.75rem",
                    }}
                  >
                    Visit
                  </Button>
                )}
            </Box>
          </TableCell>
        </TableRow >

        {/* History Row - appears when showHistory is true */}
        {
          showHistory && customerApplication.ticketId && (
            <TableRow>
              <TableCell colSpan={20} sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#333", mb: 2, fontWeight: "bold" }}
                >
                  History
                </Typography>
                <Box sx={{ maxHeight: "250px", overflowY: "auto", width: "100%" }}>
                  {historyData.length > 0 ? (
                    historyData.map((history, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mb: 2,
                          p: 1.5,
                          bgcolor: "white",
                          borderRadius: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "black",
                            fontWeight: "medium",
                            mb: 0.5,
                          }}
                        >
                          <strong>
                            {capitalizeFirstLetter(history.action.split(" ")[0])}
                          </strong>
                          {` ${history.action.substring(
                            history.action.indexOf(" ") + 1
                          )}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#1976d2" }}>
                          {new Date(history.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          ({calculateDaysAgo(history.created_at)} days ago)
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", textAlign: "center" }}
                    >
                      No history data available.
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )
        }

        {/* Comments Row - appears when showComment is true */}
        {
          showComment && customerApplication.ticketId && (
            <TableRow>
              <TableCell colSpan={20} sx={{ bgcolor: "#f5f5f5", p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#333", mb: 2, fontWeight: "bold" }}
                >
                  Comments
                </Typography>
                <Box sx={{ maxHeight: "250px", overflowY: "auto", width: "100%" }}>
                  {commentData?.length > 0 ? (
                    commentData.map((comment, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mb: 2,
                          p: 1.5,
                          bgcolor: "white",
                          borderRadius: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        {/* User Name */}
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: "black", mb: 0.5 }}
                        >
                          {capitalizeFirstLetter(
                            comment?.user.username || "Anonymous"
                          )}
                        </Typography>

                        {/* Comment Text */}
                        <Typography
                          variant="body2"
                          sx={{ color: "black", fontStyle: "normal", mb: 0.5 }}
                        >
                          {capitalizeFirstLetter(comment.comment)}
                        </Typography>

                        {/* Attachment Section */}
                        {comment.attachment && (
                          <Box sx={{ mb: 0.5 }}>
                            <Button
                              onClick={() =>
                                handleOpenAttachment(
                                  comment.id,
                                  comment.attachment
                                )
                              }
                              variant="contained"
                              size="small"
                              sx={{
                                textTransform: "none",
                                bgcolor: "#0c66e4",
                                color: "white",
                                fontSize: "0.7rem",
                                padding: "3px 6px",
                                minHeight: "auto",
                                "&:hover": {
                                  bgcolor: "#085cb8",
                                },
                              }}
                            >
                              {isExcelAttachment(comment.attachment)
                                ? "Open Excel"
                                : isPdfAttachment(comment.attachment)
                                  ? "Open PDF"
                                  : "View Attachment"}
                            </Button>
                          </Box>
                        )}

                        {/* Meta Info */}
                        <Typography variant="caption" sx={{ color: "#1976d2" }}>
                          {new Date(comment.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          ({calculateDaysAgo(comment.created_at)} days ago)
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", textAlign: "center" }}
                    >
                      No comments available.
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          )
        }

        {/* Image Preview Modal */}
        {
          currentAttachment && showAttachment[currentAttachment.commentId] && (
            <Modal
              open={showAttachment[currentAttachment.commentId]}
              onClose={handleCloseAttachment}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  bgcolor: "white",
                  borderRadius: "8px",
                  boxShadow: 24,
                  p: 2,
                  width: isMobile ? "95vw" : "80vw",
                  height: isMobile ? "80vh" : "85vh",
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  outline: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    borderBottom: "1px solid #eee",
                    pb: 1,
                  }}
                >
                  <Typography variant="h6">Attachment Preview</Typography>
                  <IconButton
                    onClick={handleCloseAttachment}
                    sx={{
                      color: "red",
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    height: "calc(100% - 56px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {isImageAttachment(currentAttachment.url) ? (
                    <img
                      src={currentAttachment.url}
                      alt="Attachment Preview"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#666",
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        File cannot be previewed
                      </Typography>
                      <Button
                        href={currentAttachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                      >
                        Download File
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Modal>
          )
        }
      </>
    );
  };

  return (
    <>
      {toggleListView === "list" ? (
        <ListView />
      ) : toggleListView === "grid" ? (
        <GridView />
      ) : (
        <TableView index={mainIndex} />
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          borderRadius: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            backgroundImage: `
    linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
  `,
            backgroundBlendMode: "multiply, screen, normal",
            color: "white",
            padding: "20px",
            borderRadius: "1px 1px 0 0",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.25rem",
          }}
        >
          Confirm Ticket Deletion
        </DialogTitle>
        <DialogContent
          sx={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            bgcolor: "lightcyan",
          }}
        >
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              fontSize: "0.9rem",
              color: "#555",
              marginBottom: "20px",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            Are you sure you want to delete this ticket? This action cannot be
            undone.
          </DialogContentText>

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Reason for deletion"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#6E44FF",
                },
                "&:hover fieldset": {
                  borderColor: "#6E44FF",
                },
              },
            }}
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            bgcolor: "lightcyan",
          }}
        >
          <Button
            onClick={closeConfirmDialog}
            color="primary"
            variant="outlined"
            sx={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#ddd",
              },
            }}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={!deleteReason.trim()}
            sx={{
              backgroundColor: "#FF3B30",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
              "&:disabled": {
                backgroundColor: "#cccccc",
                color: "#666666",
              },
            }}
            startIcon={<DeleteForever />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expected Decision Date Pickup Modal */}
      <Dialog
        open={showPickupModal}
        onClose={() => !isPickingUp && setShowPickupModal(false)}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()} // Prevent card expansion
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Set Expected Decision Date</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please confirm the expected decision date for this application.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Expected Decision Date"
              value={pickupDate}
              onChange={(newValue) => setPickupDate(newValue)}
              minDate={dayjs()}
              sx={{ width: "100%", mt: 1 }}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPickupModal(false)}
            color="inherit"
            disabled={isPickingUp}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmPickup}
            variant="contained"
            disabled={!pickupDate || isPickingUp}
            sx={{ bgcolor: "#0c66e4", "&:hover": { bgcolor: "#0052cc" } }}
          >
            {isPickingUp ? "Confirming..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationCard;

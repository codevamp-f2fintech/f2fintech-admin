import {
  Avatar,
  Box,
  Button,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBackRounded, EditRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Utility } from "@/utils";
import axios from "axios";
import Toast from "../../components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useCreateTicketHistory } from "@/hooks/tickethistory";
import { useGetLoanProviders } from "@/hooks/loanProvider";

const TicketDetail = ({ ticketDetailData, isMobile, isTab }) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const {
    capitalizeFirstLetter,
    formatTenure,
    formatDate,
    formatAmount,
    decodedToken,
    toastAndNavigate,
  } = Utility();

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editedTicketData, setEditedTicketData] = useState(ticketDetailData);
  const { createTicketHistory } = useCreateTicketHistory(
    "create-ticket-history"
  );
  const userRole = decodedToken()?.role;

    // Fetch loan providers
    const { value: providersData, swrLoading: providersLoading } =
      useGetLoanProviders( null, "get-all-loan-providers", 1, 100 );

  const PROVIDER_OPTIONS = providersLoading
    ? []
    : providersData?.data?.results?.map( provider => provider.title ) || [];


  // Update editedTicketData when ticketDetailData changes
  useEffect(() => {
    if (ticketDetailData) {
      console.log("details", ticketDetailData);
      setEditedTicketData(ticketDetailData);
    }
  }, [ticketDetailData]);

  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedTicketData = { ...editedTicketData, [name]: value };
    setEditedTicketData(updatedTicketData);
    console.log("updatedTicketData", updatedTicketData);
  };
  // A helper function to compare the original and edited ticket details
  const getChangedFields = (original, edited) => {
    const changes: string[] = [];
    Object.keys(original).forEach((key) => {
      if (original[key] !== edited[key]) {
        changes.push(
          `${key} changed from "${original[key]}" to "${edited[key]}"`
        );
      }
    });
    return changes;
  };

  const handleSaveEdit = async () => {
    try {
      // Call the update API on Save
      const { data: response } = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/update-loan-application/${editedTicketData?.applicationId}`,
        editedTicketData
      );
      if (response?.statusCode === 200) {
        const loggedInUser = decodedToken()?.username;
        const changes = getChangedFields(ticketDetailData, editedTicketData);

        const formattedChanges = changes.map((change) => {
          const [key, rest] = change.split(" changed from ");
          return `${key} changed from ${rest}`;
        });

        const historyMessage =
          changes.length > 0
            ? `${loggedInUser} edited the following Ticket Details:
               ${formattedChanges}`
            : `${loggedInUser} did not change any details.`;

        const createdHistory = await createTicketHistory({
          ticket_id: ticketDetailData?.ticketId,
          action: historyMessage,
        });
        if (createdHistory?.statusCode === 200) {
          toastAndNavigate(
            dispatch,
            true,
            "info",
            "Ticket Details Edited Successfully"
          );
          setOpenEditModal(false);
        } else {
          setOpenEditModal(false);
        }
      } else {
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error("Error saving the ticket:", error);
      setOpenEditModal(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        sx={{
          flexDirection: "column",
        }}
        mb={1}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Button
              startIcon={<ArrowBackRounded />}
              onClick={() => router.back()}
              sx={{ color: "black" }}
            >
              Back
            </Button>
          </Box>

          {/* Edit Button */}
          <Box sx={{ marginLeft: "auto" }}>
            <Button
              startIcon={<EditRounded />}
              onClick={handleOpenEditModal}
              sx={{ color: "black" }}
            >
              Edit
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: "black",
              textDecoration: "none",
              fontSize: "1.5rem",
              fontFamily: "monospace",
              fontStyle: "revert-layer",
              fontWeight: "bold",
            }}
          >
            Ticket ID: F2FIN-{ticketDetailData?.ticketId}
          </Typography>
        </Box>
      </Box>

      <Box
        mt={2}
        display="flex"
        alignItems="center"
        justifyContent={"center"}
        gap={2}
        sx={{
          borderRadius: "14px",
          flexDirection: isMobile ? "column" : isTab ? "" : "",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 4,
            backgroundImage: `linear-gradient(64.5deg, #fff 14.7%, #fff 88.7%)`,
            transition: "transform 0.3s ease",
            boxShadow:
              " rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;",
          }}
        >
          <Grid container spacing={3}>
            {/* Ticket Details */}
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Name:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {capitalizeFirstLetter(editedTicketData?.customerName)}
                </Box>
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  wordWrap: "break-word",
                  blackSpace: "normal",
                  fontFamily: "",
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                }}
              >
                <strong>Email:</strong>
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {editedTicketData?.customerEmail}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Contact:</strong> +91{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {editedTicketData?.customerContact}
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Designation:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {capitalizeFirstLetter(editedTicketData?.customerDesignation)}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Location:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {capitalizeFirstLetter(editedTicketData?.customerLocation)}
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Tenure:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {formatTenure(editedTicketData?.applicationTenure)}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Amount:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {formatAmount(editedTicketData?.applicationAmount)}{" "}
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Application Date:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {formatDate(editedTicketData?.applicationDate)}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  color: "#172B4D",
                  fontSize: "1rem",
                  mb: 1,
                  fontFamily: "",
                }}
              >
                <strong>Loan Provider:</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#5E6C84",
                    fontSize: ".9rem",
                    fontWeight: 500,
                  }}
                >
                  {capitalizeFirstLetter(editedTicketData?.provider) ||
                    "No provider available"}{" "}
                </Box>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Modal for Editing Ticket */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialogContent-root": {
            padding: "16px",
            maxHeight: "500px",
          },
          "& .MuiDialogActions-root": {
            padding: "16px",
            justifyContent: "flex-end",
          },
          "& .MuiPaper-root": {
            borderRadius: "12px",
          },
          // Hide the scrollbars
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "& *": {
            scrollbarWidth: "none",
          },
          height: "70v%",
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Edit Ticket Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="customerName"
                value={editedTicketData?.customerName || ""}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                autoComplete="off"
              />
            </Grid>
            {(userRole === "admin" || userRole === "sub admin") && (
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="provider-select-label">
                    Loan Provider
                  </InputLabel>
                  <Select
                    labelId="provider-select-label"
                    id="provider-select"
                    name="provider"
                    value={editedTicketData?.provider || ""}
                    label="Loan Provider"
                    onChange={handleInputChange}
                  >
                    {PROVIDER_OPTIONS.map((bank) => (
                      <MenuItem key={bank} value={bank}>
                        {bank}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Email"
                name="customerEmail"
                value={editedTicketData?.customerEmail || ""}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contact"
                name="customerContact"
                value={editedTicketData?.customerContact || ""}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Location"
                name="customerLocation"
                value={editedTicketData?.customerLocation || ""}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                autoComplete="off"
              />
            </Grid>

            {/* Amount Field */}
            <Grid item xs={12}>
              <TextField
                label="Amount"
                name="applicationAmount"
                value={editedTicketData?.applicationAmount || ""}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseEditModal}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </>
  );
};

export default TicketDetail;

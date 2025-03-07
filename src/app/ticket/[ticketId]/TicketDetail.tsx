import { Avatar, Box, Button, Grid, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { ArrowBackRounded, EditRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Utility } from "@/utils";
import axios from "axios";
import Toast from "../../components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";


const TicketDetail = ( { ticketDetailData, isMobile, isTab } ) => {
  const { capitalizeFirstLetter, formatTenure, formatDate, formatAmount } = Utility();
  const router = useRouter();
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const dispatch: AppDispatch = useDispatch();
  const { toastAndNavigate } = Utility();

  const [ openEditModal, setOpenEditModal ] = useState( false );
  const [ editedTicketData, setEditedTicketData ] = useState( ticketDetailData );

  // Update editedTicketData when ticketDetailData changes
  useEffect( () => {
    if ( ticketDetailData )
    {
      setEditedTicketData( ticketDetailData );
    }
  }, [ ticketDetailData ] );
  console.log( "ticketDetailData>>>>>>>", ticketDetailData )

  const handleOpenEditModal = () => {
    setOpenEditModal( true );
  };

  const handleCloseEditModal = () => {
    setOpenEditModal( false );
  };

  const handleInputChange = ( e ) => {
    const { name, value } = e.target;
    const updatedTicketData = { ...editedTicketData, [ name ]: value };
    setEditedTicketData( updatedTicketData );
  };

  const handleSaveEdit = async () => {
    try
    {
      // Call the update API on Save
      const response = await axios.patch(
        `${ process.env.NEXT_PUBLIC_API_URL }/update-loan-application/${ editedTicketData?.applicationId
        }`,
        editedTicketData
      );
      console.log( "Ticket updated successfully:", response.data );
      setOpenEditModal( false ); // Close the modal after saving
    } catch ( error )
    {
      console.error( "Error saving the ticket:", error );
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-start" alignItems="flex-start" mb={1}>
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => {
              router.back();
            }}
            sx={{ color: "white" }}
          >
            Back
          </Button>
        </Box>
        <Box sx={{ marginLeft: "8vw" }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              textDecoration: "none",
              fontSize: "1.5rem",
              fontFamily: "monospace",
              fontStyle: "revert-layer",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Ticket ID: F2FIN-{ticketDetailData?.ticketId}
          </Typography>
        </Box>
        {/* Edit Button */}
        <Box sx={{ marginLeft: "auto" }}>
          <Button
            startIcon={<EditRounded />}
            onClick={handleOpenEditModal}
            sx={{ color: "white" }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Box
        mt={2}
        p={2}
        border={1}
        borderColor="white"
        display="flex"
        alignItems="center"
        justifyContent={"center"}
        gap={2}
        sx={{
          borderRadius: "14px",
          flexDirection: isMobile ? "column" : isTab ? "" : "",
        }}
      >
        <Box>
          <Avatar
            src={ticketDetailData?.customerDocuments}
            sx={{
              width: isMobile ? "2rem" : isTab ? "6vw" : "4rem",
              height: isMobile ? "2rem" : isTab ? "4vh" : "4rem",
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 4,
            backgroundImage: `linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)`,
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Grid container spacing={3}>
            {/* Ticket Details */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ mb: 1, color: "white", fontSize: "1rem" }}>
                <strong>Name:</strong> {capitalizeFirstLetter( editedTicketData?.customerName )}
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "1rem",
                  mb: 1,
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <strong>Email:</strong> {editedTicketData?.customerEmail}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Contact:</strong> +91 {editedTicketData?.customerContact}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Designation:</strong> {capitalizeFirstLetter( editedTicketData?.customerDesignation )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Location:</strong> {capitalizeFirstLetter( editedTicketData?.customerLocation )}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Tenure:</strong> {formatTenure( editedTicketData?.applicationTenure )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Amount:</strong> {formatAmount( editedTicketData?.applicationAmount )}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem" }}>
                <strong>Application Date:</strong> {formatDate( editedTicketData?.applicationDate )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Loan Provider:</strong> {capitalizeFirstLetter( editedTicketData?.applicationProvider ) || "No provider available"}
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
            maxHeight: "500px", // Set a max height for the content to ensure scrolling is needed
          },
          "& .MuiDialogActions-root": {
            padding: "16px",
            justifyContent: "flex-end", // Align buttons to the right
          },
          "& .MuiPaper-root": {
            borderRadius: "12px", // Rounded corners for the dialog
          },
          // Hide the scrollbars
          "&::-webkit-scrollbar": {
            display: "none", // Hide scrollbars on WebKit browsers (Chrome, Safari, Edge)
          },
          "& *": {
            scrollbarWidth: "none", // Firefox scrollbar hiding
          },
          height: "70v%"
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>Edit Ticket Details</DialogTitle>
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
          <Button onClick={handleCloseEditModal} color="secondary" variant="outlined">
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

"use client";

import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Card,
  CardContent,
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
} from "@mui/material";
import {
  MailRounded,
  PhoneRounded,
  AccessTimeRounded,
  LocationOnRounded,
  DeleteOutlined,
  Close,
  DeleteForever,
} from "@mui/icons-material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import { useCreateTicket } from "@/hooks/ticket";
import { Utility } from "@/utils";
import { useModifyCustomerApplication } from "@/hooks/customerApplication";
import { fetcher } from "@/apis/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { resetCustomerApplications } from "@/redux/features/customerApplicationSlice";
import Toast from "../../components/common/Toast";
// import SendOTP from "./SendOTP";

interface ApplicationCardProps {
  customerApplication: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerContact?: string;
    customerProfileImage?: string;
    customerLocation?: string;
    applicationAmount: string;
    applicationTenure: number;
    applicationDate: string;
    applicationId: number;
    ticketId?: number;
    ticketStatus?: string;
    loanStatus?: string;
    userRole?: string;
    applicationProvider?: string;
  };
  handleStartClick?: ( ticketId: number ) => void;
  refetch?: () => Promise<void>;
  userRole?: string;
  handleDeleteTicket?: ( ticketId: number ) => void;
}

function InfoRow ( {
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string | undefined;
} ) {
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
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
          borderRadius: "50%",
          padding: "8px",
        }}
      >
        {React.cloneElement( icon as React.ReactElement, {
          fontSize: "small",
        } )}
      </Box>
      <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium" }}>
        {text}
      </Typography>
    </Box>
  );
}

const ApplicationCard: React.FC<ApplicationCardProps> = ( {
  customerApplication,
  handleStartClick = null,
  refetch = null,
  userRole,
  handleDeleteTicket,
} ) => {
  const [ showHistory, setShowHistory ] = useState<boolean>( false );
  const [ historyData, setHistoryData ] = useState<any[]>( [] );
  const [ openDeleteDialog, setOpenDeleteDialog ] = useState<boolean>( false );
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const { toastAndNavigate } = Utility();

  const {
    calculateDaysAgo,
    capitalizeFirstLetter,
    decodedToken,
    formatTenure,
  } = Utility();
  const [ showOtpComponent, setShowOtpComponent ] = useState<boolean>( false );
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" );

  const { createTicket } = useCreateTicket( "create-ticket" );
  // Hook for modifying loan application is_picked column
  const { modifyCustomerApplication: modifyiedCustomerApplication } =
    useModifyCustomerApplication( "update-loan-application" );

  const toggleHistory = () => setShowHistory( ( prev ) => !prev );


  const openConfirmDialog = ( e ) => {
    e.stopPropagation();
    setOpenDeleteDialog( true );
  };

  const closeConfirmDialog = () => {
    setOpenDeleteDialog( false );
  };

  // Inside the confirmDelete function
  const confirmDelete = async () => {
    if ( handleDeleteTicket )
    {
      try
      {
        // Perform the delete action
        await handleDeleteTicket( customerApplication.ticketId );

        // Display success toast message
        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Ticket deleted successfully",
          null,
          null,
          true
        );

        // Close the delete dialog after successful deletion
        closeConfirmDialog();
      } catch ( error )
      {
        console.log( "Error deleting ticket:", error );
        // Optionally, you can display an error toast message here as well
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
  };

  // Fetch history data when toggling history
  useEffect( () => {
    if ( showHistory && customerApplication.ticketId )
    {
      const fetchHistoryData = async () => {
        try
        {
          const { data } = await fetcher(
            `get-ticket-histories/${ customerApplication.ticketId }`
          );
          setHistoryData( data );
        } catch ( error )
        {
          console.log( "Error fetching history data:", error );
        }
      };
      fetchHistoryData();
    }
  }, [ showHistory, customerApplication?.ticketId ] );

  const handleCheckboxChange = async ( applicationId: number ) => {
    try
    {
      await createTicket( {
        // Create new Ticket
        customer_application_id: applicationId,
        user_id: decodedToken()?.id,
        status: "under credit review",
      } );
      await modifyiedCustomerApplication( applicationId, {
        // Mark the Card as picked
        is_picked: 1,
      } );
      dispatch( resetCustomerApplications( applicationId ) );
    } catch ( error )
    {
      console.log( "Error in checkbox change:", error );
    }
  };

  const formatRupees = ( value: number ) => {
    return new Intl.NumberFormat( "en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2, // Ensure two decimal places
      maximumFractionDigits: 2, // Ensure no more than two decimal places
    } ).format( value );
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={customerApplication.customerId}>
      <Card
        sx={{
          maxWidth: 345,
          borderRadius: 4,
          overflow: "visible",
          position: "relative",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
          backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
          backgroundBlendMode: "multiply, screen, normal",
          pt: isMobile ? 3 : 5,
          mt: 5,
        }}
      >
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
              alt={capitalizeFirstLetter( customerApplication.customerName )}
              src={customerApplication.customerProfileImage}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "black",
                color: "white",
                fontSize: 36,
                fontWeight: "bold",
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                border: "4px solid white",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                mb: 1,
                color: "white",
                fontWeight: "bold",
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                textAlign: "center",
                fontSize: "1.3rem",
                height: isMobile ? "7vh" : isTab ? "4vh" : "8vh",
                width: isMobile ? "80vw" : isTab ? "25vw" : "30vw",

              }}
            >
              {customerApplication.customerName?.toUpperCase()}
            </Typography>
            {/* Delete button for admin only */}
            {userRole === "admin" && handleDeleteTicket && (
              <Button
                variant="contained"
                sx={{
                  width: "10%",
                  borderRadius: "50px",
                  backgroundColor: "transparent",
                  position: "absolute",
                  top: "2.5vh",
                  ml: "17vw",
                  "&:hover": {
                    bgcolor: "#cc0000",
                  },
                }}
                onClick={openConfirmDialog}
              >
                <DeleteOutlined />
              </Button>
            )
            }
          </Box>

          {!showHistory ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "rgba(255,255,255,0.9)",
                borderRadius: "10px 10px 0px 0px",
                p: 2,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
              }}
            >
              {userRole !== "sales" &&
                <>
                  <InfoRow
                    icon={<MailRounded />}
                    text={customerApplication.customerEmail}
                  />

                  <InfoRow
                    icon={<PhoneRounded />}
                    text={customerApplication.customerContact}
                  />
                </>
              }
              <InfoRow
                icon={<CurrencyRupeeIcon />}
                text={formatRupees( customerApplication.applicationAmount )}
              />
              <InfoRow
                icon={<AccessTimeRounded />}
                text={formatTenure( customerApplication.applicationTenure )}
              />
              <InfoRow
                icon={<AccountBalanceIcon />}
                text={( customerApplication.applicationProvider || "No provider available...." )}
              />
              {customerApplication.customerLocation && (
                <InfoRow
                  icon={<LocationOnRounded />}
                  text={capitalizeFirstLetter(
                    customerApplication.customerLocation
                  )}
                />
              )}

            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "rgba(255,255,255,0.9)",
                borderRadius: 2,
                p: 2,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
                overflowY: "scroll",
                maxHeight: "40vh",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {historyData.length > 0 ? (
                historyData.map( ( history, index ) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", flexDirection: "column", mb: 2 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "black", fontStyle: "normal", mb: 1 }}
                    >
                      <strong>
                        {capitalizeFirstLetter( history.action.split( " " )[ 0 ] )}
                      </strong>
                      {` ${ history.action.substring(
                        history.action.indexOf( " " ) + 1
                      ) }`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "blue" }}>
                      {calculateDaysAgo( history.created_at )} days ago
                    </Typography>
                  </Box>
                ) )
              ) : (
                <Typography variant="body2" sx={{ color: "#333" }}>
                  No history data available.
                </Typography>
              )}
            </Box>
          )}
          {handleStartClick && customerApplication.ticketId ? (
            <Box
              sx={{
                display: "flex",
                borderRadius: "0px 0px 20px 20px",
              }}
            >
              {userRole !== "sales" &&
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    width: "100%",
                    borderRadius: "0px 0px 0px 10px",
                    bgcolor: "#f06292",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#f06292",
                      color: "white",
                    },
                  }}
                  onClick={handleStartClick}
                >
                  Visit Ticket
                </Button>
              }


              <Button
                variant="contained"
                color="primary"
                sx={{
                  width: "100%",
                  borderRadius: "0px 0px 10px 0px",
                  bgcolor: "#f06292",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#f06292",
                    color: "white",
                  },
                }}
                onClick={toggleHistory}
              >
                {showHistory ? "Close History" : "Show History"}
              </Button>
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
                label={`${ calculateDaysAgo(
                  customerApplication.applicationDate
                ) } days ago`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  fontWeight: "bold",
                  "& .MuiChip-label": { color: "#6E44FF" },
                }}
              />
              {( decodedToken()?.role === "admin" || decodedToken()?.role === "sales" ) ? null : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ mr: 1, color: "white", fontWeight: "bold" }}
                  >
                    Pick
                  </Typography>
                  <Checkbox
                    onChange={() =>
                      handleCheckboxChange( customerApplication.applicationId )
                    }
                    size="small"
                    sx={{
                      color: "white",
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
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          borderRadius: "20px", // Rounded corners for the dialog
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
            bgcolor: "lightcyan"

          }}
        >
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              fontSize: "0.9rem",
              color: "#555",
              marginBottom: "20px",
              textAlign: "center",
              padding: "2rem"
            }}
          >
            Are you sure you want to delete this ticket? This action cannot be undone.
          </DialogContentText>

          {/* OTP Component if required */}
          {showOtpComponent && (
            <Box
              sx={{
                padding: "16px",
                backgroundColor: "#fafafa",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                marginBottom: "16px",
              }}
            >
              <SendOTP
                handleDeleteTicket={handleDeleteTicket}
                ticketId={customerApplication.ticketId}
                email={localStorage.getItem( "email" ) || ""}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            bgcolor: "lightcyan"
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
            sx={{
              backgroundColor: "#FF3B30",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
            }}
            startIcon={<DeleteForever />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>

  );
};

export default ApplicationCard;

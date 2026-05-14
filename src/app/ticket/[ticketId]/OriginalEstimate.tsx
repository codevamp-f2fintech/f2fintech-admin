import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useMediaQuery,
  Paper,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

import Toast from "../../components/common/Toast";
import { AppDispatch, RootState } from "@/redux/store";
import { useModifyTicket } from "@/hooks/ticket";
import { useCreateTicketHistory } from "@/hooks/tickethistory";
import { Utility } from "@/utils";

interface OriginalEstimateProps {
  ticketId: string[] | string;
  initialEstimate: string | undefined;
  userRole: string;
}

const OriginalEstimateField: React.FC<OriginalEstimateProps> = ( {
  ticketId,
  initialEstimate,
  userRole,
} ) => {
  const isMobile = useMediaQuery( "(max-width:600px)" );
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector( ( state: RootState ) => state.toast );
  const { toastAndNavigate, decodedToken } = Utility();

  const { modifyTicket } = useModifyTicket( "update-ticket" );
  const { createTicketHistory } = useCreateTicketHistory(
    "create-ticket-history"
  );

  const [ originalEstimate, setOriginalEstimate ] = useState( initialEstimate );
  const [ isEditing, setIsEditing ] = useState( false );
  // The "in-progress" value:
  const [ tempEstimate, setTempEstimate ] = useState( initialEstimate );

  useEffect( () => {
    setOriginalEstimate( initialEstimate );
    setTempEstimate( initialEstimate );
  }, [ initialEstimate ] );

  const handleEnterEdit = () => {
    if ( userRole === "admin" )
    {
      setIsEditing( true );
    }
  };

  const handleSave = async () => {
    try
    {
      await modifyTicket( +ticketId, {
        original_estimate: tempEstimate,
      } );

      const loggedInUser = decodedToken()?.username;
      const historyMessage = `${ loggedInUser } changed estimate from ${ initialEstimate } to ${ tempEstimate }`;
      await createTicketHistory( {
        ticket_id: ticketId,
        action: historyMessage,
      } );

      setOriginalEstimate( tempEstimate );
      setIsEditing( false );
      toastAndNavigate(
        dispatch,
        true,
        "info",
        "Estimate Changed Successfully",
        null,
        null,
        true
      );
    } catch ( error )
    {
      toastAndNavigate( dispatch, true, "error", "Error Updating Estimate" );
      setTempEstimate( originalEstimate );
      setIsEditing( false );
    }
  };

  const handleCancel = () => {
    setTempEstimate( originalEstimate );
    setIsEditing( false );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "row" : "row",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{
          // fontSize: isMobile ? ".8rem" : isTab ? ".9rem" : "16px",
          fontSize: {
            xs: ".8rem",
            sm: ".9rem",
            md: "16px",
          },
          fontWeight: "bold",
          color: "black",
          marginLeft: ".5rem",
          fontFamily: "",
        }}
      >
        Original Estimate
      </Typography>

      {!isEditing && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "0.4rem",
              borderRadius: "4px",
              minWidth: "50px",
              cursor: userRole === "admin" ? "pointer" : "default",
            }}
            onClick={handleEnterEdit}
          >
            {originalEstimate}
          </Typography>

          {userRole === "admin" && (
            <Tooltip title="Edit original estimate">
              <IconButton size="small" onClick={handleEnterEdit}>
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {isEditing && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
          }}
        >
          <TextField
            value={tempEstimate}
            variant="outlined"
            size="small"
            onChange={( e ) => setTempEstimate( e.target.value )}
            sx={{
              width: "9rem",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
              },
            }}
          />

          <Paper
            sx={{
              position: "absolute",
              top: "90%",
              left: "53%",
              mt: 0.5,
              p: 0.5,
              gap: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
              backgroundColor: "#fff",
              boxShadow: 3,
              borderRadius: 1,
              zIndex: 9999,
            }}
          >
            <Tooltip title="Save estimate">
              <IconButton
                size="small"
                onClick={handleSave}
                aria-label="Save new estimate"
              >
                <CheckIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel editing">
              <IconButton size="small" onClick={handleCancel} aria-label="Cancel">
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      )}
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </Box>
  );
};

export default OriginalEstimateField;

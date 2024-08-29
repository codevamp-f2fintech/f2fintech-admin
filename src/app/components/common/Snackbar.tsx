/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface ToastProps {
  alerting: boolean;
  message: string;
  severity: AlertColor;
}

const Toast: React.FC<ToastProps> = ({ alerting, message, severity }) => {
  const [state, setState] = React.useState({
    open: alerting,
    Transition: Slide,
  });

  React.useEffect(() => {
    setState({
      ...state,
      open: alerting
    });
  }, [alerting]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setState({
      ...state,
      open: false,
    });
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={state.open}
      onClose={handleClose}
      autoHideDuration={2000}
      TransitionComponent={state.Transition}
      key={state.Transition.name}
      action={action}
    >
      <Alert severity={severity} sx={{ width: "100%" }} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

Toast.propTypes = {
  alerting: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.any.isRequired,
};

export default Toast;

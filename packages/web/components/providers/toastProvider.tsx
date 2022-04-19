import MuiAlert, { AlertProps } from "@mui/material/Alert";
import React, { useState } from "react";

import { AlertColor } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { useContext } from "react";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface context {
  handleOpen: (severity: AlertColor, message: string) => void;
}

const NirvanaToastContext = React.createContext<context>({
  handleOpen: (
    severity: AlertColor = "success",
    message: string = "Success"
  ) => {},
});

export const NirvanaToastProvider: React.FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);

  const [severity, setSeverity] = useState<AlertColor>("success");
  const [message, setMessage] = useState<string>("Success");

  const handleOpen = (
    severity: AlertColor = "success",
    message: string = "Success"
  ) => {
    // set severity + message first
    setSeverity(severity);
    setMessage(message);

    // show the alert
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const value = {
    handleOpen,
  };

  return (
    <NirvanaToastContext.Provider value={value}>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>

      {children}
    </NirvanaToastContext.Provider>
  );
};

export default function useNirvanaToast() {
  return useContext(NirvanaToastContext);
}

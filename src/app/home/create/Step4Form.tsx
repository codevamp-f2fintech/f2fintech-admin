'use client';

import { axiosInstance } from "@/apis/config/axiosConfig";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, ErrorMessage } from "formik";
import { Box, Typography, Button, IconButton, Tooltip, CircularProgress, Alert, Snackbar } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";

import Toast from "@/app/components/common/Toast";
import { Utility } from "@/utils";

// Validation schema
const validationSchema = Yup.object({
  aadharFront: Yup.mixed().nullable().required("Aadhar Card Front is Required"),
  aadharBack: Yup.mixed().nullable().nullable(),
  pancard: Yup.mixed().nullable().nullable(),
  passportSizePhoto: Yup.mixed().nullable(),
});


// Initial values
interface FormValues {
  aadharFront: File | null;
  aadharBack: File | null;
  pancard: File | null;
  passportSizePhoto: File | null;
}

const initialValues: FormValues = {
  aadharFront: null,
  aadharBack: null,
  pancard: null,
  passportSizePhoto: null,
};

// Interface for FileInput props
interface FileInputProps {
  name: string;
  label: string;
  preview?: string;
  accept?: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  onDelete: (name: string) => void;
  showWebcamCapture?: boolean;
  onCapturePhoto?: () => void;
}

// FileInput component for file selection and preview
const FileInput: React.FC<FileInputProps> = ({
  name,
  label,
  preview,
  accept,
  onFileChange,
  onDelete,
}) => (
  <Box sx={{ width: "100%", maxWidth: "340px", my: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Typography
      sx={{
        fontSize: "14px",
        color: "#1e293b",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        mb: 1,
        textAlign: "center",
      }}
    >
      {label}
    </Typography>

    {!preview && (
      <Box
        component="label"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "110px",
          border: "2px dashed #cbd5e1",
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#3949ab",
            backgroundColor: "#eef2ff",
          },
        }}
      >
        <IconButton component="span" sx={{ color: "#3949ab", p: 0.5, pointerEvents: "none" }}>
          <AddPhotoAlternateIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <Typography sx={{ fontSize: "12px", color: "#3949ab", fontWeight: 500, mt: 0.5 }}>
          Click to Browse File
        </Typography>
        <input
          hidden
          type="file"
          accept={accept}
          onChange={(event) => onFileChange(event, name)}
        />
      </Box>
    )}

    {preview && (
      <Box
        sx={{
          mt: 1,
          width: "100%",
          textAlign: "center",
          position: "relative",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          p: 1,
          backgroundColor: "#ffffff",
        }}
      >
        <img
          src={preview}
          alt={label}
          style={{ maxWidth: "100%", maxHeight: "140px", objectFit: "contain", borderRadius: "4px" }}
        />
        <IconButton
          onClick={() => onDelete(name)}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: "#fee2e2" },
            padding: "4px",
          }}
        >
          <Tooltip title="DELETE">
            <DeleteIcon sx={{ color: "#ef4444", fontSize: "18px" }} />
          </Tooltip>
        </IconButton>
      </Box>
    )}

    <ErrorMessage name={name}>
      {(msg) => (
        <Typography
          sx={{
            color: "#ef4444",
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            marginTop: "6px",
            fontWeight: 500,
          }}
        >
          {msg}
        </Typography>
      )}
    </ErrorMessage>
  </Box>
);

// Interface for Step4Form props
interface Step4FormProps {
  handleNext: () => void;
  handleBack: () => void;
  allUploadsSuccess: boolean;
  aadharUploadsSuccess: boolean;
  setAadharUploadsSuccess: (value: boolean) => void;
}

// Main form component
const Step4Form: React.FC<Step4FormProps> = ({
  handleNext,
  handleBack,
  allUploadsSuccess,
  aadharUploadsSuccess,
  setAadharUploadsSuccess,
}) => {
  const [previews, setPreviews] = useState<{
    aadharFront: string;
    aadharBack: string;
    passportSizePhoto: string;
    pancard?: string;
  }>({
    aadharFront: "",
    aadharBack: "",
    passportSizePhoto: "",
    pancard: ""
  });
  const toastInfo = useSelector((state: any) => state.toast);
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const { getLocalStorage, setLocalStorage, toastAndNavigate } =
    Utility();
  const customerId = getLocalStorage("customerInfo")?.id;
  const StatementUpload = getLocalStorage("StatementUpload");

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };


  const [successfulUploads, setSuccessfulUploads] = useState<Record<string, boolean>>({});

  const nameToTypeMap: Record<string, string> = {
    aadharFront: "aadhaar front",
    aadharBack: "aadhaar back",
    pancard: "pancard",
    passportSizePhoto: "photo",
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
      const docType = nameToTypeMap[name];
      if (docType) {
        setSuccessfulUploads((prev) => ({ ...prev, [docType]: false }));
      }
    }
  };

  const handleDelete = (name: string) => {
    setPreviews((prev) => ({ ...prev, [name]: "" }));
    const docType = nameToTypeMap[name];
    if (docType) {
      setSuccessfulUploads((prev) => ({ ...prev, [docType]: false }));
    }
  };

  // Resilient single-file upload engine with automatic 3x retries
  const uploadFileWithRetry = async (file: File, type: string, customerId: string, retries = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const uploadResponse = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_WEB_URL}/upload-to-s3`,
          {
            document: file,
            folder: `document/${file.name}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const attachmentUrl = uploadResponse.data.data;

        if (attachmentUrl) {
          await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_WEB_URL}/create-document`,
            {
              customer_id: customerId,
              document_url: attachmentUrl,
              type: type,
            }
          );
          return true;
        }
      } catch (err) {
        console.warn(`Upload attempt ${attempt} failed for ${type}. Retrying...`);
        if (attempt === retries) {
          return false;
        }
        // Brief exponential backoff pause before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return false;
  };

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      if (!navigator.onLine) {
        handleToast("No internet connection. Please try again later.", "error");
        return;
      }
      const { aadharFront, aadharBack, pancard, passportSizePhoto } = values;
      setIsUploading(true);

      const tasks: Promise<{ type: string; success: boolean }>[] = [];

      if (aadharFront && !successfulUploads["aadhaar front"]) {
        tasks.push(
          uploadFileWithRetry(aadharFront, "aadhaar front", customerId).then((success) => ({ type: "aadhaar front", success }))
        );
      } else if (aadharFront) {
        tasks.push(Promise.resolve({ type: "aadhaar front", success: true }));
      }

      if (aadharBack && !successfulUploads["aadhaar back"]) {
        tasks.push(
          uploadFileWithRetry(aadharBack, "aadhaar back", customerId).then((success) => ({ type: "aadhaar back", success }))
        );
      } else if (aadharBack) {
        tasks.push(Promise.resolve({ type: "aadhaar back", success: true }));
      }

      if (pancard && !successfulUploads["pancard"]) {
        tasks.push(
          uploadFileWithRetry(pancard, "pancard", customerId).then((success) => ({ type: "pancard", success }))
        );
      } else if (pancard) {
        tasks.push(Promise.resolve({ type: "pancard", success: true }));
      }

      if (passportSizePhoto && !successfulUploads["photo"]) {
        tasks.push(
          uploadFileWithRetry(passportSizePhoto, "photo", customerId).then((success) => ({ type: "photo", success }))
        );
      } else if (passportSizePhoto) {
        tasks.push(Promise.resolve({ type: "photo", success: true }));
      }

      const results = await Promise.all(tasks);

      // Record newly succeeded files so they aren't uploaded again on subsequent attempts
      const newSuccesses: Record<string, boolean> = { ...successfulUploads };
      results.forEach((r) => {
        if (r.success) newSuccesses[r.type] = true;
      });
      setSuccessfulUploads(newSuccesses);

      // Check if any active file upload attempt failed
      const allSucceeded = results.length > 0 && results.every((r) => r.success);

      if (allSucceeded) {
        handleToast("Documents uploaded successfully!", "success");
        setAadharUploadsSuccess(true);
        setLocalStorage("profileDetail", true);

        const timer = setTimeout(() => {
          handleNext();
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        const failedTypes = results.filter((r) => !r.success).map((r) => r.type).join(", ");
        handleToast(`Upload incomplete. Failed: ${failedTypes}. Please retry or manually select failed file.`, "error");
      }
      setIsUploading(false);
    },
    [customerId, successfulUploads, handleNext, setAadharUploadsSuccess, setLocalStorage]
  );

  useEffect(() => {
    const handleOnline = () => handleToast("Back online", "success");
    const handleOffline = () => handleToast("You are offline", "error");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validateOnMount={true}
        initialTouched={{
          aadharFront: true,
          aadharBack: true,
          pancard: true,
          passportSizePhoto: true,
        }}
      >
        {({ dirty, isSubmitting, handleSubmit, setFieldValue, setFieldTouched, errors, touched }) => (
          <Form onSubmit={(e) => {
            e.preventDefault();
            // Mark all required fields as touched on submit attempt
            setFieldTouched("aadharFront", true);
            setFieldTouched("aadharBack", true);
            setFieldTouched("pancard", true);
            setFieldTouched("passportSizePhoto", true);
            handleSubmit(e);
          }} encType="multipart/form-data">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "15px 15px",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: {
                    xs: "1.5rem",
                    sm: "2rem",
                    md: "1.8rem",
                  },
                  color: "#0f172a",
                  fontWeight: 700,
                  marginBottom: 1,
                  mt: 2,
                }}
              >
                Profile Details and <span style={{ color: "#3949ab" }}>Proofs</span>
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "#475569",
                  marginBottom: 3,
                  fontWeight: 500,
                }}
              >
                Step 3/4
              </Typography>

              {/* Aadhar Card Front */}
              <FileInput
                name="aadharFront"
                label="Aadhar Card Front"
                preview={previews.aadharFront}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.rtf,.xml"
                onFileChange={(event) => {
                  handleFileChange(event, "aadharFront");
                  setFieldValue("aadharFront", event.target.files[0]);
                  setFieldTouched("aadharFront", true);
                }}
                onDelete={() => {
                  handleDelete("aadharFront");
                  setFieldValue("aadharFront", null);
                  setFieldTouched("aadharFront", true);
                }}
              />

              {/* Aadhar Card Back */}
              <FileInput
                name="aadharBack"
                label="Aadhar Card Back"
                preview={previews.aadharBack}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.rtf,.xml"
                onFileChange={(event) => {
                  handleFileChange(event, "aadharBack");
                  setFieldValue("aadharBack", event.target.files[0]);
                  setFieldTouched("aadharBack", true);
                }}
                onDelete={() => {
                  handleDelete("aadharBack");
                  setFieldValue("aadharBack", null);
                  setFieldTouched("aadharBack", true);
                }}
              />

              {/* Pan Card */}
              <FileInput
                name="pancard"
                label="Pan Card"
                preview={previews.pancard}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.rtf,.xml"
                onFileChange={(event) => {
                  handleFileChange(event, "pancard");
                  setFieldValue("pancard", event.target.files[0]);
                  setFieldTouched("pancard", true);
                }}
                onDelete={() => {
                  handleDelete("pancard");
                  setFieldValue("pancard", null);
                  setFieldTouched("pancard", true);
                }}
              />

              {/* Passport Size Photo */}
              <FileInput
                name="passportSizePhoto"
                label="Passport Size Photo"
                preview={previews.passportSizePhoto}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.rtf,.xml"
                onFileChange={(event) => {
                  handleFileChange(event, "passportSizePhoto");
                  setFieldValue("passportSizePhoto", event.target.files[0]);
                  setFieldTouched("passportSizePhoto", true);
                }}
                onDelete={() => {
                  handleDelete("passportSizePhoto");
                  setFieldValue("passportSizePhoto", null);
                  setFieldTouched("passportSizePhoto", true);
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  width: "30vw",
                  justifyContent: "space-between",
                  ml: "40px",
                }}
              >
                <Button
                  onClick={handleBack}
                  disabled={allUploadsSuccess || StatementUpload}
                  sx={{ mt: 2, fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#64748b", textTransform: "none", fontWeight: 500 }}
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  disabled={!dirty || isSubmitting || !previews.aadharFront}
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    color: "#ffffff",
                    backgroundColor: "#3949ab",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    textTransform: "none",
                    borderRadius: "8px",
                    padding: "8px 24px",
                    boxShadow: "0px 8px 20px rgba(57, 73, 171, 0.35)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#303f9f",
                      boxShadow: "0px 10px 25px rgba(57, 73, 171, 0.45)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      backgroundColor: "#e2e8f0",
                      color: "#94a3b8",
                      boxShadow: "none",
                    },
                  }}
                >
                  {isUploading ? (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: "#ffffff",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-10px",
                        marginLeft: "-10px",
                      }}
                    />
                  ) : (
                    "Upload Documents"
                  )}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
      {/* MUI Snackbar for toast messages */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Step4Form;

'use client';

import axios from "axios";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, ErrorMessage } from "formik";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";

import Toast from "@/app/components/common/Toast";
import { Utility } from "@/utils";

// Validation schema
const validationSchema = Yup.object({
  aadharFront: Yup.mixed().required("This Field is Required"),
  aadharBack: Yup.mixed().nullable(),
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
  <>
    <Typography
      sx={{
        fontSize: "2.5vh",
        color: " #F2F0EF",
        fontFamily: "DM sans",
      }}
    >
      {label}
    </Typography>

    {!preview && (
      <IconButton component="label" sx={{ color: "#FFD700" }}>
        <AddPhotoAlternateIcon />
        <input
          hidden
          type="file"
          accept={accept}
          onChange={(event) => onFileChange(event, name)}
        />
      </IconButton>
    )}

    {preview && (
      <Box
        sx={{ mt: 2, width: "40%", textAlign: "center", position: "relative" }}
      >
        <img
          src={preview}
          alt={label}
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <IconButton
          onClick={() => onDelete(name)}
          sx={{
            width: "40%",
            position: "absolute",
            top: 20,
            right: 20,
            transform: "translate(50%, -50%)",
            borderRadius: "50%",
            padding: "5px",
          }}
        >
          <Tooltip title="DELETE">
            <DeleteIcon
              sx={{
                color: "#002147",
                "&:hover": {
                  color: "red",
                  fontSize: "1.5rem",
                  transition: "all 0.3s ease-in-out",
                },
              }}
            />
          </Tooltip>
        </IconButton>
      </Box>
    )}
    <ErrorMessage name={name} component="div" style={{ color: "red" }} />
  </>
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
    passportSizePhoto: ""
  });
  const toastInfo = useSelector((state: any) => state.toast);
  const dispatch = useDispatch();

  const { getLocalStorage, setLocalStorage, toastAndNavigate } =
    Utility();
  const customerId = getLocalStorage("customerInfo")?.id;
  const StatementUpload = getLocalStorage("StatementUpload");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleDelete = (name: string) => {
    setPreviews((prev) => ({ ...prev, [name]: "" }));
  };

  const uploadFileToS3 = async (file: File, type: string, customerId: string) => {
    try {
      const uploadResponse = await axios.post(
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
        await axios.post(
          `${process.env.NEXT_PUBLIC_WEB_URL}/create-document`,
          {
            customer_id: customerId,
            document_url: attachmentUrl,
            type: type,
          }
        );
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      toastAndNavigate(
        dispatch,
        true,
        "error",
        `Error Uploading ${type}`
      );
    }
  };


  // Form submission handler
  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      const uploadPromises: Promise<any>[] = [];
      const { aadharFront, aadharBack, pancard, passportSizePhoto } = values;

      try {
        if (aadharFront) {
          console.log("Uploading Aadhar Front");
          uploadPromises.push(uploadFileToS3(aadharFront, "aadhaar front", customerId));
        }
        if (aadharBack) {
          console.log("Uploading Aadhar Back");
          uploadPromises.push(uploadFileToS3(aadharBack, "aadhaar back", customerId));
        }
        if (pancard) {
          console.log("Uploading Pancard");
          uploadPromises.push(uploadFileToS3(pancard, "pancard", customerId));
        }
        if (passportSizePhoto) {
          console.log("Uploading Passport Size Photo");
          uploadPromises.push(uploadFileToS3(passportSizePhoto, "photo", customerId));
        }

        await Promise.all(uploadPromises);
        console.log("All documents uploaded successfully");
        toastAndNavigate(dispatch, true, "info", "Uploaded Successfully");
        setAadharUploadsSuccess(true);
        setLocalStorage("profileDetail", true);

        const timer = setTimeout(() => {
          handleNext(); // Call handleNext to move to the next step after 2 seconds
        }, 2000);
        return () => clearTimeout(timer); // Clear the timeout if the component unmounts

      } catch (err) {
        toastAndNavigate(dispatch, true, "error", "Upload Failed. Please Try Again");
        console.error("Error in uploading one or more documents:", err);
      }
    },
    [dispatch, handleNext]
  );

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ dirty, isSubmitting, handleSubmit, setFieldValue }) => (
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
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
                  fontFamily: "DM Sans",
                  fontSize: {
                    xs: "1.7rem", // Mobile
                    sm: "2.5rem", // Tablet
                    md: "2rem", // Desktop
                  },
                  color: "white",
                  fontWeight: 500,
                  marginBottom: 1,
                }}
              >
                Profile Details and{" "}
                <span style={{ color: "#FFD700" }}>Proof</span>
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "2vh",
                  color: "white",
                  marginBottom: 3,
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
                }}
                onDelete={() => {
                  handleDelete("aadharFront");
                  setFieldValue("aadharFront", null);
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
                }}
                onDelete={() => {
                  handleDelete("aadharBack");
                  setFieldValue("aadharBack", null);
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
                }}
                onDelete={() => {
                  handleDelete("pancard");
                  setFieldValue("pancard", null);
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
                }}
                onDelete={() => {
                  handleDelete("passportSizePhoto");
                  setFieldValue("passportSizePhoto", null);
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  width: "40vw",
                  justifyContent: "space-between",
                  ml: "40px",
                }}
              >
                <Button
                  onClick={handleBack}
                  disabled={allUploadsSuccess || StatementUpload}
                  sx={{ mt: 2, fontFamily: "Poppins", fontSize: ".9rem" }}
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  disabled={!dirty || isSubmitting || !previews.aadharFront}
                  type="submit"
                  variant="contained"
                  sx={{
                    mr: 1,
                    mt: {
                      xs: "1rem",
                      sm: "0",
                      md: "0",
                    },
                    color: "black",
                    backgroundColor: "#FFD700",
                    fontFamily: "Poppins",
                    fontSize: ".9rem",
                    height: {
                      xs: "4vh",
                      sm: "4vh",
                      md: "6vh",
                    },
                    "&:hover": {
                      backgroundColor: "transparent", // Transparent color on hover
                    },
                  }}
                >
                  Upload
                </Button>
                <Button
                  sx={{
                    mr: 4,
                    mt: 1,
                    fontFamily: "Poppins",
                    fontSize: ".9rem",
                  }}
                  onClick={handleNext}
                >
                  Skip
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
      <Toast
        alerting={toastInfo.toastAlert}
        message={toastInfo.toastMessage}
        severity={toastInfo.toastSeverity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
};

export default Step4Form;

'use client';

import axios from "axios";
import { useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { CurrencyRupee as CurrencyRupeeIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import Toast from "@/app/components/common/Toast";
import { Utility } from "@/utils";

interface Step7FormProps {
  handleBack: () => void;
  aadharUploadsSuccess: boolean;
}

const Step7Form: React.FC<Step7FormProps> = ({
  handleBack,
  aadharUploadsSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // To store selected files
  const [selectedAudioFiles, setSelectedAudioFiles] = useState<File[]>([]); // To store selected audio files
  const toastInfo = useSelector((state: any) => state.toast);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState<number | null>(null);
  const [emi, setEmi] = useState<number | null>(null);
  const [liability, setLiability] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<{
    amount: string;
    emi: string;
    liability: string;
  }>({
    amount: "",
    emi: "",
    liability: "",
  });

  const { getLocalStorage, remLocalStorage, toastAndNavigate } =
    Utility();
  const storedCustomerId = getLocalStorage("customerInfo")?.id;
  const profileDetail = getLocalStorage("profileDetail");

  // Validation for Amount
  const validateAmount = (value: string | number | null) => {
    let error = "";
    if (!value) {
      error = "This field is required.";
    } else if (isNaN(Number(value))) {
      error = "Amount must be a number.";
    } else if (Number(value) < 50000 || Number(value) > 1000000000) {
      error = "Amount must be between 50 thousand and 100 crore.";
    }
    setErrors((prev) => ({ ...prev, amount: error }));
  };

  // Validation for EMI
  const validateEmi = (value: string | number | null) => {
    let error = "";
    if (value && isNaN(Number(value))) {
      error = "EMI must be a number.";
    }
    setErrors((prev) => ({ ...prev, emi: error }));
  };

  // Validation for Liability
  const validateLiability = (value: string | number | null) => {
    let error = "";
    if (value && isNaN(Number(value))) {
      error = "Liability must be a number.";
    }
    setErrors((prev) => ({ ...prev, liability: error }));
  };


  // Function to update customer info
  const updateCustomerInfo = async (data: any) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_WEB_URL}/customer-info-update`,
        data
      )
      console.log("Customer info updated successfully.");
    } catch (error) {
      console.log("Error updating customer info:", error);
    }
  };

  // Handle deleting a file from the selected files array
  const handleAttachmentDelete = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    if (inputRef.current) {
      inputRef.current.value = ""; // Reset the value of the input element
    }
  };

  const handleAttachmentAudioDelete = (index: number) => {
    const updatedFiles = selectedAudioFiles.filter((_, i) => i !== index);
    setSelectedAudioFiles(updatedFiles);
    if (inputRef.current) {
      inputRef.current.value = ""; // Reset the value of the input element
    }
  };

  const updateFormInfo = async (data: any) => {
    if (storedCustomerId) {
      try {
        await updateCustomerInfo(data);

        // Reset form fields
        setAmount(null);
        setEmi(null);
        setLiability(null);

        setTimeout(() => {
          remLocalStorage("activeStep");
          remLocalStorage("StatementUpload");
          remLocalStorage("profileDetail");
          location.reload();
        }, 1500);
      } catch (error) {
        console.error("Error updating customer info:", error);
      }
    } else {
      console.error("No customer ID found.");
    }
  };

  // Handle form submission
  const create = useCallback(async () => {
    const data = {
      customer_id: storedCustomerId,
      salary: amount,
      existing_emi: emi,
      existing_liability: liability,
    };
    let attachmentUrls: string[] = [];

    updateFormInfo(data);
    if (selectedFiles.length !== 0) {
      for (const file of selectedFiles) {
        // Uploading each document
        const formData = new FormData();
        formData.append("document", file);
        formData.append("folder", `document/${file.name}`);

        try {
          const uploadResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_WEB_URL}/upload-to-s3`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const attachmentUrl = uploadResponse.data.data; // Store the URL from the response

          if (attachmentUrl) {
            attachmentUrls.push(attachmentUrl); // Push URL to array

            await axios.post(
              `${process.env.NEXT_PUBLIC_WEB_URL}/create-document`,
              {
                customer_id: storedCustomerId,
                document_url: attachmentUrl,
                type: "certificate",
              }
            );
          }
        } catch (err) {
          console.log("Error uploading attachment:", err);
          toastAndNavigate(
            dispatch,
            true,
            "error",
            "Error uploading documents"
          );
          return; // Exit early if there's an error
        }
      }
    }

    // Handle audio files (if necessary)
    if (selectedAudioFiles.length !== 0) {
      console.log('Load audio files');
      // You can add the audio file upload logic here if needed.
    }

    // If no files to upload, log this info
    if (!selectedFiles.length && !selectedAudioFiles.length) {
      console.log('----------------------------no files to upload------------------------');
    }
  }, [
    amount,
    emi,
    liability,
    storedCustomerId,
    dispatch,
    selectedFiles,
    selectedAudioFiles,
    toastAndNavigate,
  ]);

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: 2,
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
        Additional <span style={{ color: "#FFD700" }}> Details</span>
      </Typography>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontSize: "2vh",
          color: "white",
          marginBottom: 3,
        }}
      >
        Step 4/4
      </Typography>
      <Box
        sx={{
          width: { xs: "100%", sm: "70%", md: "45%" },
          marginBottom: 3,
        }}
      >
        <TextField
          autoComplete="off"
          fullWidth
          variant="filled"
          type="text"
          name="amount"
          label="(Salary/Turnover)p.a*"
          placeholder="(Salary/Turnover)*p.a"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            validateAmount(e.target.value);
          }}
          onBlur={() => validateAmount(amount)}
          error={!!errors.amount}
          helperText={errors.amount}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            fontSize: "13px",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: 2,
            "& .MuiFilledInput-root": {
              borderRadius: "4px",
              border: "1px solid transparent",
            },
            "& .MuiInputAdornment-root": {
              color: "white",
            },
            "& .css-ubk1op-MuiFormLabel-root-MuiInputLabel-root": {
              color: "white",
            },
          }}
        />
        <TextField
          autoComplete="off"
          fullWidth
          variant="filled"
          name="emi"
          type="number"
          label="Existing Emi Amount"
          placeholder="Existing Emi Amount"
          value={emi}
          onChange={(e) => {
            setEmi(e.target.value);
            validateEmi(e.target.value);
          }}
          onBlur={() => validateEmi(emi)}
          error={!!errors.emi}
          helperText={errors.emi}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            fontSize: "13px",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: 2,
            "& .MuiFilledInput-root": {
              borderRadius: "4px",
              border: "1px solid transparent",
            },
            "& .MuiInputAdornment-root": {
              color: "white",
            },
            "& .css-ubk1op-MuiFormLabel-root-MuiInputLabel-root": {
              color: "white",
            },
          }}
        />
        <TextField
          autoComplete="off"
          fullWidth
          variant="filled"
          name="liability"
          type="number"
          label="Existing credit card liability"
          placeholder="Existing credit card liability"
          value={liability}
          onChange={(e) => {
            setLiability(e.target.value);
            validateLiability(e.target.value);
          }}
          onBlur={() => validateLiability(liability)}
          error={!!errors.liability}
          helperText={errors.liability}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CurrencyRupeeIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            fontSize: "13px",
            borderRadius: "10px",
            overflow: "hidden",
            "& .MuiFilledInput-root": {
              borderRadius: "4px",
              border: "1px solid transparent",
            },
            "& .MuiInputAdornment-root": {
              color: "white",
            },
            "& .css-ubk1op-MuiFormLabel-root-MuiInputLabel-root": {
              color: "white",
            },
          }}
        />
      </Box>

      <Divider sx={{ width: "40vw" }} />
      <Typography
        variant="h5"
        sx={{
          fontSize: {
            xs: "0.75rem", // Mobile
            sm: "0.875rem", // Tablet
            md: "1rem", // Desktop
          },
          color: "white",
        }}
      >
        Degree and Registration Certificate
      </Typography>
      {selectedFiles.length < 4 && (
        <IconButton
          component="label"
          sx={{ width: "auto", mb: 2, color: "#FFD700" }}
        >
          <AddPhotoAlternateIcon />
          <input
            ref={inputRef}
            hidden
            multiple
            type="file"
            accept=".jpg, .gif, .png, .jpeg, .svg, .webp, application/pdf, .doc, .docx, .txt"
            onChange={(event) => {
              const newFiles = Array.from(event.target.files);

              // Calculate total files including the new selection
              const totalFiles = selectedFiles.length + newFiles.length;

              if (totalFiles > 4) {
                toastAndNavigate(
                  dispatch,
                  true,
                  "error",
                  "Maximum limit reached: 4 files"
                );
                return;
              }

              // Check file size limit (1MB = 1,048,576 bytes)
              const filteredFiles = newFiles.filter((file) => {
                if (file.size > 1048576) {
                  toastAndNavigate(
                    dispatch,
                    true,
                    "error",
                    `${file.name} exceeds the 1MB limit`
                  );
                  return false;
                }
                return true;
              });
              console.log("filteredFiles", filteredFiles);

              // If there are no files left after filtering, return early
              if (filteredFiles.length === 0) return;

              setSelectedFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
            }}
          />
        </IconButton>
      )}

      {/* Display selected file names with delete icons */}
      {selectedFiles.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: "40vw", mt: 2 }}>
          {selectedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography>{file.name}</Typography>
              <IconButton
                onClick={() => handleAttachmentDelete(index)}
                sx={{ ml: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          width: "40vw",
          justifyContent: "flex-start",
        }}
      >
        <Button
          onClick={handleBack}
          sx={{ mt: 2, fontFamily: "Poppins", fontSize: ".9rem" }}
          disabled={aadharUploadsSuccess || profileDetail}
        >
          Back
        </Button>
        <Button
          disabled={!!errors.amount || !amount}
          variant="contained"
          onClick={create}
          sx={{
            fontSize: "1rem",
            lineHeight: "1.5rem",
            mt: 2,
            ml: 14,
            width: "30%",
            alignSelf: "center",
            marginBottom: 3,
            color: "black",
            fontFamily: "Poppins",
            fontWeight: "500",
            backgroundColor: "#FFD700",
            "&:hover": {
              backgroundColor: "transparent", // Transparent color on hover
            },
          }}
        >
          Submit
        </Button>
      </Box>
      <Toast
        alerting={toastInfo.toastAlert}
        message={toastInfo.toastMessage}
        severity={toastInfo.toastSeverity}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Container>
  );
};

export default Step7Form;

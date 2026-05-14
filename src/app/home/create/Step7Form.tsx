'use client';

import { axiosInstance } from "@/apis/config/axiosConfig";
import { useCallback, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { CurrencyRupee as CurrencyRupeeIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { Utility } from "@/utils";
import { getCompanyId } from "@/utils/cookies";

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

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [generatedApplicationNumber, setGeneratedApplicationNumber] = useState<string | number>("");

  const handleToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const [errors, setErrors] = useState<{
    amount: string;
    emi: string;
    liability: string;
  }>({
    amount: "",
    emi: "",
    liability: "",
  });

  const { getLocalStorage, setLocalStorage, remLocalStorage, decodedToken } =
    Utility();
  const pendingDataFallback = getLocalStorage("pendingApplicationData") || getLocalStorage("loanFormData");
  const storedCustomerId = getLocalStorage("customerInfo")?.id || pendingDataFallback?.customerId;
  const profileDetail = getLocalStorage("profileDetail");
  const [isUploading, setIsUploading] = useState(false);

  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      color: "#0f172a",
      transition: "all 0.2s ease",
      alignItems: "center",
      "& .MuiInputBase-input": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "4px !important",
        fontSize: "14px",
        fontWeight: 500,
        color: "#0f172a",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#cbd5e1",
        borderWidth: "1px",
        transition: "all 0.2s ease",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#94a3b8",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#3949ab",
        borderWidth: "2px",
      },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e2e8f0",
      },
      "&.Mui-disabled": {
        backgroundColor: "#f1f5f9 !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#475569",
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: "#ffffff",
      px: 0.5,
      "&.Mui-focused": {
        color: "#3949ab !important",
      },
    },
    "& .MuiInputAdornment-root": {
      color: "#3949ab !important",
      marginRight: "2px",
      display: "flex",
      alignItems: "center",
      "& *": { color: "#3949ab !important" },
    },
    "& .MuiFormHelperText-root": {
      color: "#64748b",
      "&.Mui-error": {
        color: "#ef4444",
      },
    },
  };

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
      await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_WEB_URL}/customer-info-update`,
        data
      )
      console.log("Customer info updated successfully.");
    } catch (error) {
      console.log("Error updating customer info:", error);
    }
  };

  // Generate random application number
  const randomNumberGenerator = (): number =>
    Math.floor(10000000 + Math.random() * 90000000);

  // Function to create the customer application
  async function createCustomerApplication(
    customerId: number,
    applicationNumber: number,
    amount: number,
    tenure: number,
    provider: string,
    loanType: string,
    loanCategory: string,
    leadType: string,
    existingLoans: any[],
    caseType: string,
  ) {
    const { data: applicationResponse } =
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_WEB_URL}/create-application`,
        {
          customer_id: customerId,
          applied_by: decodedToken()?.id,
          application_no: applicationNumber,
          amount,
          tenure,
          provider,
          loan_type: loanType,
          loan_category: loanCategory,
          lead_type: leadType,
          existing_loans: JSON.stringify(existingLoans.map((l: any) => ({
            has_running_loans: l.has_running_loans === "yes" ? 1 : 0,
            which_loan: l.which_loan,
            loan_amount: l.loan_amount ? Number(l.loan_amount) : null,
            running_emi: l.running_emi ? Number(l.running_emi) : null
          }))),
          case_type: caseType,
          source: "admin_portal",
          company_id: getCompanyId() || getLocalStorage("selectedCompanyId"),
        })
    return applicationResponse.data.applicationId;
  }

  // Function to create loan tracking
  async function createLoanTracking(applicationId: number) {
    await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_WEB_URL}/create-loan-tracking`,
      {
        customer_application_id: applicationId,
        status: "submitted",
        company_id: getCompanyId() || getLocalStorage("selectedCompanyId"),
      })
  }

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
    const fallbackCache = getLocalStorage("pendingApplicationData") || getLocalStorage("loanFormData");
    const activeCustomerId = storedCustomerId || fallbackCache?.customerId;
    if (activeCustomerId) {
      try {
        await updateCustomerInfo({ ...data, customer_id: activeCustomerId });
        console.log("Customer additional info updated successfully.");
      } catch (error) {
        console.error("Error updating customer info:", error);
      }
    } else {
      console.error("No customer ID found.");
    }
  };

  // Handle form submission
  const create = useCallback(async () => {
    // Check if the user is online
    if (!navigator.onLine) {
      handleToast("No internet connection. Please try again later.", "error");
      return;
    }
    setIsUploading(true);

    const fallbackCache = getLocalStorage("pendingApplicationData") || getLocalStorage("loanFormData");
    const activeCustomerId = storedCustomerId || fallbackCache?.customerId;

    const data = {
      customer_id: activeCustomerId,
      salary: amount,
      existing_emi: emi,
      existing_liability: liability,
    };
    let attachmentUrls: string[] = [];

    await updateFormInfo(data);

    const appNumbersGenerated: string[] = [];
    // Create applications from pending data
    const pendingData = getLocalStorage("pendingApplicationData") || getLocalStorage("loanFormData");

    if (pendingData && activeCustomerId) {
      try {
        const {
          providers,
          providerAmounts,
          amount: loanAmount,
          tenure,
          loanTypes,
          loanCategory,
          leadType,
          existingLoans,
          caseType,
        } = pendingData;

        const activeProviders = providers && providers.length > 0 ? providers : ["Default Provider"];
        const primaryLoanType = loanTypes && loanTypes.length > 0 ? loanTypes[0] : (pendingData?.loanType || "personal loan");
        const numericTenure = tenure ? Number(String(tenure).split(" ")[0]) : 5;
        const activeLoanCategory = loanCategory || pendingData?.loanCategory || "unsecured";
        const activeLeadType = leadType || pendingData?.leadType || "notion";
        const activeExistingLoans = existingLoans || pendingData?.existingLoans || [];
        const activeCaseType = caseType || pendingData?.caseType || "fresh";

        // Create exactly ONE application for the customer with all providers as a comma-separated string
        const providersString = activeProviders.join(", ");
        // Use the primary loan amount from Step 1 (loanAmount) as the base
        const finalAmount = Number(loanAmount || amount || 100000);
        
        const appNo = randomNumberGenerator();
        const applicationId = await createCustomerApplication(
          activeCustomerId,
          appNo,
          finalAmount,
          numericTenure,
          providersString,
          primaryLoanType,
          activeLoanCategory,
          activeLeadType,
          activeExistingLoans,
          activeCaseType
        );

        await createLoanTracking(applicationId);
        appNumbersGenerated.push(String(appNo));
        console.log(`Successfully created single application ${appNo} for providers: ${providersString}`);

        // Update customerInfo in localStorage with all generated application numbers
        const customerInfo = getLocalStorage("customerInfo") || { id: activeCustomerId };
        customerInfo.applicationNumbers = appNumbersGenerated;
        setLocalStorage("customerInfo", customerInfo);

        remLocalStorage("pendingApplicationData");
      } catch (error) {
        console.error("Error creating per-provider applications in Step 7:", error);
      }
    }

    if (selectedFiles.length !== 0 && activeCustomerId) {
      for (const file of selectedFiles) {
        // Uploading each document
        const formData = new FormData();
        formData.append("document", file);
        formData.append("folder", `document/${file.name}`);

        try {
          const uploadResponse = await axiosInstance.post(
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

            await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_WEB_URL}/create-document`,
              {
                customer_id: activeCustomerId,
                document_url: attachmentUrl,
                type: "certificate",
              }
            );
          }
        } catch (err) {
          handleToast("Error uploading documents", "error");
          setIsUploading(false);
          return; // Exit early if there's an error
        }
      }
    }

    // Handle audio files (if necessary)
    if (selectedAudioFiles.length !== 0) {
      console.log('Load audio files');
    }

    // If no files to upload, log this info
    if (!selectedFiles.length && !selectedAudioFiles.length) {
      console.log('no files to upload');
    }
    setIsUploading(false);

    // Reveal success screen with all generated application numbers
    const customerInfoFinal = getLocalStorage("customerInfo");
    let finalIdsString = "";
    if (appNumbersGenerated.length > 0) {
      finalIdsString = appNumbersGenerated.join(", ");
    } else if (customerInfoFinal?.applicationNumbers?.length > 0 && customerInfoFinal.applicationNumbers[0] !== "pending") {
      finalIdsString = customerInfoFinal.applicationNumbers.join(", ");
    }
    setGeneratedApplicationNumber(finalIdsString);
    setLocalStorage("applicationSubmittedSuccessfully", true);
    setLocalStorage("submittedApplicationNumbers", finalIdsString);
    setShowSuccessScreen(true);
  }, [
    amount,
    emi,
    liability,
    storedCustomerId,
    selectedFiles,
    selectedAudioFiles,
  ]);

  // Restore success screen persistence on accidental refresh
  useEffect(() => {
    if (getLocalStorage("applicationSubmittedSuccessfully")) {
      const savedNumbers = getLocalStorage("submittedApplicationNumbers");
      if (savedNumbers) {
        setGeneratedApplicationNumber(savedNumbers);
      }
      setShowSuccessScreen(true);
    }
  }, []);

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
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: 2,
      }}
    >
      {showSuccessScreen ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: "90%", md: "70%" },
            minHeight: "40vh",
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginTop: "5vh"
          }}
        >
          <Box
            sx={{
              width: "80px",
              height: "80px",
              backgroundColor: "#4caf50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3
            }}
          >
            <Typography variant="h3" color="white">✓</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#3949ab", mb: 2, fontFamily: "'Inter', sans-serif" }}>
            Application Submitted!
          </Typography>
          {generatedApplicationNumber && (
            <Box sx={{ my: 2.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: "100%" }}>
              <Typography variant="overline" sx={{ color: "#94a3b8", fontWeight: 700, letterSpacing: 1.5, fontFamily: "'Inter', sans-serif" }}>
                Application Reference Number
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
                {generatedApplicationNumber.split(",").map((num) => {
                  const cleanNum = num.trim();
                  // Break raw 8-digit numbers beautifully into 4-digit readable blocks (e.g., 9533 1148)
                  const formattedNum = cleanNum.length === 8 ? `${cleanNum.slice(0, 4)} ${cleanNum.slice(4)}` : cleanNum;
                  return (
                    <Box
                      key={cleanNum}
                      sx={{
                        backgroundColor: "#f8fafc",
                        border: "2px dashed #cbd5e1",
                        padding: "12px 28px",
                        borderRadius: "16px",
                        boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#3949ab",
                          backgroundColor: "#f1f5f9",
                        }
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: "#1e293b",
                          letterSpacing: 3,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {formattedNum}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
          <Typography variant="body1" sx={{ color: "#64748b", textAlign: "center", mb: 4, fontFamily: "'Inter', sans-serif" }}>
            Thank you for applying. We have securely received your loan application.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              remLocalStorage("applicationSubmittedSuccessfully");
              remLocalStorage("submittedApplicationNumbers");
              remLocalStorage("customerInfo");
              remLocalStorage("pendingApplicationData");
              remLocalStorage("loanFormData");
              remLocalStorage("activeStep");
              remLocalStorage("StatementUpload");
              remLocalStorage("StatementUploadSkipped");
              remLocalStorage("profileDetail");
              remLocalStorage("step1DraftData");
              remLocalStorage("step1GetStarted");
              remLocalStorage("step1CustomerDraft");
              location.reload();
            }}
            sx={{
              backgroundColor: "#3949ab",
              color: "#ffffff",
              fontWeight: 600,
              padding: "12px 32px",
              borderRadius: "8px",
              textTransform: "none",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0px 8px 20px rgba(57, 73, 171, 0.35)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#303f9f",
                boxShadow: "0px 10px 25px rgba(57, 73, 171, 0.45)",
                transform: "translateY(-2px)",
              }
            }}
          >
            Fill Another Application
          </Button>
        </Box>
      ) : (
        <>
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
            Additional <span style={{ color: "#3949ab" }}>Details</span>
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
              variant="outlined"
              type="text"
              name="amount"
              label="( Salary/Turnover ) p.a *"
              placeholder="(Salary/Turnover)*p.a"
              value={amount ?? ""}
              onChange={(e) => {
                setAmount(e.target.value);
                validateAmount(e.target.value);
              }}
              onBlur={() => validateAmount(amount)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: 2.5,
                ...commonTextFieldStyles,
              }}
            />
            <TextField
              autoComplete="off"
              fullWidth
              variant="outlined"
              name="emi"
              type="number"
              label="Existing Emi Amount"
              placeholder="Existing Emi Amount"
              value={emi ?? ""}
              onChange={(e) => {
                setEmi(e.target.value);
                validateEmi(e.target.value);
              }}
              onBlur={() => validateEmi(emi)}
              error={!!errors.emi}
              helperText={errors.emi}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: 2.5,
                ...commonTextFieldStyles,
              }}
            />
            <TextField
              autoComplete="off"
              fullWidth
              variant="outlined"
              name="liability"
              type="number"
              label="Existing credit card liability"
              placeholder="Existing credit card liability"
              value={liability ?? ""}
              onChange={(e) => {
                setLiability(e.target.value);
                validateLiability(e.target.value);
              }}
              onBlur={() => validateLiability(liability)}
              error={!!errors.liability}
              helperText={errors.liability}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: 2.5,
                ...commonTextFieldStyles,
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "30vw",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            {/* Credit Card Liability Field */}
            {/* Credit Card Liability Field */}
            <Typography
              variant="h5"
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#1e293b",
                fontFamily: "'Inter', sans-serif",
                mb: 1.5,
                mt: 1,
              }}
            >
              Degree and Registration Certificate (Optional)
            </Typography>

            {/* File Picker */}
            {selectedFiles.length < 4 && (
              <Box
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: "260px", sm: "320px", md: "380px" },
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
                  Click to Browse Certificate (Max 4)
                </Typography>
                <input
                  ref={inputRef}
                  hidden
                  multiple
                  type="file"
                  accept=".jpg, .gif, .png, .jpeg, .svg, .webp, application/pdf, .doc, .docx, .txt"
                  onChange={(event) => {
                    const newFiles = Array.from(event.target.files);
                    const totalFiles = selectedFiles.length + newFiles.length;

                    if (totalFiles > 4) {
                      handleToast("Maximum limit reached: 4 files", "error");
                      return;
                    }

                    const filteredFiles = newFiles.filter((file) => {
                      if (file.size > 5048576) {
                        handleToast(`${file.name} exceeds the 5 MB limit`, "error");
                        return false;
                      }
                      return true;
                    });

                    if (filteredFiles.length === 0) return;

                    setSelectedFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
                  }}
                />
              </Box>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <Box sx={{ width: "100%", maxWidth: "40vw", mt: 2 }}>
                {selectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
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

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                width: "100%",
                maxWidth: "380px",
                justifyContent: "center",
                alignItems: "center",
                mt: 4,
                mb: 6,
              }}
            >
              <Button
                disabled={!!errors.amount || !amount}
                variant="contained"
                onClick={create}
                sx={{
                  fontSize: "14px",
                  color: "#ffffff",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  backgroundColor: "#3949ab",
                  borderRadius: "8px",
                  padding: "8px 32px",
                  textTransform: "none",
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
                  "Submit"
                )}
              </Button>
            </Box>
          </Box>

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
      )}
    </Container>
  );
};

export default Step7Form;

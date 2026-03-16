/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { axiosInstance } from "@/apis/config/axiosConfig";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Formik, Form, ErrorMessage } from "formik";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormGroup,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  FormHelperText,
  OutlinedInput,
} from "@mui/material";
import { CurrencyRupee as CurrencyRupeeIcon, AccessTime, Close, Edit } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import SmsIcon from "@mui/icons-material/Sms";
import EmailIcon from "@mui/icons-material/Email";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getCompanyId } from "@/utils/cookies";

import step1ValidationSchema from "./step1ValidationSchema";
import { Utility } from "@/utils";
import Toast from "@/app/components/common/Toast";
import { useGetLoanProviders } from "@/hooks/loanProvider";
import { Chip, ListItemText } from "@mui/material";

const initialValues = {
  title: "",
  name: "",
  email: "",
  contact: "",
  status: "active",
  father_name: "",
  mother_name: "",
  working_address: "",
  permanent_address: "",
  current_address: "",
  dob: null,
  city: "",
  state: "",
  pan: "",
  employment_type: "",
};

interface Step1FormProps {
  applicationNumber?: number | string | null;
  setApplicationNumber?: (num: number | string | null) => void;
  getStarted?: boolean;
  setGetStarted?: (value: boolean) => void;
  salary?: any;
}

interface ProviderAmount {
  provider: string;
  amount: string;
}

const Step1Form: React.FC<Step1FormProps> = ({
  applicationNumber,
  setApplicationNumber,
  getStarted,
  setGetStarted,
  salary,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [providerAmounts, setProviderAmounts] = useState<ProviderAmount[]>([]);
  const [tenure, setTenure] = useState<string>("");
  const [loanType, setLoanType] = useState("");
  const [loanCategory, setLoanCategory] = useState("");
  const [provider, setProvider] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [leadType, setLeadType] = useState<string>("");
  const [leadTypeError, setLeadTypeError] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const [caseTypeError, setCaseTypeError] = useState<string>("");

  // Multiple Existing Loans State
  const [existingLoans, setExistingLoans] = useState([
    {
      has_running_loans: "",
      which_loan: "",
      loan_amount: "",
      running_emi: "",
    }
  ]);
  const [existingLoansErrors, setExistingLoansErrors] = useState([
    {
      has_running_loans: "",
      which_loan: "",
      loan_amount: "",
      running_emi: "",
    }
  ]);

  const [errors, setErrors] = useState<{
    amount: string;
    tenure: string;
    provider: string;
    loanType: string;
    leadType: string;
    caseType: string;
  }>({
    amount: "",
    tenure: "",
    provider: "",
    loanType: "",
    leadType: "",
    caseType: "",
  });
  const [loanStatus, setLoanStatus] = useState<string | null>(null);
  const toastInfo = useSelector((state: any) => state.toast);
  const dispatch = useDispatch();
  const [providers, setProviders] = useState<string[]>([]);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  // Define loan types with categories
  const loanTypes = {
    unsecured: [
      { value: "personal loan", label: "Personal Loan" },
      { value: "business loan", label: "Business Loan" },
      { value: "professional loan", label: "Professional Loan" },
      { value: "education loan", label: "Education Loan" },
      { value: "just inquiry", label: "Just Inquiry" }
    ],
    secured: [
      { value: "home loan", label: "Home Loan" },
      { value: "lap", label: "LAP (Loan Against Property)" },
      { value: "auto loan", label: "Auto Loan" },
      { value: "machinery loan", label: "Machinery Loan" }
    ]
  };

  const leadTypes = [
    { value: "notion", label: "Notion" },
    { value: "Dialler", label: "Dialler" },
    { value: "field visit", label: "Field visit" },
    { value: "sourcer", label: "Sourcer" },
    { value: "channel partner", label: "Channel partner" },
    { value: "ref from customer", label: "Ref from customer" },
    { value: "left employee follow up", label: "Left employee follow up" }
  ];

  // Define tenure options based on loan category
  const tenureOptions = {
    secured: [
      "5 Years",
      "8 Years",
      "10 Years",
      "15 Years",
      "20 Years",
      "25 Years",
      "30 Years"
    ],
    unsecured: [
      "1 Year",
      "2 Years",
      "3 Years",
      "4 Years",
      "5 Years",
      "6 Years",
      "7 Years",
      "8 Years"
    ]
  };

  const validateLeadType = (value: string): void => {
    let error = "";
    if (!value) {
      error = "Lead type is required";
    }
    setLeadTypeError(error);
  };

  const validateCaseType = (value: string): void => {
    let error = "";
    if (!value) {
      error = "Case type is required";
    }
    setCaseTypeError(error);
  };

  const validateExistingLoans = (loans: any[], errors: any[] = []) => {
    let hasIssues = false;
    const newErrors = loans.map((loan) => {
      const err = { has_running_loans: "", which_loan: "", loan_amount: "", running_emi: "" };
      if (!loan.has_running_loans) {
        err.has_running_loans = "This Field is required";
        hasIssues = true;
      }
      if (loan.has_running_loans === "yes") {
        if (!loan.which_loan) {
          err.which_loan = "This Field is required";
          hasIssues = true;
        }
        if (!loan.loan_amount) {
          err.loan_amount = "This Field is required";
          hasIssues = true;
        } else if (isNaN(loan.loan_amount)) {
          err.loan_amount = "Amount must be a number";
          hasIssues = true;
        } else if (loan.loan_amount <= 0) {
          err.loan_amount = "Amount must be greater than 0";
          hasIssues = true;
        }
        if (loan.running_emi) {
          if (isNaN(loan.running_emi)) {
            err.running_emi = "EMI must be a number";
            hasIssues = true;
          } else if (loan.running_emi < 0) {
            err.running_emi = "EMI cannot be negative";
            hasIssues = true;
          }
        }
      }
      return err;
    });
    setExistingLoansErrors(newErrors);
    return !hasIssues;
  };

  const handleExistingLoanChange = (index: number, field: string, value: string) => {
    const updatedLoans = [...existingLoans];
    (updatedLoans[index] as any)[field] = value;

    if (field === "has_running_loans" && value === "no") {
      updatedLoans[index].which_loan = "";
      updatedLoans[index].loan_amount = "";
      updatedLoans[index].running_emi = "";
    }

    setExistingLoans(updatedLoans);
    validateExistingLoans(updatedLoans, existingLoansErrors);
  };

  const handleAddLoan = () => {
    setExistingLoans([...existingLoans, { has_running_loans: "yes", which_loan: "", loan_amount: "", running_emi: "" }]);
    setExistingLoansErrors([...existingLoansErrors, { has_running_loans: "", which_loan: "", loan_amount: "", running_emi: "" }]);
  };

  const handleRemoveLoan = (indexToRemove: number) => {
    const updatedLoans = existingLoans.filter((_, index) => index !== indexToRemove);
    const updatedErrors = existingLoansErrors.filter((_, index) => index !== indexToRemove);
    setExistingLoans(updatedLoans);
    setExistingLoansErrors(updatedErrors);
    validateExistingLoans(updatedLoans, updatedErrors);
  };

  // Function to determine loan category based on loan type
  const getLoanCategory = (loanType: string): string => {
    const securedLoanTypes = ["home loan", "lap", "auto loan", "machinery loan"];
    const unsecuredLoanTypes = ["personal loan", "business loan", "professional loan", "education loan", "just inquiry"];

    if (securedLoanTypes.includes(loanType)) {
      return "secured";
    } else if (unsecuredLoanTypes.includes(loanType)) {
      return "unsecured";
    }
    return "";
  };

  // Handle loan type change
  const handleLoanTypeChange = (value: string) => {
    console.log("Selected Loan Type:", value);
    setLoanType(value);

    const category = getLoanCategory(value);
    console.log("Determined Loan Category:", category);

    setLoanCategory(category);

    // Reset tenure when loan type changes
    setTenure("");

    validateLoanType(value);
  };

  const validateProviders = (values: string[]): void => {
    let error = "";
    if (!values || values.length === 0) {
      error = "Please select at least one provider";
    }
    setErrors((prev) => ({ ...prev, provider: error }));
  };

  const validateLoanType = (value: string): void => {
    let error = "";
    if (!value) {
      error = "This Field is required";
    }
    setErrors((prev) => ({ ...prev, loanType: error }));
  };

  // Fetch loan providers
  const { value: providersData, swrLoading: providersLoading } =
    useGetLoanProviders(null, "get-all-loan-providers", 1, 100);

  const { decodedToken, getLocalStorage, remLocalStorage, setLocalStorage, toastAndNavigate
  } = Utility();
  const storedCustomerId = getLocalStorage("customerInfo")?.id;

  // Generate random application number
  const randomNumberGenerator = (): number =>
    Math.floor(10000000 + Math.random() * 90000000);

  const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000);

  // Get the current date and calculate 20 years ago
  const minDate = dayjs("1900-01-01");
  const maxDate = dayjs().subtract(20, "year");

  // Validation function for the amount
  const validateAmount = (value: string): void => {
    let error = "";
    if (!value) {
      error = "This Field is required";
    } else if (isNaN(Number(value))) {
      error = "Amount must be a number";
    } else if (Number(value) < 50000 || Number(value) > 100000000) {
      error = "Amount must be within 50 thousand and 10 crore";
    } else if (Number(value) % 5 !== 0) {
      error = "Amount must be divisible by 5";
    }
    setErrors((prev) => ({ ...prev, amount: error }));
  };

  const validateTenure = (value: string): void => {
    let error = "";
    if (!value) {
      error = "This Field is required";
    }
    setErrors((prev) => ({ ...prev, tenure: error }));
  };

  // Handle provider selection
  const handleProviderChange = (selectedProviders: string[]) => {
    setProviders(selectedProviders);
    validateProviders(selectedProviders);

    // Initialize amounts for newly selected providers
    const updatedAmounts = [...providerAmounts];
    selectedProviders.forEach(providerName => {
      if (!updatedAmounts.find(pa => pa.provider === providerName)) {
        updatedAmounts.push({
          provider: providerName,
          amount: amount || "" // Use the main amount if available, otherwise empty
        });
      }
    });

    // Remove amounts for deselected providers
    const filteredAmounts = updatedAmounts.filter(pa =>
      selectedProviders.includes(pa.provider)
    );
    setProviderAmounts(filteredAmounts);
  };

  // Handle provider removal
  const handleProviderRemove = (providerToRemove: string) => {
    const newProviders = providers.filter(p => p !== providerToRemove);
    setProviders(newProviders);
    validateProviders(newProviders);

    // Remove from provider amounts
    setProviderAmounts(prev =>
      prev.filter(pa => pa.provider !== providerToRemove)
    );
  };

  // Open amount dialog for a specific provider
  const openAmountDialog = (providerName: string) => {
    setEditingProvider(providerName);
    setAmountDialogOpen(true);
  };

  // Update amount for a specific provider
  const updateProviderAmount = (providerName: string, newAmount: string) => {
    setProviderAmounts(prev =>
      prev.map(pa =>
        pa.provider === providerName ? { ...pa, amount: newAmount } : pa
      )
    );
  };

  // Validate all provider amounts
  const validateAllProviderAmounts = (): boolean => {
    for (const pa of providerAmounts) {
      if (!pa.amount) {
        return false;
      }
      if (isNaN(Number(pa.amount))) {
        return false;
      }
      if (Number(pa.amount) < 50000 || Number(pa.amount) > 100000000) {
        return false;
      }
      if (Number(pa.amount) % 5 !== 0) {
        return false;
      }
    }
    return true;
  };

  // Fetch application number and loan status using stored customer ID
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (storedCustomerId) {
        try {
          const { data: response } = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_WEB_URL}/get-application-by-id/${storedCustomerId}`);
          if (response.status === "Success") {
            setApplicationNumber?.(response.data.application_no);
            const { data: resp } = await axiosInstance.get(
              `${process.env.NEXT_PUBLIC_WEB_URL}/get-loan-tracking-by-id/${response.data.id}`);
            if (resp.status === "Success") {
              setLoanStatus(resp.data.status);
            }
          }
        } catch (err) {
          console.log("Error fetching customer data:", err);
        }
      }
    };
    fetchCustomerData();
  }, [storedCustomerId]);

  // Function to register the customer
  async function registerCustomer(customer) {
    // Combine title and name before sending
    const customerData = {
      ...customer,
      name: `${customer.title} ${customer.name}`.trim() // Combine title and name
    };

    const companyId = getCompanyId();

    // const headers: { [ key: string ]: string } = {};
    // if ( companyId )
    // {
    //   headers.company_id = companyId; // Add companyId to headers
    // }

    const { data: res } = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_WEB_URL}/create-customer`,
      customerData,
    );

    if (res.status !== "Success") {
      throw new Error(`Registration failed: ${res.message}`);
    }
    return res.data.id;
  }

  // Function to create customer info
  async function createCustomerInfo(customerId: number, restValues: any) {
    const companyId = getCompanyId();
    // const headers = companyId ? { companyid: companyId } : {};
    await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_WEB_URL}/create-customer-info`,
      {
        customer_id: customerId,
        ...restValues,
      })
  }

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
    const companyId = getCompanyId();
    // const headers = companyId ? { companyid: companyId } : {};
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
          // company_id: companyId,
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
        // company_id: companyId,
      })
  }

  const setCustomerData = async (customerInfo) => {
    setGetStarted(false);
    setLocalStorage("customerInfo", customerInfo);
    // location.reload();
  }

  // Create new customer with loan application
  const create = useCallback(
    async (values: typeof initialValues) => {
      setLoading(true);
      const { contact, email, name, status, dob, ...restValues } = values;
      const customer = {
        contact,
        dob,
        email,
        title: values.title,
        name: values.name,
        password: `${name.replace(/\s/g, "")}@${randomFourDigitNumber}`,
        status,
      };

      try {
        // const companyId = getCompanyId();
        // if ( !companyId )
        // {
        //   throw new Error( 'Company ID is required' );
        // }
        const customerId = storedCustomerId || (await registerCustomer(customer));
        const customerInfoWithLeadType = {
          ...restValues,
          lead_type: leadType, // Use the state variable, not values.lead_type

        };
        await createCustomerInfo(customerId, customerInfoWithLeadType);

        // Create applications for each selected provider with their specific amounts
        const applicationPromises = providers.map(async (providerName) => {
          const providerAmount = providerAmounts.find(pa => pa.provider === providerName)?.amount || amount;
          const applicationNumberGenerated = randomNumberGenerator();
          const applicationId = await createCustomerApplication(
            customerId,
            applicationNumberGenerated,
            providerAmount, // Use provider-specific amount
            tenure,
            providerName,
            loanType,
            loanCategory,
            leadType,
            existingLoans,
            caseType,
          );
          await createLoanTracking(applicationId);
          return applicationNumberGenerated;
        });

        const applicationNumbers = await Promise.all(applicationPromises);

        // Store the first application number or all of them as needed
        setApplicationNumber(applicationNumbers[0]);

        !storedCustomerId
          ? await setCustomerData({
            id: customerId,
            name: customer.name,
            applicationNumbers: applicationNumbers, // Store all application numbers
          })
          : location.reload();

        setLoading(false);
        console.log(
          `Created ${providers.length} applications successfully:`,
          applicationNumbers
        );
      } catch (err) {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err?.response?.data?.msg || "Error Occurred. Please Try Again"
        );
        setLoading(false);
        console.log("Error during customer creation:", err?.response?.data?.msg);
      } finally {
        setLoading(false);
      }
    },
    [amount, tenure, providers, providerAmounts, loanType, loanCategory, leadType, existingLoans, caseType] // Updated dependency
  );

  const commonFormControlStyles = {
    "& .MuiFilledInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderRadius: "12px",
      color: "white",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      transition: "all 0.3s ease",
      "& .MuiSelect-filled": {
        color: "white !important",
      },
      "&:before, &:after": {
        borderBottom: "none !important",
      },
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,0.15)",
        boxShadow: "0 0 0 2px rgba(144,202,249,0.4)",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(255, 255, 255, 0.08) !important",
        color: "rgba(255,255,255,0.5) !important",
        WebkitTextFillColor: "rgba(255,255,255,0.5) !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
      fontSize: "14px",
      "&.Mui-disabled": {
        color: "rgba(255,255,255,0.5) !important",
      },
    },
    "& .Mui-focused": {
      color: "#ffffff !important",
    },
    "& .MuiSelect-icon": {
      color: "white",
    },
  };

  const commonTextFieldStyles = {
    "& .MuiFilledInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderRadius: "12px",
      color: "white",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      transition: "all 0.3s ease",
      "&:before, &:after": {
        borderBottom: "none !important",
      },
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,0.15)",
        boxShadow: "0 0 0 2px rgba(144,202,249,0.4)",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(255, 255, 255, 0.08) !important",
        color: "rgba(255,255,255,0.5) !important",
        WebkitTextFillColor: "rgba(255,255,255,0.5) !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
      fontSize: "14px",
      "&.Mui-disabled": {
        color: "rgba(255,255,255,0.5) !important",
      },
    },
    "& .Mui-focused": {
      color: "#ffffff !important",
    },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#1e1e1e",
        borderRadius: "10px",
        "& .MuiMenuItem-root": {
          color: "white",
          "&:hover": {
            backgroundColor: "#333",
          },
          "&.Mui-selected": {
            backgroundColor: "#90caf9 !important",
            color: "#fff",
          },
        },
      },
    },
  };

  const PROVIDER_OPTIONS = providersLoading
    ? []
    : providersData?.data?.results?.map(provider => provider.title) || [];

  // If application number and loan status exists, display success message without making user to fill the form again
  if (applicationNumber) {
    const storedCustomerInfo = getLocalStorage("customerInfo");
    const allApplicationNumbers = storedCustomerInfo?.applicationNumbers || [applicationNumber];

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: 2,
          padding: 3,
          border: "1px solid #b6b6b6",
          borderRadius: "20px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
          maxWidth: "500px",
          margin: "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.4rem",
            lineHeight: "2rem",
            color: "#1976d2",
            fontWeight: "600",
            fontFamily: "Roboto, sans-serif",
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          Your applications are submitted!
        </Typography>

        {allApplicationNumbers.length > 1 ? (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: "1rem", color: "#333", mb: 1 }}>
              Your Application Numbers are:
            </Typography>
            {allApplicationNumbers.map((appNum, index) => (
              <Typography key={index} sx={{ fontSize: "0.9rem", color: "#333", textAlign: "center" }}>
                <strong>{appNum}</strong>
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: "1rem", color: "#333", mb: 2 }}>
            Your Application Number is <strong>{applicationNumber}</strong>.
          </Typography>
        )}

        <Typography
          sx={{
            fontSize: "1rem",
            color: "#333",
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          We will contact you within the next half an hour.
          {!salary && ` To speed up the process, please complete the next steps.`}
        </Typography>

        {salary ? (
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: "100%",
              borderRadius: "10px 10px 10px 10px",
              bgcolor: "#3244e6",
              color: "white",
              "&:hover": {
                bgcolor: "#5a68ec",
                color: "white",
              },
            }}
            onClick={() => {
              remLocalStorage("customerInfo");
              location.reload();
            }}
          >
            Fill Another Application
          </Button>
        ) : null}
      </Box>
    );
  }

  // Initial form view with amount and tenure selection
  if (!getStarted) {
    return (
      <Box
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
            fontSize: {
              xs: "4vw",
              sm: "3.5vw",
              md: "1.7vw",
            },
            lineHeight: "2rem",
            color: "#ffffff",
            fontFamily: "DM sans",
            marginBottom: 2,
          }}
        >
          Get the loan best suited for your wish
        </Typography>

        {/* Main Fields Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
            width: { xs: "90%", sm: "95%", md: "90%" },
            mb: 4
          }}
        >
          {/* Amount Field */}
          <Box>
            <TextField
              autoComplete="off"
              fullWidth
              variant="filled"
              name="amount"
              label="Enter Net Amount*"
              placeholder="Base Loan Amount"
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
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <CurrencyRupeeIcon />
                  </InputAdornment>
                ),
              }}
              sx={commonTextFieldStyles}
            />
          </Box>

          {/* Loan Type Field */}
          <Box>
            <FormControl fullWidth variant="filled" error={!!errors.loanType} sx={commonFormControlStyles}>
              <InputLabel>Loan Type*</InputLabel>
              <Select
                name="loanType"
                value={loanType}
                onChange={(e) => handleLoanTypeChange(e.target.value)}
                onBlur={() => validateLoanType(loanType)}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                MenuProps={commonMenuProps}
              >
                <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#333", color: "#90caf9" }}>Unsecured Loans</MenuItem>
                {loanTypes.unsecured.map((loan) => (
                  <MenuItem key={loan.value} value={loan.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>{loan.label}</MenuItem>
                ))}
                <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#333", color: "#90caf9", mt: 1 }}>Secured Loans</MenuItem>
                {loanTypes.secured.map((loan) => (
                  <MenuItem key={loan.value} value={loan.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>{loan.label}</MenuItem>
                ))}
              </Select>
              {errors.loanType && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.loanType}</Typography>}
            </FormControl>
          </Box>

          {/* Tenure Field */}
          <Box>
            <FormControl fullWidth variant="filled" error={!!errors.tenure} sx={commonFormControlStyles}>
              <InputLabel>{loanCategory ? `Select Tenure (${loanCategory === 'secured' ? 'Long Term' : 'Short Term'})` : "Select A Comfortable Tenure"}</InputLabel>
              <Select
                name="tenure"
                value={tenure}
                onChange={(e) => {
                  setTenure(e.target.value);
                  validateTenure(e.target.value);
                }}
                onBlur={() => validateTenure(tenure)}
                disabled={!loanCategory}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <AccessTime />
                  </InputAdornment>
                }
                MenuProps={commonMenuProps}
              >
                {(loanCategory ? tenureOptions[loanCategory] : []).map((label) => (
                  <MenuItem key={label} value={label} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>{label}</MenuItem>
                ))}
              </Select>
              {errors.tenure && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.tenure || (loanCategory ? "" : "Please select a loan type first")}</Typography>}
            </FormControl>
          </Box>

          {/* Providers Field */}
          <Box>
            <FormControl fullWidth variant="filled" error={!!errors.provider} sx={commonFormControlStyles}>
              <InputLabel>Provider Names* (Select Multiple)</InputLabel>
              <Select
                name="providers"
                multiple
                value={providers}
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                  handleProviderChange(value);
                }}
                onBlur={() => validateProviders(providers)}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(144,202,249,0.3)',
                          color: 'white',
                          '& .MuiChip-deleteIcon': { color: 'white' },
                        }}
                        onDelete={() => handleProviderRemove(value)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e1e1e",
                      borderRadius: "10px",
                      "& .MuiMenuItem-root": {
                        color: "white",
                        "&:hover": { backgroundColor: "#333" },
                        "&.Mui-selected": { color: "#fff" },
                      },
                      overflow: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                    },
                  },
                }}
              >
                <MenuItem
                  value="Let F2 Fintech decide your lender"
                  sx={{
                    backgroundColor: "rgba(50, 68, 230, 0.1)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { backgroundColor: "rgba(50, 68, 230, 0.2)" },
                    "&.Mui-selected": { backgroundColor: "rgba(50, 68, 230, 0.4) !important" },
                  }}
                >
                  <Checkbox
                    checked={providers.indexOf("Let F2 Fintech decide your lender") > -1}
                    sx={{ color: "rgba(255,255,255,0.7)", '&.Mui-checked': { color: "#3244e6" } }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#90caf9" }}>Let F2 Fintech decide your lender</Typography>
                </MenuItem>
                {PROVIDER_OPTIONS.map((providerName) => (
                  <MenuItem key={providerName} value={providerName} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>
                    <Checkbox checked={providers.indexOf(providerName) > -1} sx={{ color: 'white', '&.Mui-checked': { color: '#90caf9' } }} />
                    <ListItemText primary={providerName} sx={{ color: 'white' }} />
                  </MenuItem>
                ))}
              </Select>
              {errors.provider && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.provider}</Typography>}
            </FormControl>
          </Box>

          {/* Lead Type Field */}
          <Box>
            <FormControl fullWidth variant="filled" error={!!leadTypeError} sx={commonFormControlStyles}>
              <InputLabel>Lead Type*</InputLabel>
              <Select
                name="leadType"
                value={leadType}
                onChange={(e) => {
                  setLeadType(e.target.value);
                  validateLeadType(e.target.value);
                }}
                onBlur={() => validateLeadType(leadType)}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                MenuProps={commonMenuProps}
              >
                {leadTypes.map((lead) => (
                  <MenuItem key={lead.value} value={lead.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>{lead.label}</MenuItem>
                ))}
              </Select>
              {leadTypeError && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{leadTypeError}</Typography>}
            </FormControl>
          </Box>

          {/* Case Type Field */}
          <Box>
            <FormControl fullWidth variant="filled" error={!!caseTypeError} sx={commonFormControlStyles}>
              <InputLabel>Case Type*</InputLabel>
              <Select
                name="caseType"
                value={caseType}
                onChange={(e) => {
                  setCaseType(e.target.value);
                  validateCaseType(e.target.value);
                }}
                onBlur={() => validateCaseType(caseType)}
                startAdornment={
                  <InputAdornment position="start" sx={{ color: "white !important" }}>
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                MenuProps={commonMenuProps}
              >
                <MenuItem value="top_up" sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>Top Up</MenuItem>
                <MenuItem value="fresh" sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>Fresh</MenuItem>
              </Select>
              {caseTypeError && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{caseTypeError}</Typography>}
            </FormControl>
          </Box>
        </Box>

        {/* Provider Amounts Summary */}
        {providers.length > 0 && (
          <Box
            sx={{
              width: { xs: "90%", sm: "95%", md: "90%" },
              mb: 3,
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                mb: 2,
              }}
            >
              Customize Amounts per Provider:
            </Typography>
            <Stack spacing={1}>
              {providers.map((providerName) => {
                const providerAmount = providerAmounts.find(pa => pa.provider === providerName)?.amount || amount;
                return (
                  <Box
                    key={providerName}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: "13px",
                        flex: 1,
                      }}
                    >
                      {providerName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{
                          color: "#90caf9",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        ₹{providerAmount || "Not set"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => openAmountDialog(providerName)}
                        sx={{
                          color: "#90caf9",
                          '&:hover': {
                            backgroundColor: "rgba(144, 202, 249, 0.1)",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Existing Loans Loop - Relocated with Premium Styling */}
        <Box sx={{ width: { xs: "90%", sm: "95%", md: "90%" }, mb: 4, mt: 2 }}>
          <Typography
            sx={{
              color: "#90caf9",
              fontWeight: 600,
              fontSize: "1.1rem",
              fontFamily: "Poppins",
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              letterSpacing: "0.5px"
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 22 }} /> EXISTING LOANS
          </Typography>

          {existingLoans.map((loan, index) => {
            const loanErr = existingLoansErrors[index] || {} as any;
            return (
              <Box
                key={index}
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  p: 2.5,
                  mb: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.07)",
                    borderColor: "rgba(144, 202, 249, 0.4)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#ffff",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      fontSize: "0.7rem",
                      backgroundColor: "rgba(144, 202, 249, 0.1)",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px"
                    }}
                  >
                    LOAN RECORD #{index + 1}
                  </Typography>
                  {existingLoans.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveLoan(index)}
                      sx={{
                        color: "#ff4444",
                        backgroundColor: "rgba(255,68,68,0.1)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255,68,68,0.25)",
                          transform: "scale(1.1)"
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Stack spacing={3}>
                  <FormControl fullWidth variant="filled" error={!!loanErr.has_running_loans} sx={commonFormControlStyles}>
                    <InputLabel>Existing Loans*</InputLabel>
                    <Select
                      value={loan.has_running_loans}
                      onChange={(e) => handleExistingLoanChange(index, "has_running_loans", e.target.value)}
                      MenuProps={commonMenuProps}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                    {loanErr.has_running_loans && <FormHelperText error>{loanErr.has_running_loans}</FormHelperText>}
                  </FormControl>

                  {loan.has_running_loans === "yes" && (
                    <FormControl fullWidth variant="filled" error={!!loanErr.which_loan} sx={commonFormControlStyles}>
                      <InputLabel>Loan Type*</InputLabel>
                      <Select
                        value={loan.which_loan}
                        onChange={(e) => handleExistingLoanChange(index, "which_loan", e.target.value)}
                        MenuProps={commonMenuProps}
                      >
                        <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#333", color: "#90caf9", opacity: "1 !important" }}>Unsecured</MenuItem>
                        {loanTypes.unsecured.map((l) => (
                          <MenuItem key={l.value} value={l.value} sx={{ py: 1.2, px: 2, fontSize: '14px' }}>{l.label}</MenuItem>
                        ))}
                        <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#333", color: "#90caf9", mt: 1, opacity: "1 !important" }}>Secured</MenuItem>
                        {loanTypes.secured.map((l) => (
                          <MenuItem key={l.value} value={l.value} sx={{ py: 1.2, px: 2, fontSize: '14px' }}>{l.label}</MenuItem>
                        ))}
                      </Select>
                      {loanErr.which_loan && <FormHelperText error>{loanErr.which_loan}</FormHelperText>}
                    </FormControl>
                  )}

                  {loan.has_running_loans === "yes" && (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Outstanding Amount*"
                        placeholder="0.00"
                        value={loan.loan_amount}
                        onChange={(e) => handleExistingLoanChange(index, "loan_amount", e.target.value)}
                        error={!!loanErr.loan_amount}
                        helperText={loanErr.loan_amount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ color: "#90caf9", fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={commonTextFieldStyles}
                      />
                      <TextField
                        fullWidth
                        variant="filled"
                        label="Running EMI (Optional)"
                        placeholder="0.00"
                        value={loan.running_emi}
                        onChange={(e) => handleExistingLoanChange(index, "running_emi", e.target.value)}
                        error={!!loanErr.running_emi}
                        helperText={loanErr.running_emi}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ color: "#90caf9", fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={commonTextFieldStyles}
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            );
          })}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<Edit sx={{ fontSize: 18 }} />}
              onClick={handleAddLoan}
              sx={{
                borderRadius: "12px",
                color: "#ffff",
                borderColor: "rgba(144,202,249,0.3)",
                textTransform: 'none',
                fontWeight: 600,
                fontSize: "0.9rem",
                px: 4,
                py: 1,
                borderWidth: "1.5px",
                "&:hover": {
                  borderColor: "#90caf9",
                  backgroundColor: "rgba(144, 202, 249, 0.08)",
                  borderWidth: "1.5px",
                }
              }}
            >
              Add Another Loan Record
            </Button>
          </Box>
        </Box>

        <Button
          disabled={
            !!errors.amount ||
            !!errors.tenure ||
            !!errors.provider ||
            !!errors.loanType ||
            !!errors.leadType ||
            !!caseTypeError ||
            !amount ||
            !tenure ||
            !providers ||
            providers.length === 0 ||
            !loanType ||
            !leadType ||
            !caseType ||
            existingLoans.some(loan =>
              !loan.has_running_loans ||
              (loan.has_running_loans === "yes" && (!loan.which_loan || !loan.loan_amount))
            ) ||
            !validateAllProviderAmounts()
          }
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            setGetStarted(true);
          }}
          sx={{
            fontWeight: "500",
            fontSize: "1rem",
            fontFamily: "Poppins",
            lineHeight: "1.5rem",
            mt: 2,
            backgroundColor: "#039be5",
            width: {
              xs: "80%",
              md: "90%",
              sm: "95%",
            },
            alignSelf: "center",
            marginBottom: 3,
          }}
        >
          LET&apos;S GET STARTED
        </Button>

        {/* Provider Amount Dialog */}
        <Dialog
          open={amountDialogOpen}
          onClose={() => setAmountDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              backdropFilter: "blur(10px)",
              color: "white",
              borderRadius: "12px",
            },
          }}
        >
          <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            Set Amount for {editingProvider}
            <IconButton
              onClick={() => setAmountDialogOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              autoComplete="off"
              fullWidth
              variant="filled"
              label="Loan Amount"
              placeholder="Enter amount for this provider"
              value={providerAmounts.find(pa => pa.provider === editingProvider)?.amount || amount}
              onChange={(e) => {
                if (editingProvider) {
                  updateProviderAmount(editingProvider, e.target.value);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon sx={{ color: "white" }} />
                  </InputAdornment>
                ),
                style: {
                  color: "white",
                },
              }}
              sx={{
                "& .MuiFilledInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "white",
                  "&:before, &:after": {
                    borderBottom: "none !important",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", mt: 1 }}>
              Amount must be between 50,000 and 10,00,00,000 and divisible by 5
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setAmountDialogOpen(false)}
              sx={{ color: "#90caf9" }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ... Rest of your form code remains exactly the same ...
  // Main form view for getting customer details
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4444d3ff 0%, #16213e 50%, #0f3460 100%)',
        py: 2,
        px: { xs: 2, sm: 3, md: 0 },
        mt: 10
      }}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={step1ValidationSchema}
        onSubmit={(values) => create(values)}
      >
        {({
          dirty,
          errors,
          touched,
          values,
          setFieldValue,
          setFieldTouched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Container
              maxWidth="md"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: "15px",
                padding: { xs: "1rem", sm: "2rem" },
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                  mt: { xs: 0, sm: 0, md: 30, lg: 15 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: {
                      xs: "1rem",
                      sm: "1.2rem",
                      md: "1.5rem",
                    },
                    color: "#ffffff",
                    fontWeight: 300,
                    marginBottom: 1,
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                  }}
                >
                  Basic <span style={{ color: "#ffd700", textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>Details</span>
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 3,
                    py: 1,
                    backgroundColor: 'rgba(3, 155, 229, 0.2)',
                    borderRadius: '20px',
                    border: '1px solid rgba(3, 155, 229, 0.3)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: { xs: "0.9rem", sm: ".7rem" },
                      color: "#ffffff",
                      fontWeight: 500,
                    }}
                  >
                    Step 1/4
                  </Typography>
                </Box>
              </Box>

              {/* Form Fields Container */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: '100%',
                  gap: 3,
                }}
              >
                {/* Title and Name Row */}
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    maxWidth: "600px",
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  {/* Title Dropdown */}
                  <FormControl
                    variant="filled"
                    sx={{
                      minWidth: { xs: '100%', sm: 120 },
                      "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                        borderBottom: "none !important",
                      },
                      "& .MuiInputBase-root": {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "#ffffff",
                        fontSize: '16px',
                      },
                      "& .MuiInputLabel-root": {
                        color: "#b0b0b0",
                        fontSize: '16px',
                      },
                      "& .MuiSelect-icon": {
                        color: "#ffffff",
                      },
                    }}
                    error={!!touched.title && !!errors.title}
                  >
                    <InputLabel>Title*</InputLabel>
                    <Select
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: "rgba(26, 26, 46, 0.95)",
                            backdropFilter: 'blur(10px)',
                            color: "#ffffff",
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            "& .MuiMenuItem-root": {
                              color: "#ffffff",
                              '&:hover': {
                                backgroundColor: 'rgba(3, 155, 229, 0.2)',
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="Mr">Mr</MenuItem>
                      <MenuItem value="Mrs">Mrs</MenuItem>
                      <MenuItem value="Miss">Miss</MenuItem>
                      <MenuItem value="Dr">Dr</MenuItem>
                      <MenuItem value="Ca">Ca</MenuItem>
                    </Select>
                    {touched.title && errors.title && (
                      <Typography
                        sx={{
                          color: "#ff6b6b",
                          marginLeft: 1,
                          margin: "4px 14px",
                          fontSize: "12px",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: "400",
                        }}
                      >
                        {errors.title}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Name TextField */}
                  <TextField
                    autoComplete="off"
                    variant="filled"
                    type="text"
                    name="name"
                    label="Name*"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    sx={{
                      flex: 1,
                      "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                        borderBottom: "none !important",
                      },
                      "& .MuiInputBase-root": {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "#ffffff",
                        fontSize: '16px',
                      },
                      "& .MuiInputLabel-root": {
                        color: "#b0b0b0",
                        fontSize: '16px',
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#ff6b6b",
                        fontSize: '12px',
                      },
                    }}
                  />
                </Box>

                {/* Standard Form Fields */}
                {[
                  { name: 'contact', label: 'Contact*', type: 'number' },
                  { name: 'email', label: 'E-mail*', type: 'email' },
                  { name: 'pan', label: 'PAN*', type: 'text', special: 'pan' },
                  { name: 'father_name', label: 'Father\'s Name*', type: 'text' },
                  { name: 'mother_name', label: 'Mother\'s Name*', type: 'text' },
                  { name: 'working_address', label: 'Working Address*', type: 'text' },
                  { name: 'permanent_address', label: 'Permanent Address*', type: 'text' },
                  { name: 'current_address', label: 'Current Address*', type: 'text' },
                  { name: 'city', label: 'City*', type: 'text' },
                  { name: 'state', label: 'State*', type: 'text' },
                ].map((field) => (
                  <TextField
                    key={field.name}
                    autoComplete="off"
                    variant="filled"
                    type={field.type}
                    name={field.name}
                    label={field.label}
                    value={values[field.name]}
                    onChange={field.special === 'pan' ?
                      (event) => {
                        const uppercaseValue = event.target.value.toUpperCase();
                        setFieldValue("pan", uppercaseValue);
                      } : handleChange
                    }
                    onBlur={handleBlur}
                    error={!!touched[field.name] && !!errors[field.name]}
                    helperText={touched[field.name] && errors[field.name]}
                    inputProps={field.special === 'pan' ? {
                      maxLength: 10,
                      style: { textTransform: "uppercase" },
                    } : {}}
                    sx={{
                      width: "100%",
                      maxWidth: "600px",
                      "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                        borderBottom: "none !important",
                      },
                      "& .MuiInputBase-root": {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        paddingTop: '.7rem',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "#ffffff",
                        fontSize: '16px',
                        padding: '16px 12px',
                      },
                      "& .MuiInputLabel-root": {
                        color: "#b0b0b0",
                        fontSize: '16px',
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#ff6b6b",
                        fontSize: '12px',
                      },
                    }}
                  />
                ))}

                {/* Employment Type Dropdown */}
                <FormControl
                  variant="filled"
                  error={!!touched.employment_type && !!errors.employment_type}
                  sx={{
                    width: "100%",
                    maxWidth: "600px",
                    "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                      borderBottom: "none !important",
                    },
                    "& .MuiInputBase-root": {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "#ffffff",
                      fontSize: '16px',
                    },
                    "& .MuiInputLabel-root": {
                      color: "#b0b0b0",
                      fontSize: '16px',
                    },
                    "& .MuiSelect-icon": {
                      color: "#ffffff",
                    },
                  }}
                >
                  <InputLabel>Employment Type*</InputLabel>
                  <Select
                    name="employment_type"
                    value={values.employment_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "rgba(26, 26, 46, 0.95)",
                          backdropFilter: 'blur(10px)',
                          color: "#ffffff",
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          "& .MuiMenuItem-root": {
                            color: "#ffffff",
                            '&:hover': {
                              backgroundColor: 'rgba(3, 155, 229, 0.2)',
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="salaried">Salaried</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                    <MenuItem value="professional">Professional</MenuItem>
                  </Select>

                  <ErrorMessage
                    name="employment_type"
                    component="div"
                    style={{
                      color: "#ff6b6b",
                      margin: "4px 14px",
                      fontSize: "12px",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "400",
                    }}
                  />
                </FormControl>

                {/* Date of Birth */}
                <Box sx={{ width: "100%", maxWidth: "600px", backgroundColor: "#bdbdbd", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: 2, borderRadius: 2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD MMMM YYYY"
                      views={["year", "month", "day"]}
                      label="Select Date Of Birth*"
                      name="dob"
                      minDate={minDate}
                      maxDate={maxDate}
                      value={values.dob}
                      onBlur={() => setFieldTouched("dob", true)}
                      onChange={(newValue) => setFieldValue("dob", newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="filled"
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              },
                            },
                            "& .MuiInputBase-input": {
                              color: "#ffffff",
                              fontSize: '16px',
                            },
                            "& .MuiInputLabel-root": {
                              color: "#b0b0b0",
                              fontSize: '16px',
                            },
                          }}
                        />
                      )}
                      PopperProps={{
                        sx: {
                          "& .MuiPaper-root": {
                            backgroundColor: "rgba(26, 26, 46, 0.95)",
                            backdropFilter: 'blur(10px)',
                            color: "#ffffff",
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                          },
                          "& .MuiPickersDay-root": {
                            color: "#ffffff",
                            '&:hover': {
                              backgroundColor: 'rgba(3, 155, 229, 0.3)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#039be5',
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <ErrorMessage
                    name="dob"
                    component="div"
                    style={{
                      color: "#ff6b6b",
                      margin: "4px 14px",
                      fontSize: "12px",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "400",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "black",
                      ml: "16px",
                      mt: "4px",
                    }}
                  >
                    Minimum age 20 required
                  </Typography>
                </Box>

                {/* Terms Checkboxes */}
                <Box sx={{ width: "100%", maxWidth: "600px", mt: 2 }}>
                  <FormGroup sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          sx={{
                            color: "#b0b0b0",
                            '&.Mui-checked': {
                              color: "#039be5",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: { xs: "13px", sm: "14px", md: "15px" },
                            color: "#ffffff",
                            lineHeight: 1.5,
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          I agree to opt for the product and service of F2fintech.
                          By opting for F2fintech, I agree to have read,
                          understood and explicitly consent to the T&C, Privacy
                          Policy and F2fintech Credit Terms.
                        </Typography>
                      }
                    />
                  </FormGroup>

                  <FormGroup sx={{ mb: 4 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          sx={{
                            color: "#b0b0b0",
                            '&.Mui-checked': {
                              color: "#039be5",
                            },
                            alignSelf: 'flex-start',
                            mt: 0.5,
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "13px", sm: "14px" },
                              color: "#ffffff",
                              lineHeight: 1.5,
                              fontFamily: "Poppins, sans-serif",
                              mb: 2,
                            }}
                          >
                            I further consent to receive the loan and product
                            updates of F2fintech on WhatsApp and allow F2fintech
                            and/or their authorized third party service providers to
                            contact me for marketing purposes via
                          </Typography>

                          <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: 3,
                            flexWrap: 'wrap',
                          }}>
                            <SmsIcon sx={{ color: '#039be5', fontSize: 28 }} />
                            <CallIcon sx={{ color: '#039be5', fontSize: 28 }} />
                            <WhatsAppIcon sx={{ color: '#25D366', fontSize: 28 }} />
                            <EmailIcon sx={{ color: '#039be5', fontSize: 28 }} />
                          </Box>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Box>

                {/* Submit Button */}
                <Button
                  disabled={!dirty || loading}
                  type="submit"
                  sx={{
                    color: "#ffffff",
                    fontWeight: "600",
                    borderRadius: "25px",
                    fontSize: { xs: "16px", sm: "17px", md: "18px" },
                    lineHeight: "1.5rem",
                    width: { xs: "200px", sm: "220px", md: "240px" },
                    height: "50px",
                    mt: 2,
                    mb: 2,
                    background: 'linear-gradient(45deg, #039be5 30%, #0288d1 90%)',
                    boxShadow: '0 4px 20px rgba(3, 155, 229, 0.4)',
                    fontFamily: "Poppins, sans-serif",
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    "&:hover": {
                      background: 'linear-gradient(45deg, #0288d1 30%, #0277bd 90%)',
                      boxShadow: '0 6px 25px rgba(3, 155, 229, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    "&:disabled": {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#ffffff" }} />
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
      <Toast
        alerting={toastInfo.toastAlert}
        message={toastInfo.toastMessage}
        severity={toastInfo.toastSeverity}
      />
    </Box>
  );
};

export default Step1Form;
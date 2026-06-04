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
  Chip,
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
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { CurrencyRupee as CurrencyRupeeIcon, AccessTime, Close, Edit, Check } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import SmsIcon from "@mui/icons-material/Sms";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getCompanyId } from "@/utils/cookies";

import step1ValidationSchema from "./step1ValidationSchema";
import { Utility } from "@/utils";
import Toast from "@/app/components/common/Toast";
import { useGetLoanProviders } from "@/hooks/loanProvider";
import SearchIcon from "@mui/icons-material/Search";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

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
  onSubmit?: () => void;
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
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [customerDraft, setCustomerDraft] = useState(initialValues);
  const [providerAmounts, setProviderAmounts] = useState<ProviderAmount[]>([]);
  const [tenure, setTenure] = useState<string>("");
  const [loanType, setLoanType] = useState<string>("");
  const [loanCategory, setLoanCategory] = useState("");
  const [provider, setProvider] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [leadType, setLeadType] = useState<string>("");
  const [leadTypeError, setLeadTypeError] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("fresh");
  const [caseTypeError, setCaseTypeError] = useState<string>("");
  const [stateSearch, setStateSearch] = useState<string>("");

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
  const LOAN_TYPES_DATA = {
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
    { value: "dialler", label: "Dialler" },
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
  const getLoanCategory = (type: string): string => {
    const securedLoanTypes = ["home loan", "lap", "auto loan", "machinery loan"];
    const unsecuredLoanTypes = ["personal loan", "business loan", "professional loan", "education loan", "just inquiry"];

    if (securedLoanTypes.includes(type)) {
      return "secured";
    } else if (unsecuredLoanTypes.includes(type)) {
      return "unsecured";
    }
    return "";
  };

  // Handle loan type change
  const handleLoanTypeChange = (value: string) => {
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
      const currentAmount = pa.amount || amount;
      if (!currentAmount) {
        return false;
      }
      if (isNaN(Number(currentAmount))) {
        return false;
      }
      if (Number(currentAmount) < 50000 || Number(currentAmount) > 100000000) {
        return false;
      }
      if (Number(currentAmount) % 5 !== 0) {
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

  // Restore Step 1 in-memory form drafts if accidentally refreshed
  useEffect(() => {
    const savedDraft = getLocalStorage("step1DraftData");
    if (savedDraft) {
      if (savedDraft.amount) setAmount(savedDraft.amount);
      if (savedDraft.loanType) {
        setLoanType(savedDraft.loanType);
        const category = getLoanCategory(savedDraft.loanType);
        setLoanCategory(category);
      }
      if (savedDraft.tenure) setTenure(savedDraft.tenure);
      if (savedDraft.providers) setProviders(savedDraft.providers);
      if (savedDraft.providerAmounts) setProviderAmounts(savedDraft.providerAmounts);
      if (savedDraft.leadType) setLeadType(savedDraft.leadType);
      if (savedDraft.caseType) setCaseType(savedDraft.caseType);
      if (savedDraft.existingLoans) setExistingLoans(savedDraft.existingLoans);
    }

    // Restore Phase 2 transition state and typed Formik draft variables securely
    if (getLocalStorage("step1GetStarted")) {
      setGetStarted?.(true);
      const savedCustomer = getLocalStorage("step1CustomerDraft");
      if (savedCustomer) {
        setCustomerDraft(savedCustomer);
      }
    }
  }, []);

  // Auto-save active input values to draft storage live on editing
  useEffect(() => {
    if (amount || loanType || tenure || providers.length > 0 || leadType) {
      setLocalStorage("step1DraftData", {
        amount,
        loanType,
        tenure,
        providers,
        providerAmounts,
        leadType,
        caseType,
        existingLoans,
      });
    }
  }, [amount, loanType, tenure, providers, providerAmounts, leadType, caseType, existingLoans]);

  const registerCustomer = async (customer: any) => {
    const companyId = getCompanyId() || getLocalStorage("selectedCompanyId");
    const customerData = {
      ...customer,
      name: `${customer.title} ${customer.name}`.trim(),
      company_id: companyId,
    };

    const { data: res } = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_WEB_URL}/create-customer`,
      customerData,
    );

    if (res.status !== "Success") {
      throw new Error(`Registration failed: ${res.message}`);
    }
    return res.data.id;
  };

  // Function to create customer info
  async function createCustomerInfo(customerId: number, restValues: any) {
    const companyId = getCompanyId() || getLocalStorage("selectedCompanyId");
    // const headers = companyId ? { companyid: companyId } : {};
    await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_WEB_URL}/create-customer-info`,
      {
        customer_id: customerId,
        company_id: companyId,
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
    const companyId = getCompanyId() || getLocalStorage("selectedCompanyId");
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
          company_id: companyId,
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

  const setCustomerData = async (customerInfo: any) => {
    setGetStarted?.(false);
    setLocalStorage("customerInfo", customerInfo);
    // location.reload();
  };

  // Create new customer only (application creation moved to Step 7)
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
        const customerId = storedCustomerId || (await registerCustomer(customer));
        const customerInfoWithLeadType = {
          ...restValues,
          lead_type: leadType,
        };
        await createCustomerInfo(customerId, customerInfoWithLeadType);

        // Store application data in localStorage for Step 7
        const pendingApplicationData = {
          customerId,
          providers,
          providerAmounts,
          amount,
          tenure,
          loanTypes: [loanType], // Keep it as array to maintain compatibility with Step7Form
          loanCategory,
          leadType,
          existingLoans,
          caseType,
        };
        setLocalStorage("pendingApplicationData", pendingApplicationData);

        // Set a temporary state to allow progression in MultiStepForm
        setApplicationNumber?.("pending");

        !storedCustomerId
          ? await setCustomerData({
            id: customerId,
            name: customer.name,
            applicationNumbers: ["pending"],
          })
          : null;

        setLoading(false);
        console.log("Customer created and application data stored in localStorage");

        // Trigger the onSubmit from props to move to the next step
        onSubmit?.();
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
    [amount, tenure, providers, providerAmounts, loanType, loanCategory, leadType, existingLoans, caseType, onSubmit]
  );

  const commonFormControlStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "12px", // Beautiful capsule-rounded border shown in the reference photo
      color: "#0f172a",
      transition: "all 0.2s ease",
      alignItems: "center", // Ensures child elements share exact centerline alignment
      "& .MuiSelect-outlined": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "4px !important", // Tightly draws the selected value next to the start icon
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
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
      backgroundColor: "#ffffff", // Ensures the outline break behind the label text renders pristinely
      px: 0.5,
      "&.Mui-focused": {
        color: "#3949ab !important",
      },
    },
    "& .MuiInputAdornment-root": {
      color: "#3949ab !important", // Striking Royal Blue start icons matching the reference photo
      marginRight: "2px",
      display: "flex",
      alignItems: "center",
      "& *": { color: "#3949ab !important" },
    },
    "& .MuiSelect-icon": {
      color: "#64748b",
    },
  };

  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "12px", // Beautiful capsule-rounded border shown in the reference photo
      color: "#0f172a",
      transition: "all 0.2s ease",
      alignItems: "center", // Ensures child elements share exact centerline alignment
      "& .MuiInputBase-input": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "4px !important", // Tightly draws the input value next to the start icon
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
      color: "#3949ab !important", // Striking Royal Blue start icons matching the reference photo
      marginRight: "2px",
      display: "flex",
      alignItems: "center",
      "& *": { color: "#3949ab !important" },
    },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
        mt: 1,
        "& .MuiMenuItem-root": {
          color: "#1e293b",
          fontSize: "14px",
          fontWeight: 500,
          borderRadius: "6px",
          mx: 1,
          my: 0.5,
          "&:hover": {
            backgroundColor: "#f1f5f9",
          },
          "&.Mui-selected": {
            backgroundColor: "#eef2ff !important",
            color: "#3949ab",
            fontWeight: 600,
          },
        },
      },
    },
  };

  const PROVIDER_OPTIONS = providersLoading
    ? []
    : providersData?.data?.results?.map(provider => provider.title) || [];



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
            fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
            fontWeight: 700,
            color: "#0f172a",
            fontFamily: "'Inter', sans-serif",
            marginBottom: 3,
            textAlign: "center",
          }}
        >
          Initialize Loan Parameters
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
              variant="outlined"
              name="amount"
              label="Loan Amount Required*"
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
              sx={commonTextFieldStyles}
            />
          </Box>

          {/* Loan Type Field */}
          <Box>
            <FormControl fullWidth variant="outlined" error={!!errors.loanType} sx={commonFormControlStyles}>
              <InputLabel>Loan Type*</InputLabel>
              <Select
                name="loanType"
                value={loanType}
                onChange={(e) => handleLoanTypeChange(e.target.value as string)}
                onBlur={() => validateLoanType(loanType)}
                startAdornment={
                  <InputAdornment position="start">
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                renderValue={(selected) => {
                  const item = [...LOAN_TYPES_DATA.unsecured, ...LOAN_TYPES_DATA.secured].find((l) => l.value === selected);
                  return item ? item.label : selected;
                }}
                MenuProps={commonMenuProps}
              >
                <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#f8fafc", color: "#3949ab", opacity: "1 !important" }}>Unsecured Loans</MenuItem>
                {LOAN_TYPES_DATA.unsecured.map((loan) => (
                  <MenuItem key={loan.value} value={loan.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{loan.label}</span>
                    {loanType === loan.value && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                  </MenuItem>
                ))}
                <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#f8fafc", color: "#3949ab", mt: 1, opacity: "1 !important" }}>Secured Loans</MenuItem>
                {LOAN_TYPES_DATA.secured.map((loan) => (
                  <MenuItem key={loan.value} value={loan.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{loan.label}</span>
                    {loanType === loan.value && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                  </MenuItem>
                ))}
              </Select>
              {errors.loanType && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.loanType}</Typography>}
            </FormControl>
          </Box>

          {/* Tenure Field */}
          <Box>
            <FormControl fullWidth variant="outlined" error={!!errors.tenure} sx={commonFormControlStyles}>
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
                  <InputAdornment position="start">
                    <AccessTime />
                  </InputAdornment>
                }
                renderValue={(selected) => selected}
                MenuProps={commonMenuProps}
              >
                {(loanCategory ? tenureOptions[loanCategory] : []).map((label) => (
                  <MenuItem key={label} value={label} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{label}</span>
                    {tenure === label && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                  </MenuItem>
                ))}
              </Select>
              {errors.tenure && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.tenure || (loanCategory ? "" : "Please select a loan type first")}</Typography>}
            </FormControl>
          </Box>

          {/* Providers Field */}
          <Box>
            <FormControl fullWidth variant="outlined" error={!!errors.provider} sx={commonFormControlStyles}>
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
                  <InputAdornment position="start">
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
                          backgroundColor: '#eef2ff',
                          color: '#3949ab',
                          fontWeight: 600,
                          '& .MuiChip-deleteIcon': { color: '#3949ab' },
                        }}
                        onDelete={() => handleProviderRemove(value)}
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={commonMenuProps}
              >
                <MenuItem
                  value="Let F2 Fintech decide your lender"
                  sx={{
                    backgroundColor: "rgba(57, 73, 171, 0.04)",
                    borderBottom: "1px solid #f1f5f9",
                    "&:hover": { backgroundColor: "rgba(57, 73, 171, 0.08)" },
                    "&.Mui-selected": { backgroundColor: "rgba(57, 73, 171, 0.12) !important" },
                  }}
                >
                  <Checkbox
                    checked={providers.indexOf("Let F2 Fintech decide your lender") > -1}
                    sx={{ color: "#94a3b8", '&.Mui-checked': { color: "#3949ab" } }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#3949ab" }}>Let F2 Fintech decide your lender</Typography>
                </MenuItem>
                {PROVIDER_OPTIONS.map((providerName) => (
                  <MenuItem key={providerName} value={providerName} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px" }}>
                    <Checkbox checked={providers.indexOf(providerName) > -1} sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#3949ab' } }} />
                    <ListItemText primary={providerName} sx={{ color: '#1e293b' }} />
                  </MenuItem>
                ))}
              </Select>
              {errors.provider && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{errors.provider}</Typography>}
            </FormControl>
          </Box>

          {/* Lead Type Field */}
          <Box>
            <FormControl fullWidth variant="outlined" error={!!leadTypeError} sx={commonFormControlStyles}>
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
                  <InputAdornment position="start">
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                renderValue={(selected) => {
                  const item = leadTypes.find((l) => l.value === selected);
                  return item ? item.label : selected;
                }}
                MenuProps={commonMenuProps}
              >
                {leadTypes.map((lead) => (
                  <MenuItem key={lead.value} value={lead.value} sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{lead.label}</span>
                    {leadType === lead.value && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                  </MenuItem>
                ))}
              </Select>
              {leadTypeError && <Typography color="error" sx={{ mt: 0.5, ml: 1, fontSize: "11px", fontFamily: "Verdana, sans-serif" }}>{leadTypeError}</Typography>}
            </FormControl>
          </Box>

          {/* Case Type Field */}
          <Box>
            <FormControl fullWidth variant="outlined" error={!!caseTypeError} sx={commonFormControlStyles}>
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
                  <InputAdornment position="start">
                    <AccountBalanceIcon />
                  </InputAdornment>
                }
                renderValue={(selected) => (selected === "top_up" ? "Top Up" : selected === "fresh" ? "Fresh" : selected)}
                MenuProps={commonMenuProps}
              >
                <MenuItem value="top_up" sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Top Up</span>
                  {caseType === "top_up" && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                </MenuItem>
                <MenuItem value="fresh" sx={{ padding: "10px 16px", fontSize: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Fresh</span>
                  {caseType === "fresh" && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                </MenuItem>
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
              backgroundColor: "#eef2ff",
              borderRadius: "10px",
              border: "1px solid #c7d2fe",
            }}
          >
            <Typography
              sx={{
                color: "#3949ab",
                fontSize: "13px",
                fontWeight: 700,
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
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
                      p: 1.2,
                      backgroundColor: "#ffffff",
                      borderRadius: "6px",
                      border: "1px solid #e0e7ff",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#1e293b",
                        fontSize: "13px",
                        fontWeight: 500,
                        flex: 1,
                      }}
                    >
                      {providerName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{
                          color: "#3949ab",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        ₹{providerAmount || "Not set"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => openAmountDialog(providerName)}
                        sx={{
                          color: "#3949ab",
                          padding: "4px",
                          "&:hover": {
                            backgroundColor: "#eef2ff",
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
        <Box sx={{ width: { xs: "90%", sm: "95%", md: "90%" }, mb: 1, mt: 2 }}>
          <Typography
            sx={{
              color: "#3949ab",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 20 }} /> Existing Loans
          </Typography>

          {existingLoans.map((loan, index) => {
            const loanErr = existingLoansErrors[index] || {} as any;
            return (
              <Box
                key={index}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  p: 2.5,
                  mb: 3,
                  backgroundColor: "#f8fafc",
                  position: "relative",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  "&:hover": {
                    backgroundColor: "#ffffff",
                    borderColor: "#cbd5e1",
                    boxShadow: "0 4px 12px rgba(57, 73, 171, 0.08)",
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#3949ab",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      fontSize: "0.75rem",
                      backgroundColor: "#eef2ff",
                      border: "1px solid #e0e7ff",
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
                        color: "#ef4444",
                        backgroundColor: "#fef2f2",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#fee2e2",
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Stack spacing={3}>
                  <FormControl fullWidth variant="outlined" error={!!loanErr.has_running_loans} sx={commonFormControlStyles}>
                    <InputLabel>Existing Loans*</InputLabel>
                    <Select
                      value={loan.has_running_loans}
                      onChange={(e) => handleExistingLoanChange(index, "has_running_loans", e.target.value)}
                      renderValue={(selected) => (selected === "yes" ? "Yes" : selected === "no" ? "No" : selected)}
                      MenuProps={commonMenuProps}
                    >
                      <MenuItem value="yes" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Yes</span>
                        {loan.has_running_loans === "yes" && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                      </MenuItem>
                      <MenuItem value="no" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>No</span>
                        {loan.has_running_loans === "no" && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                      </MenuItem>
                    </Select>
                    {loanErr.has_running_loans && <FormHelperText error>{loanErr.has_running_loans}</FormHelperText>}
                  </FormControl>

                  {loan.has_running_loans === "yes" && (
                    <FormControl fullWidth variant="outlined" error={!!loanErr.which_loan} sx={commonFormControlStyles}>
                      <InputLabel>Loan Type*</InputLabel>
                      <Select
                        value={loan.which_loan}
                        onChange={(e) => handleExistingLoanChange(index, "which_loan", e.target.value)}
                        renderValue={(selected) => {
                          const item = [...LOAN_TYPES_DATA.unsecured, ...LOAN_TYPES_DATA.secured].find((l) => l.value === selected);
                          return item ? item.label : selected;
                        }}
                        MenuProps={commonMenuProps}
                      >
                        <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#f8fafc", color: "#3949ab", opacity: "1 !important" }}>Unsecured</MenuItem>
                        {LOAN_TYPES_DATA.unsecured.map((l) => (
                          <MenuItem key={l.value} value={l.value} sx={{ py: 1.2, px: 2, fontSize: '14px', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{l.label}</span>
                            {loan.which_loan === l.value && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                          </MenuItem>
                        ))}
                        <MenuItem disabled sx={{ fontWeight: "bold", backgroundColor: "#f8fafc", color: "#3949ab", mt: 1, opacity: "1 !important" }}>Secured</MenuItem>
                        {LOAN_TYPES_DATA.secured.map((l) => (
                          <MenuItem key={l.value} value={l.value} sx={{ py: 1.2, px: 2, fontSize: '14px', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{l.label}</span>
                            {loan.which_loan === l.value && <Check sx={{ fontSize: 18, color: "#3949ab", fontWeight: "bold" }} />}
                          </MenuItem>
                        ))}
                      </Select>
                      {loanErr.which_loan && <FormHelperText error>{loanErr.which_loan}</FormHelperText>}
                    </FormControl>
                  )}

                  {loan.has_running_loans === "yes" && (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Outstanding Amount*"
                        placeholder="0.00"
                        value={loan.loan_amount}
                        onChange={(e) => handleExistingLoanChange(index, "loan_amount", e.target.value)}
                        error={!!loanErr.loan_amount}
                        helperText={loanErr.loan_amount}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ color: "#64748b", fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={commonTextFieldStyles}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Running EMI (Optional)"
                        placeholder="0.00"
                        value={loan.running_emi}
                        onChange={(e) => handleExistingLoanChange(index, "running_emi", e.target.value)}
                        error={!!loanErr.running_emi}
                        helperText={loanErr.running_emi}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ color: "#64748b", fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={commonTextFieldStyles}
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            );
          })}

          {/* Conditionally reveal the add button ONLY if the active/last record explicitly specifies 'yes' to running loans */}
          {existingLoans[existingLoans.length - 1]?.has_running_loans === "yes" && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Edit sx={{ fontSize: 18 }} />}
                onClick={handleAddLoan}
                sx={{
                  borderRadius: "8px",
                  color: "#3949ab",
                  borderColor: "#3949ab",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  px: 3,
                  py: 1,
                  borderWidth: "1.5px",
                  "&:hover": {
                    borderColor: "#303f9f",
                    backgroundColor: "#eef2ff",
                    borderWidth: "1.5px",
                  }
                }}
              >
                Add Another Loan Record
              </Button>
            </Box>
          )}
        </Box>

        <Button
          disabled={
            !!errors.amount ||
            !!errors.tenure ||
            !!errors.provider ||
            !!errors.loanType ||
            !!leadTypeError ||
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
            setLocalStorage("step1GetStarted", true);
            setGetStarted(true);
          }}
          sx={{
            fontWeight: 600,
            fontSize: "0.95rem",
            fontFamily: "'Inter', sans-serif",
            lineHeight: "1.5rem",
            mt: 1.5, // Tightened margin pulling the button closer to the form controls
            backgroundColor: "#3949ab",
            color: "#ffffff",
            borderRadius: "8px",
            height: "46px",
            textTransform: "none",
            width: "100%",
            maxWidth: "600px",
            boxShadow: "0 4px 12px rgba(57, 73, 171, 0.25)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#303f9f",
              boxShadow: "0 6px 16px rgba(57, 73, 171, 0.35)",
            },
            "&:disabled": {
              backgroundColor: "#e2e8f0",
              color: "#64748b",
              boxShadow: "none",
            },
            marginBottom: 3,
          }}
        >
          Let's Get Started
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

  // Component to reactively track and auto-save active Formik values live on typing
  const FormikAutoSave: React.FC<{ values: any }> = ({ values }) => {
    useEffect(() => {
      if (values.title || values.name || values.contact || values.email || values.pan) {
        setLocalStorage("step1CustomerDraft", values);
      }
    }, [values]);
    return null;
  };

  // ... Rest of your form code remains exactly the same ...
  // Main form view for getting customer details
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "transparent",
        py: 0,
        px: 0,
        mt: 1
      }}
    >
      <Formik
        enableReinitialize
        initialValues={customerDraft}
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
            <FormikAutoSave values={values} />
            <Container
              maxWidth="md"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: "15px",
                padding: 0,
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                  mt: 0,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: {
                      xs: "1.2rem",
                      sm: "1.5rem",
                      md: "1.8rem",
                    },
                    color: "#333333",
                    fontWeight: 600,
                    marginBottom: 1,
                    textAlign: 'center',
                  }}
                >
                  Basic <span style={{ color: "#3949ab" }}>Details</span>
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#475569",
                    fontWeight: 500,
                  }}
                  variant="subtitle1"
                >
                  Step 1/4
                </Typography>
              </Box>

              {/* Form Fields Container */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: '100%',
                  gap: 2.5,
                  mt: 1,
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
                  {/* Title Dropdown */}
                  <FormControl
                    variant="outlined"
                    sx={{ ...commonFormControlStyles, minWidth: { xs: '100%', sm: 120 } }}
                    error={!!touched.title && !!errors.title}
                  >
                    <InputLabel shrink>Title*</InputLabel>
                    <Select
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Title*"
                      startAdornment={
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      }
                      renderValue={(selected) => selected || ""}
                      MenuProps={commonMenuProps}
                    >
                      {["Mr", "Mrs", "Miss", "Dr", "Ca"].map((t) => (
                        <MenuItem key={t} value={t} sx={{ display: "flex", justifyContent: "space-between" }}>
                          {t}
                          {values.title === t && <Check sx={{ color: "#3949ab", fontSize: 18 }} />}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.title && errors.title && (
                      <Typography
                        sx={{
                          color: "#ef4444",
                          marginLeft: 1,
                          margin: "4px 4px",
                          fontSize: "12px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {errors.title}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Name TextField */}
                  <TextField
                    autoComplete="off"
                    variant="outlined"
                    type="text"
                    name="name"
                    label="Name*"
                    InputLabelProps={{ shrink: true }}
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ ...commonTextFieldStyles, flex: 1 }}
                  />
                </Box>

                {/* Standard Form Fields */}
                {[
                  { name: 'contact', label: 'Contact*', type: 'number', icon: CallIcon },
                  { name: 'email', label: 'E-mail*', type: 'email', icon: EmailIcon },
                  { name: 'pan', label: 'PAN*', type: 'text', special: 'pan', icon: CreditCardIcon },
                  { name: 'father_name', label: 'Father\'s Name*', type: 'text', icon: PersonIcon },
                  { name: 'mother_name', label: 'Mother\'s Name*', type: 'text', icon: PersonIcon },
                  { name: 'working_address', label: 'Working Address*', type: 'text', icon: BusinessIcon },
                  { name: 'permanent_address', label: 'Permanent Address*', type: 'text', icon: HomeIcon },
                  { name: 'current_address', label: 'Current Address*', type: 'text', icon: LocationOnIcon },
                  { name: 'city', label: 'City*', type: 'text', icon: LocationOnIcon },
                ].map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <TextField
                      key={field.name}
                      autoComplete="off"
                      variant="outlined"
                      type={field.type}
                      name={field.name}
                      label={field.label}
                      InputLabelProps={{ shrink: true }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconComponent />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ ...commonTextFieldStyles, width: "100%", maxWidth: "600px" }}
                    />
                  );
                })}

                {/* State Dropdown with Search */}
                <FormControl
                  variant="outlined"
                  error={!!touched.state && !!errors.state}
                  sx={{ ...commonFormControlStyles, width: "100%", maxWidth: "600px" }}
                >
                  <InputLabel shrink>State*</InputLabel>
                  <Select
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="State*"
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    }
                    renderValue={(selected) => selected || ""}
                    MenuProps={commonMenuProps}
                  >
                    <Box sx={{ p: 1, position: "sticky", top: 0, bgcolor: "#ffffff", zIndex: 1, borderBottom: "1px solid #e2e8f0" }}>
                      <TextField
                        size="small"
                        autoFocus
                        placeholder="Type to search state..."
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 20, color: "#94a3b8 !important" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& .MuiInputBase-input": { py: 1, px: 1.5, fontSize: "14px", color: "#0f172a" }
                          }
                        }}
                      />
                    </Box>
                    {INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())).map((st) => (
                      <MenuItem key={st} value={st} sx={{ display: "flex", justifyContent: "space-between", py: 1.2 }}>
                        {st}
                        {values.state === st && <Check sx={{ color: "#3949ab", fontSize: 18 }} />}
                      </MenuItem>
                    ))}
                    {INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 && (
                      <MenuItem disabled sx={{ py: 1.5, justifyContent: "center", color: "#94a3b8" }}>
                        No states found
                      </MenuItem>
                    )}
                  </Select>

                  {touched.state && errors.state && (
                    <Typography
                      sx={{
                        color: "#ef4444",
                        marginLeft: 1,
                        margin: "4px 4px",
                        fontSize: "12px",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {errors.state}
                    </Typography>
                  )}
                </FormControl>

                {/* Employment Type Dropdown */}
                <FormControl
                  variant="outlined"
                  error={!!touched.employment_type && !!errors.employment_type}
                  sx={{ ...commonFormControlStyles, width: "100%", maxWidth: "600px" }}
                >
                  <InputLabel shrink>Employment Type*</InputLabel>
                  <Select
                    name="employment_type"
                    value={values.employment_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Employment Type*"
                    startAdornment={
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    }
                    renderValue={(selected) => selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : ""}
                    MenuProps={commonMenuProps}
                  >
                    {[
                      { value: "salaried", label: "Salaried" },
                      { value: "business", label: "Business" },
                      { value: "professional", label: "Professional" },
                      { value: "self_employed", label: "Self Employed" },
                    ].map((emp) => (
                      <MenuItem key={emp.value} value={emp.value} sx={{ display: "flex", justifyContent: "space-between" }}>
                        {emp.label}
                        {values.employment_type === emp.value && <Check sx={{ color: "#3949ab", fontSize: 18 }} />}
                      </MenuItem>
                    ))}
                  </Select>

                  <ErrorMessage
                    name="employment_type"
                    component="div"
                    style={{
                      color: "#ef4444",
                      margin: "4px 4px",
                      fontSize: "12px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </FormControl>

                {/* Date of Birth */}
                <Box sx={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD MM YYYY"
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
                          variant="outlined"
                          label="Select Date Of Birth*"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTime />
                              </InputAdornment>
                            ),
                          }}
                          sx={commonTextFieldStyles}
                        />
                      )}
                      PopperProps={{
                        sx: {
                          "& .MuiPaper-root": {
                            backgroundColor: "#ffffff",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            color: "#0f172a",
                          },
                          "& .MuiPickersDay-root": {
                            color: "#0f172a",
                            "&:hover": {
                              backgroundColor: "#f1f5f9",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "#3949ab",
                              color: "#ffffff",
                              "&:hover": {
                                backgroundColor: "#303f9f",
                              },
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
                      color: "#ef4444",
                      margin: "4px 4px",
                      fontSize: "12px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#64748b",
                      mt: 0.5,
                      mx: 0.5,
                    }}
                  >
                    Minimum age 20 required
                  </Typography>
                </Box>

                {/* Terms Checkboxes */}
                <Box sx={{ width: "100%", maxWidth: "600px", mt: 1 }}>
                  <FormGroup sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          sx={{
                            color: "#94a3b8",
                            "&.Mui-checked": {
                              color: "#3949ab",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "#334155",
                            lineHeight: 1.5,
                            fontFamily: "'Inter', sans-serif",
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

                  <FormGroup sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          sx={{
                            color: "#94a3b8",
                            "&.Mui-checked": {
                              color: "#3949ab",
                            },
                            alignSelf: "flex-start",
                            mt: 0.25,
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: "#334155",
                              lineHeight: 1.5,
                              fontFamily: "'Inter', sans-serif",
                              mb: 1.5,
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
                            gap: 2.5,
                            flexWrap: "wrap",
                          }}>
                            <SmsIcon sx={{ color: "#3949ab", fontSize: 24 }} />
                            <CallIcon sx={{ color: "#3949ab", fontSize: 24 }} />
                            <WhatsAppIcon sx={{ color: "#25D366", fontSize: 24 }} />
                            <EmailIcon sx={{ color: "#3949ab", fontSize: 24 }} />
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
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "15px",
                    width: "100%",
                    maxWidth: "600px",
                    height: "46px",
                    mt: 1,
                    mb: 2,
                    backgroundColor: "#3949ab",
                    boxShadow: "0px 8px 20px rgba(57, 73, 171, 0.35)",
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "none",
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
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                  ) : (
                    "Proceed To Next Step"
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
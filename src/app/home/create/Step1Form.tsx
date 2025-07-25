/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import axios from "axios";
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
} from "@mui/material";
import { CurrencyRupee as CurrencyRupeeIcon } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import SmsIcon from "@mui/icons-material/Sms";
import EmailIcon from "@mui/icons-material/Email";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// import API from "../../apis";

import step1ValidationSchema from "./step1ValidationSchema";
import { Utility } from "@/utils";
import Toast from "@/app/components/common/Toast";

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
  setApplicationNumber?: ( num: number | string | null ) => void;
  getStarted?: boolean;
  setGetStarted?: ( value: boolean ) => void;
  salary?: any;
}

const Step1Form: React.FC<Step1FormProps> = ( {
  applicationNumber,
  setApplicationNumber,
  getStarted,
  setGetStarted,
  salary,
} ) => {
  const [ amount, setAmount ] = useState<string>( "" );
  const [ tenure, setTenure ] = useState<string>( "" );
  const [ loanType, setLoanType ] = useState( "" );
  const [ provider, setProvider ] = useState<string>( "" );
  const [ loading, setLoading ] = useState<boolean>( false );
  const [ errors, setErrors ] = useState<{ amount: string; tenure: string; provider: string }>( {
    amount: "",
    tenure: "",
    provider: "",
    loanType: "",
  } );
  const [ loanStatus, setLoanStatus ] = useState<string | null>( null );
  const toastInfo = useSelector( ( state: any ) => state.toast );
  const dispatch = useDispatch();

  const { decodedToken, getLocalStorage, remLocalStorage, setLocalStorage, toastAndNavigate
  } = Utility();
  const storedCustomerId = getLocalStorage( "customerInfo" )?.id;

  // Generate random application number
  const randomNumberGenerator = (): number =>
    Math.floor( 10000000 + Math.random() * 90000000 );

  const randomFourDigitNumber = Math.floor( 1000 + Math.random() * 9000 ); // Generate random 4-digit number

  // Get the current date and calculate 20 years ago
  const minDate = dayjs( "1900-01-01" );
  const maxDate = dayjs().subtract( 20, "year" );

  // Validation function for the amount
  const validateAmount = ( value: string ): void => {
    let error = "";
    if ( !value )
    {
      error = "This Field is required";
    } else if ( isNaN( Number( value ) ) )
    {
      error = "Amount must be a number";
    } else if ( Number( value ) < 50000 || Number( value ) > 100000000 )
    {
      error = "Amount must be within 50 thousand and 10 crore";
    } else if ( Number( value ) % 5 !== 0 )
    {
      error = "Amount must be divisible by 5";
    }
    setErrors( ( prev ) => ( { ...prev, amount: error } ) );
  };

  // Validation function for the tenure
  const validateTenure = ( value: string ): void => {
    let error = "";
    if ( !value )
    {
      error = "This Field is required";
    }
    setErrors( ( prev ) => ( { ...prev, tenure: error } ) );
  };

  const validateProvider = ( value: string ): void => {
    let error = "";
    if ( !value )
    {
      error = "This Field is required";
    }
    setErrors( ( prev ) => ( { ...prev, tenure: error } ) );
  };

  // Fetch application number and loan status using stored customer ID
  useEffect( () => {
    const fetchCustomerData = async () => {
      if ( storedCustomerId )
      {
        try
        {
          const { data: response } = await axios.get(
            `${ process.env.NEXT_PUBLIC_WEB_URL }/get-application-by-id/${ storedCustomerId }` );
          if ( response.status === "Success" )
          {
            setApplicationNumber( response.data.application_no );
            const { data: resp } = await axios.get(
              `${ process.env.NEXT_PUBLIC_WEB_URL }/get-loan-tracking-by-id/${ response.data.id }` );
            if ( resp.status === "Success" )
            {
              setLoanStatus( resp.data.status );
            }
          }
        } catch ( err )
        {
          console.log( "Error fetching customer data:", err );
        }
      }
    };
    fetchCustomerData();
  }, [ storedCustomerId ] );



  // Function to register the customer
  async function registerCustomer ( customer ) {
    // Combine title and name before sending
    const customerData = {
      ...customer,
      name: `${ customer.title } ${ customer.name }`.trim() // Combine title and name
    };

    const { data: res } = await axios.post(
      `${ process.env.NEXT_PUBLIC_WEB_URL }/create-customer`,
      customerData
    );

    if ( res.status !== "Success" )
    {
      throw new Error( `Registration failed: ${ res.message }` );
    }
    return res.data.id;
  }

  // Function to create customer info
  async function createCustomerInfo ( customerId, restValues ) {
    await axios.post(
      `${ process.env.NEXT_PUBLIC_WEB_URL }/create-customer-info`,
      {
        customer_id: customerId,
        ...restValues,
      } )
  }

  // Function to create the customer application
  async function createCustomerApplication (
    customerId,
    applicationNumber,
    amount,
    tenure,
    provider,
    loanType,
  ) {
    const { data: applicationResponse } =
      await axios.post(
        `${ process.env.NEXT_PUBLIC_WEB_URL }/create-application`,
        {
          customer_id: customerId,
          applied_by: decodedToken()?.id,
          application_no: applicationNumber,
          amount,
          tenure,
          provider,
          loan_type: loanType,
        } )
    return applicationResponse.data.applicationId;
  }

  // Function to create loan tracking
  async function createLoanTracking ( applicationId ) {
    await axios.post(
      `${ process.env.NEXT_PUBLIC_WEB_URL }/create-loan-tracking`,
      {
        customer_application_id: applicationId,
        status: "submitted",
      } )
  }

  const setCustomerData = async ( customerInfo ) => {
    setGetStarted( false );
    setLocalStorage( "customerInfo", customerInfo );
    location.reload();
  }

  // Create new customer with loan application
  const create = useCallback(
    async ( values: typeof initialValues ) => {
      setLoading( true );
      const applicationNumberGenerated = randomNumberGenerator();
      const { contact, email, name, status, dob, ...restValues } = values;
      const customer = {
        contact,
        dob,
        email,
        title: values.title,
        name: values.name,
        password: `${ name.replace( /\s/g, "" ) }@${ randomFourDigitNumber }`,
        status,
      };
      try
      {
        const customerId =
          storedCustomerId || ( await registerCustomer( customer ) );
        await createCustomerInfo( customerId, restValues );
        const applicationId = await createCustomerApplication(
          customerId,
          applicationNumberGenerated,
          amount,
          tenure,
          provider,
          loanType,
        );
        await createLoanTracking( applicationId );
        !storedCustomerId
          ? await setCustomerData( {
            id: customerId,
            name: customer.name
          } )
          : location.reload();
        setLoading( false );
        console.log(
          "Customer info, application, and loan tracking created successfully"
        );
      } catch ( err )
      {
        toastAndNavigate( dispatch, true, "error", err?.response?.data?.msg || "Error Occurred. Please Try Again" );
        setLoading( false );
        console.log(
          "Error during customer creation:",
          err?.response?.data?.msg
        );
      } finally
      {
        setLoading( false );
      }
    },
    [ amount, tenure, provider, loanType ]
  );

  const PROVIDER_OPTIONS = [
    "Bajaj Finance",
    "Bajaj Market",
    "Chola",
    "LNT",
    "Tata",
    "ABFL",
    "Godrej",
    "IDFC",
    "HDFC Bank",
    "ICICI Bank",
    "Indusind Bank",
    "Lending Cart",
    "Incred",
    "Credit Saison",
    "PaySense",
    "Shriram"
  ];

  const LOAN_TYPES = [ "Term Loan", "Personal Loan", "Business Loan", "Professional Loan", "Home Loan", "Education Loan", "LAP", "Machinery Loan", "Auto Loan" ];

  // If application number and loan status exists, display success message without making user to fill the form again
  if ( applicationNumber )
  {
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
          Your application is submitted!
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: "#333",
            marginBottom: 2,
          }}
        >
          Your Application Number is <strong>{applicationNumber}</strong>.
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: "#333",
            marginBottom: 2,
          }}
        >
        </Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            color: "#333",
            marginBottom: 2,
            textAlign: "center",
          }}
        >
          We will contact you within the next half an hour.
          {!salary &&
            `To speed up the
          process, please complete the next steps.`}
        </Typography>
        {salary ?
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
            onClick={() => {
              remLocalStorage( "customerInfo" );
              location.reload();
            }}
          >
            Fill Another Application
          </Button>
          : null}
      </Box>
    );
  }

  // Initial form view with amount and tenure selection
  if ( !getStarted )
  {
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
            color: "#FFD700",
            fontFamily: "DM sans",
            marginBottom: 2,
          }}
        >
          Get the loan best suited for your wish
        </Typography>

        <FormControl
          autoComplete="off"
          variant="filled"
          error={!!errors.provider}
          sx={{
            width: {
              xs: "80%",
              md: "45%",
              sm: "45%",
            },
            fontSize: "13px",
            marginBottom: 3,
          }}
        >
          <InputLabel sx={{ color: "#bdbdbd" }}>Provider Name*</InputLabel>
          <Select
            variant="filled"
            name="provider"
            value={provider}
            onChange={( e ) => {
              setProvider( e.target.value );
              validateProvider( e.target.value );
            }}
            onBlur={() => validateProvider( provider )}
            sx={{
              "& .MuiFilledInput-root": {
                borderRadius: "10px",
                border: "1px solid transparent",
                transition: "border-color 0.3s, border-width 0.3s",
                "&:hover": {
                  borderColor: "#0000ff",
                },
                "&.Mui-focused": {
                  borderColor: "#0000ff",
                  borderWidth: "2px",
                },
              },
              "& .MuiSelect-icon": {
                color: "white",
              },
              color: "white",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#121212",
                  "& .MuiMenuItem-root": {
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                },
              },
            }}
            startAdornment={
              <InputAdornment position="start" sx={{ color: "white !important" }}>
                <AccountBalanceIcon />
              </InputAdornment>
            }
          >
            {PROVIDER_OPTIONS.map( ( provider ) => (
              <MenuItem
                key={provider}
                value={provider}
                sx={{
                  padding: "8px 16px",
                  "&:first-of-type": {  // Specific fix for first item
                    marginTop: 0,
                  },
                }}
              >
                {provider}
              </MenuItem>
            ) )}
          </Select>
          {errors.provider && (
            <Typography
              color="error"
              sx={{
                marginLeft: 1,
                margin: "3px 14px",
                fontSize: "10.2857px",
                fontFamily: "Verdana, sans-serif",
                fontWeight: "400",
              }}
            >
              {errors.provider}
            </Typography>
          )}
        </FormControl>

        <FormControl
          autoComplete="off"
          variant="filled"
          error={!!errors.loanType}
          sx={{
            width: {
              xs: "80%",
              md: "45%",
              sm: "45%",
            },
            fontSize: "13px",
            marginBottom: 3,
          }}
        >
          <InputLabel sx={{ color: "#bdbdbd" }}>Loan Type*</InputLabel>
          <Select
            variant="filled"
            name="loanType"
            value={loanType}
            onChange={( e ) => {
              setLoanType( e.target.value );
              validateLoanType( e.target.value );
            }}
            onBlur={() => validateLoanType( loanType )}
            sx={{
              "& .MuiFilledInput-root": {
                borderRadius: "10px",
                border: "1px solid transparent",
                transition: "border-color 0.3s, border-width 0.3s",
                "&:hover": {
                  borderColor: "#0000ff",
                },
                "&.Mui-focused": {
                  borderColor: "#0000ff",
                  borderWidth: "2px",
                },
              },
              "& .MuiSelect-icon": {
                color: "white",
              },
              color: "white",
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#121212",
                  "& .MuiMenuItem-root": {
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                },
              },
            }}
            startAdornment={
              <InputAdornment position="start" sx={{ color: "white !important" }}>
                <AccountBalanceIcon />
              </InputAdornment>
            }
          >
            {LOAN_TYPES.map( ( type ) => (
              <MenuItem
                key={type}
                value={type?.toLowerCase()}
                sx={{
                  padding: "8px 16px",
                  "&:first-of-type": {
                    marginTop: 0,
                  },
                }}
              >
                {type}
              </MenuItem>
            ) )}
          </Select>
          {errors.loanType && (
            <Typography
              color="error"
              sx={{
                marginLeft: 1,
                margin: "3px 14px",
                fontSize: "10.2857px",
                fontFamily: "Verdana, sans-serif",
                fontWeight: "400",
              }}
            >
              {errors.loanType}
            </Typography>
          )}
        </FormControl>
        <Box
          sx={{
            // width: "45%",
            width: {
              xs: "80%",
              md: "45%",
              sm: "45%",
            },
            marginBottom: 3,
          }}
        >
          <TextField
            autoComplete="off"
            fullWidth
            variant="filled"
            name="amount"
            label="Enter Amount*"
            placeholder="How Much Loan Do You Require?"
            value={amount}
            onChange={( e ) => {
              setAmount( e.target.value );
              validateAmount( e.target.value );
            }}
            onBlur={() => validateAmount( amount )}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon />
                </InputAdornment>
              ),
              style: {
                color: "white", // This sets the text color to white
              },
            }}
            sx={{
              fontSize: "13px",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: 1,
              "& .MuiInputBase-root": {
                backgroundColor: "transparent !important", // Makes the input background transparent
              },
              "& .MuiFormLabel-root": {
                color: "#9e9e9e", // Label color
              },
              "& .MuiFormLabel-focus": {
                color: "#ffffff", // Label color
              },
              "& .MuiFilledInput-underline:before": {
                borderBottomColor: "rgba(255, 255, 255, 0.5)", // Underline color
              },
              "& .MuiFilledInput-underline:hover:before": {
                borderBottomColor: "#ffffff", // Underline color on hover
              },
              "& .MuiFilledInput-underline:after": {
                borderBottomColor: "#039be5", // Underline color when focused
              },
              "& .MuiFormLabel-root.Mui-focused": {
                color: "#e0e0e0 !important", // Ensure label color stays white when focused
                fontSize: "1rem",
              },
            }}
          />
        </Box>
        <FormControl
          autoComplete="off"
          variant="filled"
          error={!!errors.tenure}
          sx={{
            width: {
              xs: "80%",
              md: "45%",
              sm: "45%",
            },
            fontSize: "13px",
            marginBottom: 3,
          }}
        >
          <InputLabel style={{ color: "#bdbdbd" }}>
            Select A Comfortable Tenure
          </InputLabel>
          <Select
            variant="filled"
            name="tenure"
            value={tenure}
            onChange={( e ) => {
              setTenure( e.target.value );
              validateTenure( e.target.value );
            }}
            onBlur={() => validateTenure( tenure )}
            sx={{
              "& .MuiFilledInput-root": {
                borderRadius: "10px",
                border: "1px solid transparent",
                transition: "border-color 0.3s, border-width 0.3s",
                "&:hover": {
                  borderColor: "#0000ff",
                },
                "&.Mui-focused": {
                  borderColor: "#0000ff",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputAdornment-root": {
                color: "#ffffff",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ffffff",
              },

            }}
          >
            {[ "3 Years", "5 Years", "8 Years" ].map( ( label ) => (
              <MenuItem
                key={label}
                value={label}
                sx={{
                  backgroundColor: "white", // Default background color
                  color: "black", // Default text color
                  "&:hover": {
                    backgroundColor: "#757575", // Slightly lighter black on hover
                  },
                  "&.Mui-selected": {
                    backgroundColor: "black", // Background color when selected
                    color: "white", // Text color when selected
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#757575", // Slightly lighter black on hover when selected
                  },
                }}
              >
                {label}
              </MenuItem>
            ) )}
          </Select>

          {errors.tenure && (
            <Typography
              color="error"
              sx={{
                marginLeft: 1,
                margin: "3px 14px",
                fontSize: "10.2857px",
                fontFamily: "Verdana, sans-serif",
                fontWeight: "400",
              }}
            >
              {errors.tenure}
            </Typography>
          )}
        </FormControl>

        <Button
          // color="primary"
          disabled={
            !!errors.amount ||
            !!errors.tenure ||
            !amount ||
            !tenure ||
            !provider
          }
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            setGetStarted( true ); // This sets getStarted to true
          }}
          sx={{
            fontWeight: "500",
            fontSize: "1rem",
            fontFamily: "Poppins",
            lineHeight: "1.5rem",
            mt: 2,
            backgroundColor: "#039be5",
            // width: "45%",
            width: {
              xs: "80%",
              md: "45%",
              sm: "45%",
            },
            alignSelf: "center",
            marginBottom: 3,
          }}
        >
          LET&apos;S GET STARTED
        </Button>
      </Box>
    );
  }
  // Main form view for getting customer details
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={step1ValidationSchema}
        onSubmit={( values ) => create( values )}
      >
        {( {
          dirty,
          errors,
          touched,
          values,
          setFieldValue,
          setFieldTouched,
          handleChange,
          handleBlur,
          handleSubmit,
        } ) => (
          <Form onSubmit={handleSubmit}>
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: "15px",
                padding: "2rem"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                  Basic <span style={{ color: "#ffd700" }}>Details</span>
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "2vh",
                    color: "white",
                    marginBottom: 3,
                  }}
                >
                  Step 1/4
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "15px 15px",
                  gap: 2,
                  color: "red"

                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    marginBottom: 3,
                  }}
                >
                  {/* Title Dropdown */}
                  <FormControl
                    variant="filled"
                    sx={{
                      minWidth: 80,
                      marginRight: 1,
                      "& .MuiInputBase-input": {
                        color: "white",
                      },
                    }}
                    error={!!touched.title && !!errors.title}
                  >
                    <InputLabel sx={{ color: "#9e9e9e" }}>Title*</InputLabel>
                    <Select
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: "black",
                            color: "white",
                          },
                        },
                      }}
                      sx={{
                        color: "white",
                        "& .MuiSelect-icon": {
                          color: "white",
                        },
                      }}
                    >
                      <MenuItem value="Mr">Mr</MenuItem>
                      <MenuItem value="Mrs">Mrs</MenuItem>
                      <MenuItem value="Ms">Miss</MenuItem>
                      <MenuItem value="Dr">Dr</MenuItem>
                      <MenuItem value="Ca">Ca</MenuItem>
                    </Select>
                    {touched.title && errors.title && (
                      <Typography
                        color="error"
                        sx={{
                          marginLeft: 1,
                          margin: "3px 14px",
                          fontSize: "10.2857px",
                          fontFamily: "Verdana, sans-serif",
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
                    InputLabelProps={{
                      style: { color: "#9e9e9e" },
                    }}
                    sx={{
                      flex: 1,
                      height: "50px",
                      fontSize: "16px",
                      "& .MuiInputBase-input": {
                        color: "white",
                      },
                    }}
                  />
                </Box>

                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="number"
                  name="contact"
                  label="Contact*"
                  value={values.contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.contact && !!errors.contact}
                  helperText={touched.contact && errors.contact}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="email"
                  name="email"
                  label="E-mail*"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  name="pan"
                  label="PAN*"
                  value={values.pan}
                  onBlur={handleBlur}
                  onChange={( event ) => {
                    const uppercaseValue = event.target.value.toUpperCase();
                    setFieldValue( "pan", uppercaseValue ); // Update the Formik field value in uppercase
                  }}
                  error={touched.pan && Boolean( errors.pan )}
                  helperText={touched.pan && errors.pan}
                  inputProps={{
                    maxLength: 10,
                    style: { textTransform: "uppercase" }, // Applies uppercase stylin
                  }}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: "75%",
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="text"
                  name="father_name"
                  label="Father's Name*"
                  value={values.father_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.father_name && !!errors.father_name}
                  helperText={touched.father_name && errors.father_name}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="text"
                  name="mother_name"
                  label="Mother's Name*"
                  value={values.mother_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.mother_name && !!errors.mother_name}
                  helperText={touched.mother_name && errors.mother_name}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="text"
                  name="working_address"
                  label="Working Address*"
                  value={values.working_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.working_address && !!errors.working_address}
                  helperText={touched.working_address && errors.working_address}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="text"
                  name="permanent_address"
                  label="Permanent Address*"
                  value={values.permanent_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    !!touched.permanent_address && !!errors.permanent_address
                  }
                  helperText={
                    touched.permanent_address && errors.permanent_address
                  }
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  type="text"
                  name="current_address"
                  label="Current Address*"
                  value={values.current_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.current_address && !!errors.current_address}
                  helperText={touched.current_address && errors.current_address}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />
                <TextField
                  autoComplete="off"
                  variant="filled"
                  name="city"
                  label="City*"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city && Boolean( errors.city )}
                  helperText={touched.city && errors.city}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                />

                <TextField
                  autoComplete="off"
                  variant="filled"
                  name="state"
                  label="State*"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.state && Boolean( errors.state )}
                  helperText={touched.state && errors.state}
                  InputLabelProps={{
                    style: { color: "#9e9e9e" },
                  }}
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                  }}
                />
                <FormControl
                  autoComplete="off"
                  variant="filled"
                  error={!!touched.employment_type && !!errors.employment_type}
                  sx={{
                    width: "75%",
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                    "& .MuiInputBase-input": {
                      color: "white", // This sets the text color inside the input field to white
                    },
                  }}
                >
                  <InputLabel sx={{ color: "white" }}>
                    Employment Type*
                  </InputLabel>
                  <Select
                    variant="filled"
                    name="employment_type"
                    value={values.employment_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "black",
                          color: "white", // Optional: Set text color to white for better contrast
                        },
                      },
                    }}
                  >
                    <MenuItem value="salaried">Salaried </MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                    <MenuItem value="professional">Professional</MenuItem>
                  </Select>

                  <ErrorMessage
                    name="employment_type"
                    component="div"
                    style={{
                      color: "#d32f2f",
                      margin: "5px 14px",
                      fontSize: "10.2857px",
                      fontFamily: "Verdana, sans-serif",
                      fontWeight: "400",
                    }}
                  />
                </FormControl>
                <Box
                  sx={{
                    width: {
                      xs: "80%",
                      md: "75%",
                      sm: "75%",
                    },
                    marginBottom: 3,
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD MMMM YYYY"
                      views={[ "year", "month", "day" ]}
                      label="Select Date Of Birth*"
                      name="dob"
                      minDate={minDate} // Start at 1900
                      maxDate={maxDate} // End at 20 years before today
                      error={touched.dob && !!errors.dob}
                      helperText={touched.dob && errors.dob}
                      value={values.dob}
                      onBlur={() => setFieldTouched( "dob", true )}
                      onChange={( newValue ) => setFieldValue( "dob", newValue )}
                      renderInput={( params ) => (
                        <TextField {...params} fullWidth margin="normal" />
                      )}
                      PopperProps={{
                        sx: {
                          backgroundColor: "lightblue", // Change background color
                          color: "black", // Adjust text color for readability
                        },
                      }}
                    />

                    <ErrorMessage
                      name="dob"
                      component="div"
                      style={{
                        color: "#d32f2f",
                        margin: "5px 14px",
                        fontSize: "10.2857px",
                        fontFamily: "Poppins",
                        fontWeight: "400",
                      }}
                    />
                  </LocalizationProvider>
                  <Typography
                    sx={{
                      fontSize: "0.600rem",
                      color: "white",
                      ml: "16px",
                      mt: "3px",
                    }}
                  >
                    Minimum age 20 required
                  </Typography>
                </Box>
                {/* Terms Checkbox */}
                <FormGroup
                  sx={{ display: "flex", ml: 5, mr: 8, marginBottom: 3 }}
                >
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label={
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.75rem", // Mobile
                            sm: "0.875rem", // Tablet
                            md: "1rem", // Desktop
                          },
                          color: "white",
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
                <FormGroup sx={{ display: "flex", ml: 5, mr: 8, mb: 3 }}>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label={
                      <Typography sx={{ fontSize: "0.800rem", color: "white" }}>
                        I further consent to receive the loan and product
                        updates of F2fintech on WhatsApp and allow F2fintech
                        and/or their authorized third party service providers to
                        contact me for marketing purposes via
                        <br />
                        <br />
                        <Box sx={{ width: "10vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}><SmsIcon /> <CallIcon /> <WhatsAppIcon />
                          <EmailIcon /></Box>
                      </Typography>
                    }
                  />
                </FormGroup>
                <Button
                  disabled={!dirty || loading}
                  type="submit"
                  sx={{
                    color: "#ffffff",
                    fontWeight: "500",
                    borderRadius: "20px",
                    fontSize: {
                      xs: "0.875rem", // Mobile
                      sm: "1rem", // Tablet
                      md: "1rem", // Desktop
                    },
                    lineHeight: "1.5rem",
                    width: {
                      xs: "50%", // Mobile
                      sm: "30%", // Tablet
                      md: "11vw", // Desktop
                    },
                    padding: {
                      xs: "8px 16px", // Mobile
                      sm: "10px 20px", // Tablet
                      md: "8px 16px", // Desktop
                    },
                    mt: 2,
                    backgroundColor: "#039be5",
                    marginBottom: 3,
                    "&:hover": {
                      color: "#ffffff",
                      backgroundColor: "#0277bd",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "black" }} />
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
    </>
  );
};

export default Step1Form;

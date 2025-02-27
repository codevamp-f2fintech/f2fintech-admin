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
  pan: "",
  occupation_type: "",
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
  const [ provider, setProvider ] = useState<string>( "" );
  const [ loading, setLoading ] = useState<boolean>( false );
  const [ errors, setErrors ] = useState<{ amount: string; tenure: string; provider: string }>( {
    amount: "",
    tenure: "",
    provider: "",
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
    const { data: res } = await axios.post(
      `${ process.env.NEXT_PUBLIC_WEB_URL }/create-customer`,
      customer
    )
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
    provider
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
          provider
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

  // Function to log in the customer
  async function loginCustomer ( contact, name ) {
    const response = await axios.post(
      `${ process.env.NEXT_PUBLIC_WEB_URL }/login`,
      {
        contact,
        password: `${ name.replace( /\s/g, "" ) }@${ randomFourDigitNumber }`,
      } )

    if ( response.data.status === "Success" )
    {
      const customerInfo = {
        id: response.data.data.id,
        name: response.data.data.name,
        token: response.data.data.token,
      };
      setLocalStorage( "customerInfo", customerInfo );
      location.reload();
    }
  }

  // Create new customer with loan application
  const create = useCallback(
    async ( values: typeof initialValues ) => {
      const applicationNumberGenerated = randomNumberGenerator();
      const { contact, email, name, status, dob, ...restValues } = values;
      const customer = {
        contact,
        dob,
        email,
        name,
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
          provider
        );
        await createLoanTracking( applicationId );
        !storedCustomerId
          ? await loginCustomer( contact, name )
          : location.reload();

        console.log(
          "Customer info, application, and loan tracking created successfully"
        );
      } catch ( err )
      {
        toastAndNavigate( dispatch, true, "error", err?.response?.data?.msg );
        console.log(
          "Error during customer creation:",
          err?.response?.data?.msg
        );
      } finally
      {
        setLoading( false );
      }
    },
    [ amount, tenure, provider ]
  );

  // If application number and loan status exists, display success message without making user to fill the form again
  if (
    applicationNumber &&
    !( loanStatus === "disbursed" || loanStatus === "rejected" )
  )
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
            name="provider"
            label="Provider Name*"
            placeholder="Any Loan Provider preference?"
            value={provider}
            onChange={( e ) => {
              setProvider( e.target.value );
              validateProvider( e.target.value );
            }}
            onBlur={() => validateProvider( provider )}
            error={!!errors.provider}
            helperText={errors.provider}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceIcon />
                </InputAdornment>
              ),
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
                color: "#ffffff", // Label color
              },
              "& .MuiFilledInput-underline:before": {
                borderBottomColor: "rgba(255, 255, 255, 0.5)", // Underline color
              },
              "& .MuiFilledInput-underline:hover:before": {
                borderBottomColor: "#ffffff", // Underline color on hover
              },
              "& .MuiFilledInput-underline:after": {
                borderBottomColor: "#FFD700", // Underline color when focused
              },
            }}
          />
        </Box>
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
                color: "#ffffff", // Label color
              },
              "& .MuiFilledInput-underline:before": {
                borderBottomColor: "rgba(255, 255, 255, 0.5)", // Underline color
              },
              "& .MuiFilledInput-underline:hover:before": {
                borderBottomColor: "#ffffff", // Underline color on hover
              },
              "& .MuiFilledInput-underline:after": {
                borderBottomColor: "#FFD700", // Underline color when focused
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
          <InputLabel style={{ color: "#7F9E8A" }}>
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
                color: "black",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "black",
              },
            }}
          >
            {[ "3 Years", "5 Years", "8 Years" ].map( ( label ) => (
              <MenuItem
                key={label}
                value={label}
                sx={{
                  backgroundColor: "black", // Default background color
                  color: "white", // Default text color
                  "&:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover
                  },
                  "&.Mui-selected": {
                    backgroundColor: "black", // Background color when selected
                    color: "white", // Text color when selected
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#333333", // Slightly lighter black on hover when selected
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
            backgroundColor: "#FFD700",
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
                }}
              >
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
                    style: { color: "white" },
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
                  }}
                />

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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                    style: { color: "white" },
                  }}
                  sx={{
                    width: "75%",
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                    style: { color: "white" },
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
                  }}
                />
                <FormControl
                  autoComplete="off"
                  variant="filled"
                  error={!!touched.occupation_type && !!errors.occupation_type}
                  sx={{
                    width: "75%",
                    height: "50px",
                    fontSize: "16px",
                    marginBottom: 3,
                  }}
                >
                  <InputLabel sx={{ color: "white" }}>
                    Occupation Type*
                  </InputLabel>
                  <Select
                    variant="filled"
                    name="occupation_type"
                    value={values.occupation_type}
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
                    name="occupation_type"
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
                        <SmsIcon /> <CallIcon /> <WhatsAppIcon />
                        <EmailIcon />
                      </Typography>
                    }
                  />
                </FormGroup>
                <Button
                  disabled={!dirty || loading}
                  type="submit"
                  sx={{
                    color: "black",
                    fontWeight: "500",
                    borderRadius: "20px",
                    fontSize: {
                      xs: "0.875rem", // Mobile
                      sm: "1rem", // Tablet
                      md: "1.125rem", // Desktop
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
                    backgroundColor: "#FFD700",
                    marginBottom: 3,
                    "&:hover": {
                      color: "#ffffff",
                      backgroundColor: "#FFD700",
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
};

export default Step1Form;

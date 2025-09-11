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
  const [ providers, setProviders ] = useState<string[]>( [] );

  const validateProviders = ( values: string[] ): void => {
    let error = "";
    if ( !values || values.length === 0 )
    {
      error = "Please select at least one provider";
    }
    setErrors( ( prev ) => ( { ...prev, provider: error } ) );
  };

  // Fetch loan providers
  const { value: providersData, swrLoading: providersLoading } =
    useGetLoanProviders( null, "get-all-loan-providers", 1, 100 );

  const { decodedToken, getLocalStorage, remLocalStorage, setLocalStorage, toastAndNavigate
  } = Utility();
  const storedCustomerId = getLocalStorage( "customerInfo" )?.id;

  // Generate random application number
  const randomNumberGenerator = (): number =>
    Math.floor( 10000000 + Math.random() * 90000000 );

  const randomFourDigitNumber = Math.floor( 1000 + Math.random() * 9000 );

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
        const customerId = storedCustomerId || ( await registerCustomer( customer ) );
        await createCustomerInfo( customerId, restValues );

        // Create applications for each selected provider
        const applicationPromises = providers.map( async ( providerName ) => {
          const applicationNumberGenerated = randomNumberGenerator();
          const applicationId = await createCustomerApplication(
            customerId,
            applicationNumberGenerated,
            amount,
            tenure,
            providerName,
            loanType,
          );
          await createLoanTracking( applicationId );
          return applicationNumberGenerated;
        } );

        const applicationNumbers = await Promise.all( applicationPromises );

        // Store the first application number or all of them as needed
        setApplicationNumber( applicationNumbers[ 0 ] );

        !storedCustomerId
          ? await setCustomerData( {
            id: customerId,
            name: customer.name,
            applicationNumbers: applicationNumbers, // Store all application numbers
          } )
          : location.reload();

        setLoading( false );
        console.log(
          `Created ${ providers.length } applications successfully:`,
          applicationNumbers
        );
      } catch ( err )
      {
        toastAndNavigate(
          dispatch,
          true,
          "error",
          err?.response?.data?.msg || "Error Occurred. Please Try Again"
        );
        setLoading( false );
        console.log( "Error during customer creation:", err?.response?.data?.msg );
      } finally
      {
        setLoading( false );
      }
    },
    [ amount, tenure, providers, loanType ] // Updated dependency
  );

  const PROVIDER_OPTIONS = providersLoading
    ? []
    : providersData?.data?.results?.map( provider => provider.title ) || [];

  const LOAN_TYPES = [ "Term Loan", "Personal Loan", "Business Loan", "Professional Loan", "Home Loan", "Education Loan", "LAP", "Machinery Loan", "Auto Loan" ];

  // If application number and loan status exists, display success message without making user to fill the form again
  if ( applicationNumber )
  {
    const storedCustomerInfo = getLocalStorage( "customerInfo" );
    const allApplicationNumbers = storedCustomerInfo?.applicationNumbers || [ applicationNumber ];

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
            {allApplicationNumbers.map( ( appNum, index ) => (
              <Typography key={index} sx={{ fontSize: "0.9rem", color: "#333", textAlign: "center" }}>
                <strong>{appNum}</strong>
              </Typography>
            ) )}
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
        ) : null}
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
            color: "#ffffff",
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
            width: { xs: "90%", sm: "60%", md: "45%" },
            mb: 3,
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
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
            },
            "& .Mui-focused": {
              color: "#90caf9 !important",
            },
            "& .MuiSelect-icon": {
              color: "white",
            },
          }}
        >
          <InputLabel>Provider Names* (Select Multiple)</InputLabel>
          <Select
            variant="filled"
            name="providers"
            multiple
            value={providers}
            onChange={( e ) => {
              const value = typeof e.target.value === 'string' ? e.target.value.split( ',' ) : e.target.value;
              setProviders( value );
              validateProviders( value );
            }}
            onBlur={() => validateProviders( providers )}
            startAdornment={
              <InputAdornment position="start" sx={{ color: "white !important" }}>
                <AccountBalanceIcon />
              </InputAdornment>
            }
            renderValue={( selected ) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map( ( value ) => (
                  <Chip
                    key={value}
                    label={value}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(144,202,249,0.3)',
                      color: 'white',
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                      },
                    }}
                    onDelete={() => {
                      const newProviders = providers.filter( p => p !== value );
                      setProviders( newProviders );
                      validateProviders( newProviders );
                    }}
                    onMouseDown={( event ) => {
                      event.stopPropagation();
                    }}
                  />
                ) )}
              </Box>
            )}
            MenuProps={{
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
            }}
          >
            {PROVIDER_OPTIONS.map( ( providerName ) => (
              <MenuItem
                key={providerName}
                value={providerName}
                sx={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  borderRadius: "6px",
                }}
              >
                <Checkbox
                  checked={providers.indexOf( providerName ) > -1}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': {
                      color: '#90caf9',
                    },
                  }}
                />
                <ListItemText
                  primary={providerName}
                  sx={{ color: 'white' }}
                />
              </MenuItem>
            ) )}
          </Select>
          {errors.provider && (
            <Typography
              color="error"
              sx={{
                mt: 0.5,
                ml: 1,
                fontSize: "11px",
                fontFamily: "Verdana, sans-serif",
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
            width: { xs: "90%", sm: "60%", md: "45%" },
            mb: 3,
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
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
            },
            "& .Mui-focused": {
              color: "#90caf9 !important",
            },
            "& .MuiSelect-icon": {
              color: "white",
            },
          }}
        >
          <InputLabel>Loan Type*</InputLabel>
          <Select
            variant="filled"
            name="loanType"
            value={loanType}
            onChange={( e ) => {
              setLoanType( e.target.value );
              validateLoanType( e.target.value );
            }}
            onBlur={() => validateLoanType( loanType )}
            startAdornment={
              <InputAdornment position="start" sx={{ color: "white !important" }}>
                <AccountBalanceIcon />
              </InputAdornment>
            }
            MenuProps={{
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
            }}
          >
            {LOAN_TYPES.map( ( type ) => (
              <MenuItem
                key={type}
                value={type?.toLowerCase()}
                sx={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  borderRadius: "6px",
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
                mt: 0.5,
                ml: 1,
                fontSize: "11px",
                fontFamily: "Verdana, sans-serif",
              }}
            >
              {errors.loanType}
            </Typography>
          )}
        </FormControl>

        <Box
          sx={{
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
                color: "white",
              },
            }}
            sx={{
              fontSize: "13px",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: 1,
              "& .MuiInputBase-root": {
                backgroundColor: "transparent !important",
              },
              // ✅ Label styles
              "& .MuiFormLabel-root": {
                color: "white !important", // label white
              },
              "& .MuiFormLabel-root.Mui-focused": {
                color: "white !important",
              },
              // ✅ Placeholder styles
              "& input::placeholder": {
                fontSize: "0.8rem",
                color: "#ffffff",
              },
              "& .MuiFilledInput-underline:before": {
                borderBottomColor: "rgba(255, 255, 255, 0.5)",
              },
              "& .MuiFilledInput-underline:hover:before": {
                borderBottomColor: "#ffffff",
              },
              "& .MuiFilledInput-underline:after": {
                borderBottomColor: "#039be5",
              },
            }}
          />

        </Box>
        <FormControl
          autoComplete="off"
          variant="filled"
          error={!!errors.tenure}
          sx={{
            width: { xs: "90%", sm: "60%", md: "45%" },
            mb: 3,
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
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
            },
            "& .Mui-focused": {
              color: "#90caf9 !important",
            },
            "& .MuiSelect-icon": {
              color: "white",
            },
          }}
        >
          <InputLabel>Select A Comfortable Tenure</InputLabel>
          <Select
            variant="filled"
            name="tenure"
            value={tenure}
            onChange={( e ) => {
              setTenure( e.target.value );
              validateTenure( e.target.value );
            }}
            onBlur={() => validateTenure( tenure )}
            MenuProps={{
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
            }}
          >
            {[ "3 Years", "5 Years", "8 Years","10 Years","15 Years","20 Years","25 Years","30 Years" ].map( ( label ) => (
              <MenuItem
                key={label}
                value={label}
                sx={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  borderRadius: "6px",
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
                mt: 0.5,
                ml: 1,
                fontSize: "11px",
                fontFamily: "Verdana, sans-serif",
              }}
            >
              {errors.tenure}
            </Typography>
          )}
        </FormControl>


        <Button
          disabled={
            !!errors.amount ||
            !!errors.tenure ||
            !!errors.provider ||
            !amount ||
            !tenure ||
            !providers ||
            providers.length === 0
          }
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            setGetStarted( true );
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4444d3ff 0%, #16213e 50%, #0f3460 100%)',
        py: 2,
        px: { xs: 2, sm: 3, md: 0 }
      }}
    >
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
                  mt: { xs: 0, sm: 0, md: 30 },
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
                ].map( ( field ) => (
                  <TextField
                    key={field.name}
                    autoComplete="off"
                    variant="filled"
                    type={field.type}
                    name={field.name}
                    label={field.label}
                    value={values[ field.name ]}
                    onChange={field.special === 'pan' ?
                      ( event ) => {
                        const uppercaseValue = event.target.value.toUpperCase();
                        setFieldValue( "pan", uppercaseValue );
                      } : handleChange
                    }
                    onBlur={handleBlur}
                    error={!!touched[ field.name ] && !!errors[ field.name ]}
                    helperText={touched[ field.name ] && errors[ field.name ]}
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
                ) )}

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
                      views={[ "year", "month", "day" ]}
                      label="Select Date Of Birth*"
                      name="dob"
                      minDate={minDate}
                      maxDate={maxDate}
                      value={values.dob}
                      onBlur={() => setFieldTouched( "dob", true )}
                      onChange={( newValue ) => setFieldValue( "dob", newValue )}
                      renderInput={( params ) => (
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

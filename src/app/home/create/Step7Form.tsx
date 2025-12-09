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

interface Step7FormProps {
  handleBack: () => void;
  aadharUploadsSuccess: boolean;
}

const Step7Form: React.FC<Step7FormProps> = ( {
  handleBack,
  aadharUploadsSuccess,
} ) => {
  const [ selectedFiles, setSelectedFiles ] = useState<File[]>( [] ); // To store selected files
  const [ selectedAudioFiles, setSelectedAudioFiles ] = useState<File[]>( [] ); // To store selected audio files
  const toastInfo = useSelector( ( state: any ) => state.toast );
  const dispatch = useDispatch();
  const [ amount, setAmount ] = useState<number | null>( null );
  const [ emi, setEmi ] = useState<number | null>( null );
  const [ liability, setLiability ] = useState<number | null>( null );

  const inputRef = useRef<HTMLInputElement | null>( null );

  const [ toast, setToast ] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>( { open: false, message: "", severity: "success" } );

  const handleToast = ( message: string, severity: "success" | "error" ) => {
    setToast( { open: true, message, severity } );
  };

  const [ errors, setErrors ] = useState<{
    amount: string;
    emi: string;
    liability: string;
  }>( {
    amount: "",
    emi: "",
    liability: "",
  } );

  const { getLocalStorage, remLocalStorage } =
    Utility();
  const storedCustomerId = getLocalStorage( "customerInfo" )?.id;
  const profileDetail = getLocalStorage( "profileDetail" );
  const [ isUploading, setIsUploading ] = useState( false );

  // Validation for Amount
  const validateAmount = ( value: string | number | null ) => {
    let error = "";
    if ( !value )
    {
      error = "This field is required.";
    } else if ( isNaN( Number( value ) ) )
    {
      error = "Amount must be a number.";
    } else if ( Number( value ) < 50000 || Number( value ) > 1000000000 )
    {
      error = "Amount must be between 50 thousand and 100 crore.";
    }
    setErrors( ( prev ) => ( { ...prev, amount: error } ) );
  };

  // Validation for EMI
  const validateEmi = ( value: string | number | null ) => {
    let error = "";
    if ( value && isNaN( Number( value ) ) )
    {
      error = "EMI must be a number.";
    }
    setErrors( ( prev ) => ( { ...prev, emi: error } ) );
  };

  // Validation for Liability
  const validateLiability = ( value: string | number | null ) => {
    let error = "";
    if ( value && isNaN( Number( value ) ) )
    {
      error = "Liability must be a number.";
    }
    setErrors( ( prev ) => ( { ...prev, liability: error } ) );
  };


  // Function to update customer info
  const updateCustomerInfo = async ( data: any ) => {
    try
    {
      await axiosInstance.patch(
        `${ process.env.NEXT_PUBLIC_WEB_URL }/customer-info-update`,
        data
      )
      console.log( "Customer info updated successfully." );
    } catch ( error )
    {
      console.log( "Error updating customer info:", error );
    }
  };

  // Handle deleting a file from the selected files array
  const handleAttachmentDelete = ( index: number ) => {
    const updatedFiles = selectedFiles.filter( ( _, i ) => i !== index );
    setSelectedFiles( updatedFiles );
    if ( inputRef.current )
    {
      inputRef.current.value = ""; // Reset the value of the input element
    }
  };

  const handleAttachmentAudioDelete = ( index: number ) => {
    const updatedFiles = selectedAudioFiles.filter( ( _, i ) => i !== index );
    setSelectedAudioFiles( updatedFiles );
    if ( inputRef.current )
    {
      inputRef.current.value = ""; // Reset the value of the input element
    }
  };

  const updateFormInfo = async ( data: any ) => {
    if ( storedCustomerId )
    {
      try
      {
        await updateCustomerInfo( data );

        // Reset form fields
        setAmount( null );
        setEmi( null );
        setLiability( null );

        setTimeout( () => {
          remLocalStorage( "activeStep" );
          remLocalStorage( "StatementUpload" );
          remLocalStorage( "profileDetail" );
          location.reload();
        }, 1500 );
      } catch ( error )
      {
        console.error( "Error updating customer info:", error );
      }
    } else
    {
      console.error( "No customer ID found." );
    }
  };

  // Handle form submission
  const create = useCallback( async () => {
    // Check if the user is online
    if ( !navigator.onLine )
    {
      handleToast( "No internet connection. Please try again later.", "error" );
      return;
    }
    setIsUploading( true );
    const data = {
      customer_id: storedCustomerId,
      salary: amount,
      existing_emi: emi,
      existing_liability: liability,
    };
    let attachmentUrls: string[] = [];

    updateFormInfo( data );
    if ( selectedFiles.length !== 0 )
    {
      for ( const file of selectedFiles )
      {
        // Uploading each document
        const formData = new FormData();
        formData.append( "document", file );
        formData.append( "folder", `document/${ file.name }` );

        try
        {
          const uploadResponse = await axiosInstance.post(
            `${ process.env.NEXT_PUBLIC_WEB_URL }/upload-to-s3`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const attachmentUrl = uploadResponse.data.data; // Store the URL from the response

          if ( attachmentUrl )
          {
            attachmentUrls.push( attachmentUrl ); // Push URL to array

            await axiosInstance.post(
              `${ process.env.NEXT_PUBLIC_WEB_URL }/create-document`,
              {
                customer_id: storedCustomerId,
                document_url: attachmentUrl,
                type: "certificate",
              }
            );
          }
        } catch ( err )
        {
          // console.log( "Error uploading attachment:", err );
          handleToast( "Error uploading documents", "error" );
          return; // Exit early if there's an error
        }
      }
    }

    // Handle audio files (if necessary)
    if ( selectedAudioFiles.length !== 0 )
    {
      console.log( 'Load audio files' );
      // You can add the audio file upload logic here if needed.
    }

    // If no files to upload, log this info
    if ( !selectedFiles.length && !selectedAudioFiles.length )
    {
      console.log( 'no files to upload' );
    }
    setIsUploading( false );
  }, [
    amount,
    emi,
    liability,
    storedCustomerId,
    dispatch,
    selectedFiles,
    selectedAudioFiles,
  ] );

  useEffect( () => {
    const handleOnline = () => handleToast( "Back online", "success" );
    const handleOffline = () => handleToast( "You are offline", "error" );

    window.addEventListener( "online", handleOnline );
    window.addEventListener( "offline", handleOffline );

    return () => {
      window.removeEventListener( "online", handleOnline );
      window.removeEventListener( "offline", handleOffline );
    };
  }, [] );

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
          label="( Salary/Turnover ) p.a*"
          placeholder="(Salary/Turnover)*p.a"
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
            marginBottom: 2,
            "& .MuiFilledInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
              "&:before": {
                display: "none",
              },
              "&:after": {
                display: "none",
              },
            },
            "& .MuiInputAdornment-root": {
              color: "rgba(255, 255, 255, 0.8)",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.9)",
              "&.Mui-focused": {
                color: "white",
              },
            },
            "& .MuiFormHelperText-root": {
              color: "rgba(255, 255, 255, 0.8)",
              "&.Mui-error": {
                color: "#ffcccb",
              },
            },
            "& input::placeholder": {
              color: "rgba(255, 255, 255, 0.6)",
              opacity: 1,
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
          onChange={( e ) => {
            setEmi( e.target.value );
            validateEmi( e.target.value );
          }}
          onBlur={() => validateEmi( emi )}
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
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
              "&:before": {
                display: "none",
              },
              "&:after": {
                display: "none",
              },
            },
            "& .MuiInputAdornment-root": {
              color: "rgba(255, 255, 255, 0.8)",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.9)",
              "&.Mui-focused": {
                color: "white",
              },
            },
            "& .MuiFormHelperText-root": {
              color: "rgba(255, 255, 255, 0.8)",
              "&.Mui-error": {
                color: "#ffcccb",
              },
            },
            "& input::placeholder": {
              color: "rgba(255, 255, 255, 0.6)",
              opacity: 1,
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
          onChange={( e ) => {
            setLiability( e.target.value );
            validateLiability( e.target.value );
          }}
          onBlur={() => validateLiability( liability )}
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
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              },
              "&:before": {
                display: "none",
              },
              "&:after": {
                display: "none",
              },
            },
            "& .MuiInputAdornment-root": {
              color: "rgba(255, 255, 255, 0.8)",
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.9)",
              "&.Mui-focused": {
                color: "white",
              },
            },
            "& .MuiFormHelperText-root": {
              color: "rgba(255, 255, 255, 0.8)",
              "&.Mui-error": {
                color: "#ffcccb",
              },
            },
            "& input::placeholder": {
              color: "rgba(255, 255, 255, 0.6)",
              opacity: 1,
            },
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
        <Typography
          variant="h5"
          sx={{
            fontSize: {
              xs: "0.75rem",
              sm: "0.875rem",
              md: "1rem",
            },
            color: "white",
            mb: 1,
          }}
        >
          Degree and Registration Certificate
        </Typography>

        {/* File Picker */}
        {selectedFiles.length < 4 && (
          <IconButton
            component="label"
            sx={{ mb: 1, color: "#FFD700", display: "flex", justifyContent: "center" }}
          >
            <AddPhotoAlternateIcon />
            <input
              ref={inputRef}
              hidden
              multiple
              type="file"
              accept=".jpg, .gif, .png, .jpeg, .svg, .webp, application/pdf, .doc, .docx, .txt"
              onChange={( event ) => {
                const newFiles = Array.from( event.target.files );
                const totalFiles = selectedFiles.length + newFiles.length;

                if ( totalFiles > 4 )
                {
                  handleToast( "Maximum limit reached: 4 files", "error" );
                  return;
                }

                const filteredFiles = newFiles.filter( ( file ) => {
                  if ( file.size > 5048576 )
                  {
                    handleToast( `${ file.name } exceeds the 5 MB limit`, "error" );
                    return false;
                  }
                  return true;
                } );

                if ( filteredFiles.length === 0 ) return;

                setSelectedFiles( ( prevFiles ) => [ ...prevFiles, ...filteredFiles ] );
              }}
            />
          </IconButton>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Box sx={{ width: "100%", maxWidth: "40vw", mt: 2 }}>
            {selectedFiles.map( ( file, index ) => (
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
                  onClick={() => handleAttachmentDelete( index )}
                  sx={{ ml: 2 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            ml: "4vw",
            mb: "13vh",
          }}
        >
          <Button
            onClick={handleBack}
            sx={{
              mr: 4,
              mt: 2,
              fontFamily: "Poppins",
              fontSize: ".9rem",
              color: "white",
            }}
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
              mr: 20,
              position: "relative",
              color: "black",
              fontFamily: "Poppins",
              fontWeight: "500",
              backgroundColor: "#FFD700",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            {isUploading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: "black",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                  zIndex: 1,
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
        onClose={() => setToast( ( prev ) => ( { ...prev, open: false } ) )}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast( ( prev ) => ( { ...prev, open: false } ) )}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Step7Form;

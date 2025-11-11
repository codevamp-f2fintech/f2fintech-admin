'use client';

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import { Box, Typography, Container, Button, IconButton, Alert, Snackbar, CircularProgress } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";

import { Utility } from "@/utils";

interface Step3FormProps {
  handleNext: () => void;
  allUploadsSuccess: boolean | null;
  setAllUploadsSuccess: ( value: boolean ) => void;
}

const initialValues = {
  data: [] as File[],
};

const Step3Form: React.FC<Step3FormProps> = ( {
  handleNext,
  allUploadsSuccess,
  setAllUploadsSuccess,
} ) => {
  const [ selectedFiles, setSelectedFiles ] = useState<File[]>( [] ); // To store selected files
  const [ toast, setToast ] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>( { open: false, message: "", severity: "success" } );
  const dispatch = useDispatch();
  const { getLocalStorage, setLocalStorage, toastAndNavigate } = Utility();
  const customerId = getLocalStorage( "customerInfo" )?.id;
  const [ isUploading, setIsUploading ] = useState( false );

  const inputRef = useRef<HTMLInputElement | null>( null );
  const handleToast = ( message: string, severity: "success" | "error" ) => {
    setToast( { open: true, message, severity } );
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

  // Submitting the form and uploading files
  const handleFormSubmit = useCallback(
    async ( values: typeof initialValues ) => {
      // Check if the user is online
      if ( !navigator.onLine )
      {
        handleToast( "No internet connection. Please try again later.", "error" );
        return;
      }
      let attachmentUrl = null;
      setIsUploading( true );

      for ( const file of values.data )
      {
        const formData = new FormData();
        formData.append( "document", file );
        formData.append( "folder", `document/${ file.name }` );

        try
        {
          const uploadResponse = await axios.post(
            `${ process.env.NEXT_PUBLIC_WEB_URL }/upload-to-s3`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          attachmentUrl = uploadResponse.data.data;

          if ( attachmentUrl )
          {
            await axios.post(
              `${ process.env.NEXT_PUBLIC_WEB_URL }/create-document`,
              {
                document_url: attachmentUrl,
                customer_id: customerId,
                type: "bank statement",
              }
            )
            setAllUploadsSuccess( true );
            setLocalStorage( "StatementUpload", true );
            handleToast( "Documents uploaded successfully!", "success" );
          }
        } catch ( err )
        {
          console.error( "Error uploading attachment:", err );
          handleToast( "Error uploading documents", "error" );
          setAllUploadsSuccess( false );
        }
      }
      setIsUploading( false );
    },
    [ customerId, setAllUploadsSuccess, setLocalStorage ]
  );

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

  useEffect( () => {
    if ( allUploadsSuccess )
    {
      const timer = setTimeout( () => {
        handleNext(); // Call handleNext to move to the next step after 2 seconds
      }, 2000 );

      // Clear the timeout if the component unmounts or if allUploadsSuccess changes
      return () => clearTimeout( timer );
    }
  }, [ allUploadsSuccess, handleNext ] );

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={( values ) =>
          handleFormSubmit( { ...values, data: selectedFiles } )
        }
      >
        {( { dirty, isSubmitting, handleSubmit, setFieldValue } ) => (
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: "15px",
              }}
            >
              {/* Header section */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography
                  sx={{
                    fontFamily: "DM Sans",
                    fontSize: {
                      xs: "1.7rem", // Mobile
                      sm: "2.5rem", // Tablet
                      md: "2rem", // Desktop
                    },
                    color: '#ffffff',
                    fontWeight: 500,
                    marginBottom: 1,
                  }}
                >
                  Statement <span style={{ color: "#FFd700" }}>Upload</span>{" "}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "2vh",
                    color: "white",
                    marginBottom: 3,
                  }}
                  variant="subtitle1"
                  color="white"
                >
                  Step 2/4
                </Typography>

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
                  ( Upload your recent 6 months Bank Statement)
                  <br />
                  (Maximum File Upload Limit Is <span style={{ color: "#FFd700" }}>10</span> )
                </Typography>
              </Box>

              {/* File input and display */}
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
                {/* File picker with multiple file upload support */}
                {selectedFiles.length < 10 && (
                  <IconButton
                    component="label"
                    sx={{ mb: 0, color: "#FFD700", display: "flex", justifyContent: "center" }}
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

                        // Calculate total files including the new selection
                        const totalFiles =
                          selectedFiles.length + newFiles.length;

                        if ( totalFiles > 10 )
                        {
                          handleToast( "Maximum limit reached: 10 files", "error" );
                          return;
                        }

                        // Check file size limit (1MB = 10,04,85,760 bytes)
                        const filteredFiles = newFiles.filter( ( file ) => {
                          if ( file.size > 10485760 )
                          {
                            handleToast( `${ file.name } exceeds the 10MB limit`, "error" );
                            return false;
                          }
                          return true;
                        } );

                        // If there are no files left after filtering, return early
                        if ( filteredFiles.length === 0 ) return;

                        setSelectedFiles( ( prevFiles ) => [
                          ...prevFiles,
                          ...filteredFiles,
                        ] );
                        setFieldValue( "data", [
                          ...selectedFiles,
                          ...filteredFiles,
                        ] );
                      }}
                    />
                  </IconButton>
                )}
                {/* Display selected file names with delete icons */}
                {selectedFiles.length > 0 && (
                  <Box sx={{ width: "100%", maxWidth: "40vw", mt: 2, }}>
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


                {/* Upload button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: "13vh",
                    flexDirection: "column",
                  }}
                >
                  <Button
                    color="primary"
                    disabled={
                      !dirty || isSubmitting || selectedFiles.length === 0 || isUploading
                    }
                    type="submit"
                    variant="contained"
                    sx={{
                      color: "black",
                      backgroundColor: "#FFD700",
                      fontFamily: "Poppins",
                      fontSize: "1rem",
                      lineHeight: "1.5rem",
                      mt: 2,
                      position: "relative", // Ensure the button's content is positioned correctly
                      "&:hover": {
                        backgroundColor: "transparent", // Transparent color on hover
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
                          marginTop: "-12px", // Adjust positioning so it stays centered
                          marginLeft: "-12px", // Adjust positioning so it stays centered
                          zIndex: 1, // Ensure it's displayed on top of the button text
                        }}
                      />
                    ) : (
                      "Upload"
                    )}
                  </Button>

                  <Button
                    sx={{
                      mt: 2,
                      fontFamily: "Poppins",
                      fontSize: ".9rem",
                      color: "white",
                    }}
                    onClick={handleNext}
                    disabled={selectedFiles.length > 0}
                  >
                    Skip
                  </Button>
                </Box>

              </Box>
            </Container>
          </Form>
        )}
      </Formik>
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
    </>
  );
};

export default Step3Form;

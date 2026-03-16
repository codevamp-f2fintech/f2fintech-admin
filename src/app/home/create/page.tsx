'use client';

import React, { useState, useEffect, ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import Step1Form from "./Step1Form";
import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import Step7Form from "./Step7Form";

import { Utility } from "@/utils";
import { axiosInstance } from "@/apis/config/axiosConfig";

interface StepForm {
  label: string;
  icon: string;
}

const steps_form: StepForm[] = [
  {
    label: "Basic Details",
    icon: "https://open-frontend-bucket.s3.amazonaws.com/open-capital/onboarding/register/icons/basic-details.svg",
  },
  {
    label: "Statement upload",
    icon: "https://open-frontend-bucket.s3.amazonaws.com/open-capital/onboarding/register/icons/statement.svg",
  },
  {
    label: "Proﬁle details and proof",
    icon: "https://open-frontend-bucket.s3.amazonaws.com/open-capital/onboarding/register/icons/profile-details.svg",
  },
  {
    label: "Additional Details",
    icon: "https://open-frontend-bucket.s3.amazonaws.com/open-capital/onboarding/register/icons/business-details.svg",
  },
];

const steps: string[] = [ "Step 1", "Step 2", "Step 3", "Step 4" ];

const MultiStepForm: React.FC = () => {
  const [ activeStep, setActiveStep ] = useState<number>( 0 );
  const [ getStarted, setGetStarted ] = useState<boolean>( false ); // To toggle form fields display
  const [ applicationNumber, setApplicationNumber ] = useState<string | null>( null ); // for step form 1
  const [ applicationData, setApplicationData ] = useState<any>( null ); // for step form 1
  const [ allUploadsSuccess, setAllUploadsSuccess ] = useState<boolean | null>( null ); // Track if all uploads were successful for step form 3
  const [ aadharUploadsSuccess, setAadharUploadsSuccess ] = useState<boolean | null>( null ); // Track if all uploads were successful for step form 4
  const [ salarySuccess, setSalarySuccess ] = useState<boolean | null>( null ); // Track if salary upload was successful for step form 4

  const [ isStepCompleted, setIsStepCompleted ] = useState<{
    step2: boolean;
    step3: boolean;
    step4: boolean;
  }>( {
    step2: false,
    step3: false,
    step4: false,
  } );

  const { getLocalStorage, setLocalStorage } = Utility();
  const storedCustomerId = getLocalStorage( "customerInfo" )?.id;

  // Restore step and progress from localStorage on mount
  useEffect( () => {
    const savedActiveStep = getLocalStorage( "activeStep" );
    if ( savedActiveStep )
    {
      setActiveStep( parseInt( savedActiveStep, 10 ) );
    }
  }, [ applicationData?.salary ] );

  // Save active step and progress to localStorage
  useEffect( () => {
    setLocalStorage( "activeStep", activeStep );
  }, [ activeStep, applicationData?.salary ] );

  const handleNext = (): void => {
    setActiveStep( ( prevActiveStep ) => prevActiveStep + 1 );
  };

  const handleBack = (): void => {
    setActiveStep( ( prevActiveStep ) => Math.max( prevActiveStep - 1, 0 ) );
  };

  // Handle form submission to allow progressing
  const handleFormSubmit = (): void => {
    if ( activeStep === 0 )
      setIsStepCompleted( ( prev ) => ( { ...prev, step2: true } ) );
    if ( activeStep === 1 )
      setIsStepCompleted( ( prev ) => ( { ...prev, step3: true } ) );
    if ( activeStep === 2 )
      setIsStepCompleted( ( prev ) => ( { ...prev, step4: true } ) );
    handleNext();
  };

  useEffect( () => {
    window.scrollTo( 0, 0 );
  }, [ activeStep, getStarted ] );

  // Fetch application number and loan status using stored customer ID
  useEffect( () => {
    const fetchCustomerData = async () => {
      if ( storedCustomerId )
      {
        try
        {
          const { data: response } = await axiosInstance.get(
            `${ process.env.NEXT_PUBLIC_WEB_URL }/customer-info/${ storedCustomerId }` );
          if ( response.status === "Success" )
          {
            setApplicationData( response.data );
          }
        } catch ( err )
        {
          console.log( "Error fetching customer data:", err );
        }
      }
    };
    fetchCustomerData();
  }, [ storedCustomerId ] );

  // Render form content for each step
  const getStepContent = ( step: number ): ReactNode => {
    switch ( step )
    {
      case 0:
        return (
          <Step1Form
            handleNext={handleNext}
            applicationNumber={applicationNumber}
            setApplicationNumber={setApplicationNumber}
            onSubmit={handleFormSubmit}
            getStarted={getStarted}
            setGetStarted={setGetStarted}
            salary={applicationData?.salary}
          />
        );
      case 1:
        return (
          <Step3Form
            handleNext={handleNext}
            allUploadsSuccess={allUploadsSuccess}
            setAllUploadsSuccess={setAllUploadsSuccess}
          />
        );
      case 2:
        return (
          <Step4Form
            handleNext={handleNext}
            handleBack={handleBack}
            allUploadsSuccess={allUploadsSuccess}
            aadharUploadsSuccess={aadharUploadsSuccess}
            setAadharUploadsSuccess={setAadharUploadsSuccess}
          />
        );
      case 3:
        return (
          <Step7Form
            aadharUploadsSuccess={aadharUploadsSuccess}
            setSalarySuccess={setSalarySuccess}
            handleBack={handleBack}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        marginBottom: "15px",
        minHeight: "70vh",
        alignItems: "center",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          marginBottom: "15px",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: applicationData?.salary ? "center" : "flex-start",
          borderRadius: "20px",
        }}
      >
        {/* Left side box */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: { xs: "100%", sm: "50%" }, // full on mobile, half on iPad & desktop
            overflowX: "hidden",
            maxHeight: "260vh",
            background:
              "linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)",
            borderRadius: { xs: "20px 20px 0 0", sm: "20px 0px 0px 20px" },
            // padding: { xs: "15px", sm: "30px" },
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box>
              {getStepContent( activeStep )}
              {activeStep === 0 &&
                !applicationData?.salary &&
                !getStarted &&
                applicationNumber && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      pt: 2,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      onClick={handleNext}
                      sx={{ mr: 2, color: "white", bgcolor: "#0277bd" }}
                    >
                      Next
                    </Button>
                  </Box>
                )}
            </Box>

            {!applicationData?.salary && (
              <Stepper
                activeStep={activeStep}
                sx={{ margin: { xs: "20px 10px", sm: "20px 40px", md: "20px 80px" } }}
              >
                {steps.map( ( label, index ) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        color: index === activeStep ? "white !important" : "green",
                        fontWeight: index === activeStep ? "bold" : "normal",
                        "&.MuiStepLabel-completed": {
                          color: "green",
                        },
                        "&.MuiStepLabel-active": {
                          color: "blue",
                        },
                        "& .MuiStepIcon-root": {
                          color:
                            index === activeStep
                              ? "white !important"
                              : "green",
                          "&.MuiStepIcon-completed": {
                            color: "green",
                          },
                          "&.MuiStepIcon-active": {
                            color: "blue",
                          },
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ) )}
              </Stepper>
            )}
          </Box>
        </Box>

        {/* Right side box */}
        {!applicationData?.salary && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: { xs: "15px", sm: "20px" },
              background:
                "linear-gradient(90deg, hsla(212, 35%, 58%, 1) 0%, hsla(218, 32%, 80%, 1) 100%)",
              justifyContent: "center",
              alignItems: "center",
              width: { xs: "100%", sm: "50%" }, // half width on iPad and desktop
              position: { xs: "relative", md: "sticky" }, // sticky only on desktop
              top: { md: 0 },
              height: { xs: "auto", sm: "auto", md: "100vh" }, // prevent cutoff on tablets
              overflowY: { md: "auto" },
              borderRadius: { xs: "0 0 20px 20px", sm: "0px 20px 20px 0px" },
            }}
          >
            <Typography variant="h4" align="center" sx={{ marginBottom: "20px" }}>
              Steps Ahead
            </Typography>
            <Typography variant="body1" align="center" sx={{ marginBottom: "20px" }}>
              In order to receive the loan amount, you will need to successfully
              complete these steps.
            </Typography>
            {steps_form.map( ( step, index ) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "white",
                  display: "flex",
                  width: { xs: "90%", sm: "70%", md: "20vw" },
                  alignItems: "center",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  component="img"
                  src={step.icon}
                  alt={`${ step.label } icon`}
                  sx={{ width: "40px", height: "40px", marginRight: "10px" }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {step.label}
                </Typography>
              </Box>
            ) )}
          </Box>
        )}
      </Box>
    </Container>


  );
};

export default MultiStepForm;

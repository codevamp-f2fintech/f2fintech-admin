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
import axios from "axios";

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
    handleNext(); // Proceed to the next step upon successful form submission
  };

  useEffect( () => {
    setTimeout( () => {
      window.scrollTo( 0, 0 );
    }, 200 );
  }, [] );

  // Fetch application number and loan status using stored customer ID
  useEffect( () => {
    const fetchCustomerData = async () => {
      if ( storedCustomerId )
      {
        try
        {
          const { data: response } = await axios.get(
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

  console.log( 'applicationNumber', applicationNumber, activeStep, applicationData?.salary, getStarted );
  // activeStep === 0 &&
  //   !applicationData?.salary &&
  //   !getStarted &&

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
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
          justifyContent: applicationData?.salary ? "center" : "flex-start",
          borderRadius: "20px",
        }}
      >
        {/* // Left side box  */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "50%",
            overflowX: "hidden", // Enable vertical scrolling
            maxHeight: "260vh", // Adjust height as needed
            // border: "2px solid yellow",
            backgroundColor: "#424242",
            borderRadius: "20px 0px 0px 20px",
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
                    <Button onClick={handleNext} sx={{ mr: 10, color: "white", bgcolor: "#0277bd" }}>
                      Next
                    </Button>
                  </Box>
                )}
            </Box>

            {!applicationData?.salary && (
              <Stepper activeStep={activeStep} sx={{ margin: "20px 80px" }}>
                {steps.map( ( label, index ) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        color: index === activeStep ? 'white !imprtant' : 'green', // Active step color white, inactive white
                        fontWeight: index === activeStep ? 'bold' : 'normal', // Make the active step bold
                        '&.MuiStepLabel-completed': {
                          color: 'green', // Completed step color green
                        },
                        '&.MuiStepLabel-active': {
                          color: 'blue', // Active step text color blue
                        },
                        '& .MuiStepIcon-root': {
                          color: index === activeStep ? 'white !important' : 'green', // Change icon color for active and inactive steps
                          '&.MuiStepIcon-completed': {
                            color: 'green', // Completed step icon color green
                          },
                          '&.MuiStepIcon-active': {
                            color: 'blue', // Active step icon color blue
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
        {!applicationData?.salary && (
          // Right side box
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "20px",
              backgroundColor: "#e0e0e0",
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
              position: "sticky", // Make the right box sticky
              top: 0,
              height: "100vh",
              overflowY: "auto",
              borderRadius: "0px 20px 20px 0px",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{ marginBottom: "20px" }}
            >
              Steps Ahead
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ marginBottom: "20px" }}
            >
              In order to receive the loan amount, you will need to successfully
              complete these steps.
            </Typography>
            {steps_form.map( ( step, index ) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "white",
                  display: "flex",
                  width: "20vw",
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
    </Container >
  );
};

export default MultiStepForm;

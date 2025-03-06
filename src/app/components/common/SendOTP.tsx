"use client"

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

import Toast from "../../components/common/Toast";
import { Utility } from '@/utils';

// Define the OTP component to handle sending and verifying OTP
const SendOTP = ( { email, handleDeleteTicket, ticketId }: { email: string, handleDeleteTicket: ( ticketId: number ) => void, ticketId: number } ) => {
    const [ otp, setOtp ] = useState<string>( '' );
    const [ isOtpSent, setIsOtpSent ] = useState<boolean>( false );
    const [ otpStatus, setOtpStatus ] = useState<string>( '' );
    const { toast } = useSelector( ( state: RootState ) => state.toast );
    const dispatch: AppDispatch = useDispatch();
    const { toastAndNavigate } = Utility();

    console.log( "email", email );

    const generateOTP = () => {
        const generatedOtp = Math.floor( 100000 + Math.random() * 900000 ).toString();
        return generatedOtp;
    };

    const sendOtpEmail = async ( email: string ) => {
        const generatedOtp = generateOTP();
        localStorage.setItem( 'generatedOtp', generatedOtp ); // Store OTP temporarily

        // Use EmailJS to send the OTP to the email
        const templateParams = {
            email: email,
            firstname: "f2fintech",
            subject: "otp generation",
            Messages: generatedOtp,
        };

        try
        {
            await emailjs.send(
                'service_vjl61ky',  // Your service ID
                'template_9zqddj2', // Your template ID
                templateParams,
                'V36zLBrhvlNSC1V1W'// Your user ID
            );
            setIsOtpSent( true );
            setOtpStatus( 'Please check your email for OTP' );
        } catch ( error )
        {
            setOtpStatus( 'Failed to send OTP' );
            console.error( error );
        }
    };

    const verifyOtp = async () => {
        const storedOtp = localStorage.getItem( 'generatedOtp' );
        if ( otp === storedOtp )
        {
            console.log( "ticketId>>>", ticketId )
            setOtpStatus( 'OTP verified. Proceeding with ticket deletion...' );
            const deleteTicketResp = await handleDeleteTicket( ticketId ); // Call the delete function here
            if ( deleteTicketResp?.statusCode === 200 )
            {
                toastAndNavigate(
                    dispatch,
                    true,
                    "success",
                    "Ticket deleted successfully",
                    null,
                    null,
                    true
                );
            }
        } else
        {
            setOtpStatus( 'Invalid OTP. Please try again.' );
            return false;
        }
    };

    return (
        <Box display="flex" justifycontent="center" alignitems="center">
            {!isOtpSent ? (
                <Button onClick={() => sendOtpEmail( email )}>Click Here To Send OTP</Button>
            ) : (
                <>
                    <Typography p={2}>{otpStatus}</Typography>
                    <TextField
                        label="Enter OTP"
                        variant="outlined"
                        onChange={( e ) => setOtp( e.target.value )}
                        value={otp}
                    />
                    <Button
                        onClick={async () => {
                            const isVerified = await verifyOtp();  // Await the result of verifyOtp
                            if ( isVerified )
                            {
                                console.log( "ticketId", ticketId );
                            }
                        }}
                    >
                        Verify OTP
                    </Button>
                </>
            )}
            <Toast
                alerting={toast.toastAlert}
                severity={toast.toastSeverity}
                message={toast.toastMessage}
            />
        </Box>
    );
};

export default SendOTP;

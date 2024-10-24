"use client";
import React, { useState } from "react";
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Checkbox,
  Chip,
} from "@mui/material";
import {
  MailRounded,
  PhoneRounded,
  PaidRounded,
  AccessTimeRounded,
  LocationOnRounded,
} from "@mui/icons-material";
import { useCreateTicket } from "@/hooks/ticket";
import { Utility } from "@/utils";
import { useGetCustomers, useModifyCustomer } from "@/hooks/customer";

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          color: "#6E44FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(110, 68, 255, 0.1)",
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
          borderRadius: "50%",
          padding: "8px",
        }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          fontSize: "small",
        })}
      </Box>
      <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium" }}>
        {text}
      </Typography>
    </Box>
  );
}

const ApplicationCard = ({ contact, ticket = false, handleStartClick }) => {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const { createTicket, error } = useCreateTicket("create-ticket", {});
  const { decodedToken } = Utility();

  const { refetch } = useGetCustomers(
    [],
    `get-loan-applications`,
    currentPage,
    pageSize
  );

  // Hook for modifying loan application is_picked column
  const { modifyCustomer: modifyCustomerApplication } = useModifyCustomer(
    "update-loan-application"
  );

  // Function to calculate the number of days ago
  const calculateDaysAgo = (date: string) => {
    const today = new Date();
    const addedDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to create new ticket
  const createNewTicket = async (applicationId: number) => {
    try {
      await createTicket({
        customer_application_id: applicationId,
        user_id: decodedToken()?.id,
        status: "to do",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const handleCheckboxChange = async (
    contactId: number,
    applicationId: number
  ) => {
    const isAlreadySelected = selectedContacts.includes(contactId);

    if (!isAlreadySelected) {
      try {
        await createNewTicket(applicationId);

        await modifyCustomerApplication(applicationId, {
          is_picked: 1,
        });
        await refetch();

        setSelectedContacts((prevSelectedContacts) => [
          ...prevSelectedContacts,
          contactId,
        ]);
      } catch (error) {
        console.log("Error in checkbox change:", error);
      }
    } else {
      // If already selected, remove the contactId from the selected contacts
      setSelectedContacts((prevSelectedContacts) =>
        prevSelectedContacts.filter((id) => id !== contactId)
      );
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={contact.Id}>
      <Card
        sx={{
          maxWidth: 345,
          borderRadius: 4,
          overflow: "visible",
          position: "relative",
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
          background: `
      linear-gradient(135deg, #6a1b9a 0%, #d5006d 50%, #00b0ff 100%)
    `,
          pt: 6,
          mt: 5,
        }}
      >
        <CardContent sx={{ pt: 0, pb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Avatar
              alt={contact.Name}
              src={contact.Image}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "black",
                color: "white",
                fontSize: 36,
                fontWeight: "bold",
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                border: "4px solid white",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{ mt: 4, color: "white", fontWeight: "bold" }}
            >
              {contact.Name.toUpperCase()}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              p: 2,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <InfoRow icon={<MailRounded />} text={contact.Email} />
            <InfoRow icon={<PhoneRounded />} text={contact.Contact} />
            <InfoRow icon={<PaidRounded />} text={contact.Amount} />
            <InfoRow
              icon={<AccessTimeRounded />}
              text={`${contact.Tenure} months`}
            />
            {contact.Location && (
              <InfoRow icon={<LocationOnRounded />} text={contact.Location} />
            )}
          </Box>
          {!ticket && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Chip
                label={`${calculateDaysAgo(contact.applicationDate)}
                        days
                        ago`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  fontWeight: "bold",
                  "& .MuiChip-label": { color: "#6E44FF" },
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ mr: 1, color: "white", fontWeight: "bold" }}
                >
                  Pick
                </Typography>
                <Checkbox
                  checked={selectedContacts.includes(contact.Id)}
                  onChange={() =>
                    handleCheckboxChange(contact.Id, contact.applicationId)
                  }
                  size="small"
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "#FFD93D",
                    },
                  }}
                />
              </Box>
            </Box>
          )}
          {ticket && (
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "100%", borderRadius: 0 }}
              onClick={() =>
                handleStartClick(
                  contact.Id,
                  contact.applicationId,
                  ticket.original_estimate,
                  ticket.status
                )
              }
            >
              Start Work
            </Button>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ApplicationCard;

"use client";
import React, { useEffect, useState } from "react";
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
  useMediaQuery,
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
import { useModifyCustomer } from "@/hooks/customer";
import { fetcher } from "@/apis/apiClient";

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

const ApplicationCard = ({
  contact,
  handleStartClick = null,
  ticket = false,
  refetch = null,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const { decodedToken, capitalizeFirstLetter } = Utility();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTab = useMediaQuery("(min-width:601px) and (max-width:1200px)");

  const { createTicket, error } = useCreateTicket("create-ticket", {});
  // Hook for modifying loan application is_picked column
  const { modifyCustomer: modifyCustomerApplication } = useModifyCustomer(
    "update-loan-application"
  );

  useEffect(() => {
    if (showHistory && ticket) {
      const fetchHistoryData = async () => {
        try {
          const { data } = await fetcher(
            `get-ticket-histories/${ticket.ticketId}`
          );
          setHistoryData(data);
        } catch (error) {
          console.error("Error fetching history data:", error);
        }
      };
      fetchHistoryData();
    }
  }, [showHistory, ticket]);

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
      console.log("Error creating ticket:", error);
    }
  };

  const handleCheckboxChange = async (
    contactId: number,
    applicationId: number
  ) => {
    const isAlreadySelected = selectedContacts.includes(contactId);

    if (!isAlreadySelected) {
      try {
        await createNewTicket(applicationId); // Create new Ticket
        await modifyCustomerApplication(applicationId, {
          is_picked: 1,
        }); // Mark the Card as picked

        setSelectedContacts((prevSelectedContacts) => [
          ...prevSelectedContacts,
          contactId,
        ]);
        if (refetch) {
          await refetch();
        }
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

  // Function to format tenure
  function formatTenure(tenure: number) {
    if (tenure <= 60) {
      return `${tenure} months`;
    } else {
      const years = (tenure / 12).toFixed(1); // Convert to years with one decimal place if needed
      return `${years} years`;
    }
  }

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  const cleanActionTextWithBoldName = (text) => {
    // Remove <b> tags and <br> tags
    const cleanedText = text.replace(/<\/?b>/g, "").replace(/<br\s*\/?>/g, " ");

    // Capitalize the first letter of the first word
    const capitalizedText =
      cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);

    // Extract the name from the action and make it bold
    const nameMatch = capitalizedText.match(/(\S+\s\S+)(?=\schanged\sstatus)/); // Assuming the name is before 'changed status'
    if (nameMatch) {
      const name = nameMatch[0];
      const restOfText = capitalizedText.replace(name, "");
      return (
        <>
          <b>{name}</b> {restOfText}
        </>
      );
    }

    return capitalizedText; // Return the text with the first letter capitalized
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
          pt: isMobile ? 3 : 5,
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
              alt={capitalizeFirstLetter(contact.Name)}
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
              sx={{
                mt: 3,
                color: "white",
                fontWeight: "bold",
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                textAlign: "center",
                fontSize: "1.3rem",
                height: isMobile ? "7vh" : isTab ? "4vh" : "8vh",
                width: isMobile ? "80vw" : isTab ? "25vw" : "20vw",
              }}
            >
              {contact.Name?.toUpperCase()}
            </Typography>
          </Box>

          {!showHistory ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "rgba(255,255,255,0.9)",
                borderRadius: "10px 10px 0px 0px",
                p: 2,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
              }}
            >
              <InfoRow icon={<MailRounded />} text={contact.Email} />
              <InfoRow icon={<PhoneRounded />} text={contact.Contact} />
              <InfoRow icon={<PaidRounded />} text={contact.Amount} />
              <InfoRow
                icon={<AccessTimeRounded />}
                text={formatTenure(contact.Tenure)}
              />
              {contact.Location && (
                <InfoRow
                  icon={<LocationOnRounded />}
                  text={capitalizeFirstLetter(contact.Location)}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "rgba(255,255,255,0.9)",
                borderRadius: 2,
                p: 2,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                minHeight: isMobile ? "35vh" : isTab ? "20vh" : "40vh",
                overflowY: "scroll",
                maxHeight: "40vh",
                "&::-webkit-scrollbar": {
                  display: "none", // This hides the scrollbar
                },
              }}
            >
              {historyData.length > 0 ? (
                historyData.map((history, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", flexDirection: "column", mb: 2 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "black", fontStyle: "normal", mb: 1 }}
                    >
                      {cleanActionTextWithBoldName(history.action)}
                      {/* Cleaned action text */}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "blue" }}>
                      <strong>Days ago:</strong>{" "}
                      {calculateDaysAgo(history.created_at)} days ago
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#333" }}>
                  No history data available.
                </Typography>
              )}
            </Box>
          )}
          {ticket && Object.keys(ticket).length > 0 ? (
            <Box
              sx={{
                display: "flex",
                borderRadius: "0px 0px 20px 20px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                sx={{ width: "100%", borderRadius: "0px 0px 0px 10px" }}
                onClick={() =>
                  handleStartClick(
                    contact.Id,
                    contact.customer_application_id,
                    ticket.ticketId
                  )
                }
              >
                Visit Ticket
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ width: "100%", borderRadius: "0px 0px 10px 0px" }}
                onClick={toggleHistory}
              >
                {showHistory ? "Close History" : "Show History"}
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Chip
                label={`${calculateDaysAgo(contact.applicationDate)} days ago`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  fontWeight: "bold",
                  "& .MuiChip-label": { color: "#6E44FF" },
                }}
              />
              {decodedToken()?.role === "admin" ? null : (
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
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ApplicationCard;

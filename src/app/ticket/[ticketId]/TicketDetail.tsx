import { Avatar, Box, Grid, Typography } from "@mui/material";

import { Utility } from "@/utils";

const TicketDetail = ({ ticketDetailData, isMobile, isTab }) => {
  const { capitalizeFirstLetter, formatTenure, formatDate, formatAmount } =
    Utility();

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography
          variant="h5"
          sx={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontFamily: "monospace",
            fontStyle: "revert-layer",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          Ticket ID: F2FIN-{ticketDetailData?.ticketId}
        </Typography>
      </Box>

      <Box
        mt={2}
        p={2}
        border={1}
        borderColor="white"
        display="flex"
        alignItems="center"
        justifyContent={"center"}
        gap={2}
        sx={{
          borderRadius: "14px",
          flexDirection: isMobile ? "column" : isTab ? "" : "",
        }}
      >
        <Box sx={{}}>
          <Avatar
            src={ticketDetailData?.customerDocuments}
            sx={{
              width: isMobile ? "2rem" : isTab ? "6vw" : "4rem",
              height: isMobile ? "2rem" : isTab ? "4vh" : "4rem",
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 4,
            backgroundImage: `
      linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
    `,
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <Grid container spacing={3}>
            {/* Name and Email */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ mb: 1, color: "white", fontSize: "1rem" }}>
                <strong>Name:</strong>{" "}
                {capitalizeFirstLetter(ticketDetailData?.customerName)}
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "1rem",
                  mb: 1,
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <strong>Email:</strong> {ticketDetailData?.customerEmail}
              </Typography>
            </Grid>

            {/* Contact and Designation */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Contact:</strong> +91{" "}
                {ticketDetailData?.customerContact}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Designation:</strong>{" "}
                {capitalizeFirstLetter(ticketDetailData?.customerDesignation)}
              </Typography>
            </Grid>

            {/* Location and Tenure */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Location:</strong>{" "}
                {capitalizeFirstLetter(ticketDetailData?.customerLocation)}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Tenure:</strong>{" "}
                {formatTenure(ticketDetailData?.applicationTenure)}
              </Typography>
            </Grid>

            {/* Amount and Application Date */}
            <Grid item xs={12} sm={6}>
              <Typography sx={{ color: "white", fontSize: "1rem", mb: 1 }}>
                <strong>Amount:</strong>{" "}
                {formatAmount(ticketDetailData?.applicationAmount)}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1rem" }}>
                <strong>Application Date:</strong>{" "}
                {formatDate(ticketDetailData?.applicationDate)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default TicketDetail;

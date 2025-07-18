"use client"
import React, { useEffect, useState } from "react"
import {
  Grid,
  Button,
  Typography,
  Avatar,
  Box,
  Checkbox,
  Chip,
  useMediaQuery,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  Paper,
  CardContent,
  Card,
  TextField,
} from "@mui/material"
import {
  MailRounded,
  PhoneRounded,
  AccessTimeRounded,
  LocationOnRounded,
  Close,
  DeleteForever,
  DeleteOutline,
  ExpandMore,
  ExpandLess,
  DeleteOutlined,
} from "@mui/icons-material"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee"
import { useCreateTicket } from "@/hooks/ticket"
import { Utility } from "@/utils"
import { useModifyCustomerApplication } from "@/hooks/customerApplication"
import { fetcher } from "@/apis/apiClient"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { resetCustomerApplications } from "@/redux/features/customerApplicationSlice"
import { resetTickets } from "@/redux/features/ticketSlice"

interface ApplicationCardProps {
  customerApplication: {
    customerId: number
    customerName: string
    customerEmail: string
    customerContact?: string
    customerProfileImage?: string
    customerLocation?: string
    customerState?: string
    state?: string
    applicationAmount: string
    applicationTenure: number
    applicationDate: string
    applicationId: number
    ticketId?: number
    ticketStatus?: string
    loanStatus?: string
    userRole?: string
    applicationProvider?: string
    showDeleteButton?: boolean
    onDelete: ( applicationId: string, customerName: string ) => void
  }
  handleStartClick?: ( ticketId: number ) => void
  refetch?: () => Promise<void>
  userRole?: string
  handleDeleteTicket?: ( ticketId: number ) => void
  isApplication?: boolean
  toggleListView?: boolean
}

function InfoRow ( {
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string | undefined;
} ) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
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
        {React.cloneElement( icon as React.ReactElement, {
          fontSize: "small",
        } )}
      </Box>
      <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium" }}>
        {text}
      </Typography>
    </Box>
  );
}

function InfoChip ( {
  icon,
  text,
  color = "#6E44FF",
}: {
  icon: React.ReactNode
  text: string | undefined
  color?: string
} ) {
  return (
    <Chip
      icon={React.cloneElement( icon as React.ReactElement, {
        fontSize: "small",
        sx: { color: color },
      } )}
      label={text}
      variant="outlined"
      size="small"
      sx={{
        borderColor: color,
        color: color,
        backgroundColor: `${ color }10`,
        fontWeight: "medium",
        "& .MuiChip-icon": {
          color: color,
        },
      }}
    />
  )
}

const ApplicationCard: React.FC<ApplicationCardProps> = ( {
  customerApplication,
  handleStartClick = null,
  showDeleteButton = false,
  refetch = null,
  onDelete,
  userRole,
  handleDeleteTicket,
  handleDeleteApplication,
  isApplication = false,
  toggleListView
} ) => {
  console.log( "userRole12121", userRole )
  const [ showHistory, setShowHistory ] = useState<boolean>( false )
  const [ historyData, setHistoryData ] = useState<any[]>( [] )
  const [ openDeleteDialog, setOpenDeleteDialog ] = useState<boolean>( false )
  const [ expanded, setExpanded ] = useState<boolean>( false )
  const dispatch: AppDispatch = useDispatch()
  const { toast } = useSelector( ( state: RootState ) => state.toast )
  const { toastAndNavigate } = Utility()
  const { calculateDaysAgo, capitalizeFirstLetter, decodedToken, formatTenure } = Utility()
  const [ showOtpComponent, setShowOtpComponent ] = useState<boolean>( false )
  const isMobile = useMediaQuery( "(max-width:600px)" )
  const isTab = useMediaQuery( "(min-width:601px) and (max-width:1200px)" )
  const [ deleteReason, setDeleteReason ] = useState<string>( "" );

  const handleDeleteClick = ( e: React.MouseEvent ) => {
    e.stopPropagation()
    onDelete( customerApplication.applicationId, customerApplication.customerName )
  }

  const { createTicket } = useCreateTicket( "create-ticket" )
  const { modifyCustomerApplication: modifyiedCustomerApplication } =
    useModifyCustomerApplication( "update-loan-application" )

  const toggleHistory = () => setShowHistory( ( prev ) => !prev )
  const toggleExpanded = () => setExpanded( ( prev ) => !prev )

  const openConfirmDialog = ( e ) => {
    e.stopPropagation()
    setOpenDeleteDialog( true )
  }

  const closeConfirmDialog = () => {
    setOpenDeleteDialog( false )
  }

  const confirmDelete = async () => {
    if ( !deleteReason.trim() )
    {
      toastAndNavigate( dispatch, true, "error", "Please provide a reason for deletion", null, null, true );
      return;
    }

    if ( handleDeleteTicket && !isApplication )
    {
      try
      {
        await handleDeleteTicket( customerApplication.ticketId, deleteReason )
        toastAndNavigate( dispatch, true, "success", "Ticket deleted successfully", null, null, false )
        closeConfirmDialog()
      } catch ( error )
      {
        console.log( "Error deleting ticket:", error )
        toastAndNavigate( dispatch, true, "error", "Failed to delete ticket. Please try again.", null, null, true )
      }
    }
    if ( isApplication && handleDeleteApplication )
    {
      handleDeleteApplication( customerApplication.applicationId )
    }
  }

  useEffect( () => {
    if ( showHistory && customerApplication.ticketId )
    {
      const fetchHistoryData = async () => {
        try
        {
          const { data } = await fetcher( `get-ticket-histories/${ customerApplication.ticketId }` )
          setHistoryData( data )
        } catch ( error )
        {
          console.log( "Error fetching history data:", error )
        }
      }
      fetchHistoryData()
    }
  }, [ showHistory, customerApplication?.ticketId ] )

  const handleCheckboxChange = async ( applicationId: number ) => {
    try
    {
      await createTicket( {
        customer_application_id: applicationId,
        user_id: decodedToken()?.id,
        status: "operations",
      } )
      dispatch( resetTickets() )
      await modifyiedCustomerApplication( applicationId, {
        is_picked: 1,
      } )
      dispatch( resetCustomerApplications( applicationId ) )
    } catch ( error )
    {
      console.log( "Error in checkbox change:", error )
    }
  }

  useEffect( () => {
    // Collapse when it's an application
    if ( isApplication )
    {
      setExpanded( false );
    }
  }, [ isApplication ] );

  const formatRupees = ( value: number ) => {
    return new Intl.NumberFormat( "en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    } ).format( value )
  }

  const ListView = () => {
    return (
      <Grid item xs={12} key={customerApplication.customerId}>
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 1, // Further reduced from 1.5
            transition: "all 0.3s ease",
            "&:hover": {
              elevation: 4,
              transform: "translateY(-2px)",
            },
          }}
        >
          <ListItem
            sx={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              p: 1, // Further reduced from 1.5
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            {/* Avatar Section */}
            <ListItemAvatar sx={{ minWidth: isMobile ? "auto" : 60 }}> {/* Further reduced from 70 */}
              <Avatar
                alt={
                  // Extract name after title (e.g., "Mr. John Doe" → "John Doe")
                  capitalizeFirstLetter(
                    customerApplication.customerName
                      .split( '.' )[ 1 ]?.trim() ||
                    customerApplication.customerName.split( ' ' ).slice( 1 ).join( ' ' ) 
                  )
                }
                src={customerApplication.customerProfileImage}
                sx={{
                  width: isMobile ? 40 : 32, // Further reduced from 50:35
                  height: isMobile ? 40 : 32, // Further reduced from 50:35
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: isMobile ? 16 : 20, // Further reduced from 20:24
                  fontWeight: "bold",
                  border: "1px solid rgba(255,255,255,0.3)", // Further reduced from 2px
                  mx: isMobile ? "auto" : 0,
                  mb: isMobile ? 0.25 : 0, // Further reduced from 0.5:0
                }}
              />
            </ListItemAvatar>

            {/* Main Content */}
            <ListItemText
              sx={{
                flex: 1,
                ml: isMobile ? 0 : 1, // Further reduced from 1.5
                textAlign: isMobile ? "center" : "left",
              }}
              primary={
                <Typography
                  variant={isMobile ? "body1" : "subtitle1"} // Further reduced from subtitle1:h6
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    mb: 0.25, // Further reduced from 0.5
                  }}
                >
                  {customerApplication.customerName?.toUpperCase()}
                </Typography>
              }
              secondary={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: .5, // Further reduced from 0.5
                    flexWrap: "wrap",
                    alignItems: isMobile ? "center" : "flex-start",
                  }}
                >
                  <InfoChip
                    icon={<CurrencyRupeeIcon />}
                    text={formatRupees( customerApplication.applicationAmount )}
                    color="#eeff41"
                  />
                  {customerApplication.applicationProvider && (
                    <InfoChip
                      icon={<AccountBalanceIcon />}
                      text={customerApplication.applicationProvider}
                      color="#eeff41"
                    />
                  )}
                  <InfoChip
                    icon={<AccessTimeRounded />}
                    text={formatTenure( customerApplication.applicationTenure )}
                    color="#eeff41"
                  />


                  {userRole !== "sales" && (
                    <>
                      <InfoChip icon={<MailRounded />} text={customerApplication.customerEmail} color="white" />
                      <InfoChip icon={<PhoneRounded />} text={customerApplication.customerContact} color="white" />
                    </>
                  )}
                  {customerApplication.customerLocation && (
                    <InfoChip
                      icon={<LocationOnRounded />}
                      text={capitalizeFirstLetter( customerApplication.customerLocation )}
                      color="white"
                    />
                  )}
                  {customerApplication.customerState && (
                    <InfoChip
                      icon={<LocationOnRounded />}
                      text={capitalizeFirstLetter( customerApplication.customerState )}
                      color="white"
                    />
                  )}
                  <Chip
                    label={`${ calculateDaysAgo( customerApplication.applicationDate ) } days ago`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              }
            />



            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                gap: .5, // Further reduced from 0.5
                alignItems: "center",
                mt: isMobile ? 0.5 : 0, // Further reduced from 1:0
              }}
            >
              {/* Delete Button */}
              {( showDeleteButton || ( userRole === "admin" && handleDeleteTicket ) ) && (
                <IconButton
                  onClick={openConfirmDialog}
                  sx={{
                    color: "#f44336",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                      color: "#d32f2f",
                    },
                  }}
                  size="small"
                >
                  <DeleteOutline sx={{ fontSize: 16 }} />
                </IconButton>
              )}

              {/* Expand/Collapse Button */}
              {!isApplication && (
                <IconButton
                  onClick={toggleExpanded}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                  size="small"
                >
                  {expanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </IconButton>
              )}

              {/* Pick Checkbox */}
              {decodedToken()?.role !== "sales" && !handleStartClick && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ mr: 0.5, color: "white", fontWeight: "bold" }}> {/* Reduced from body2 and mr: 1 */}
                    Pick
                  </Typography>
                  <Checkbox
                    onChange={() => handleCheckboxChange( customerApplication.applicationId )}
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
          </ListItem>

          {/* Expanded Details */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.95)" }}> {/* Further reduced from 1.5 */}
              {!showHistory ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1, // Further reduced from 1.5
                  }}
                >


                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1" sx={{ color: "#333", mb: 1 }}> {/* Further reduced from h6 and mb: 1.5 */}
                    History
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: "120px", // Further reduced from 150px
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "6px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "#f1f1f1",
                        borderRadius: "3px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#888",
                        borderRadius: "3px",
                      },
                    }}
                  >
                    {historyData.length > 0 ? (
                      historyData.map( ( history, index ) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            mb: 1, // Further reduced from 1.5
                            p: 1, // Further reduced from 1.5
                            bgcolor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "black", fontWeight: "medium", mb: 0.25 }}> {/* Further reduced from 0.5 */}
                            <strong>{capitalizeFirstLetter( history.action.split( " " )[ 0 ] )}</strong>
                            {` ${ history.action.substring( history.action.indexOf( " " ) + 1 ) }`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#1976d2" }}>
                            {calculateDaysAgo( history.created_at )} days ago
                          </Typography>
                        </Box>
                      ) )
                    ) : (
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        No history data available.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              {handleStartClick && customerApplication.ticketId && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1, // Further reduced from 1.5
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  {userRole !== "sales" && (
                    <Button
                      variant="contained"
                      onClick={handleStartClick}
                      sx={{
                        bgcolor: "#667eea",
                        "&:hover": {
                          bgcolor: "#5a6fd8",
                        },
                      }}
                    >
                      Visit Ticket
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={toggleHistory}
                    sx={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      "&:hover": {
                        borderColor: "#5a6fd8",
                        bgcolor: "rgba(102, 126, 234, 0.04)",
                      },
                    }}
                  >
                    {showHistory ? "Close History" : "Show History"}
                  </Button>
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>
      </Grid >
    )
  }

  const GridView = () => {
    return (
      <Grid item xs={12} sm={6} md={4} key={customerApplication.customerId}>
        <Card
          sx={{
            maxWidth: 345,
            borderRadius: 4,
            overflow: "visible",
            position: "relative",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            backgroundImage: `
linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
`,
            backgroundBlendMode: "multiply, screen, normal",
            pt: isMobile ? 3 : 5,
            mt: 5,
          }}
        >
          {/* Delete Button */}
          {showDeleteButton && (
            <IconButton
              onClick={openConfirmDialog}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#f44336",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  color: "#d32f2f",
                },
                zIndex: 1,
              }}
              size="small"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          )}
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
                alt={
                  // Extract name after title (e.g., "Mr. John Doe" → "John Doe")
                  capitalizeFirstLetter(
                    customerApplication.customerName
                      .split( '.' )[ 1 ]?.trim() ||
                    customerApplication.customerName.split( ' ' ).slice( 1 ).join( ' ' )
                  )
                }
                src={customerApplication.customerProfileImage}
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
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  mb: 1,
                  color: "white",
                  fontWeight: "bold",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  textAlign: "center",
                  fontSize: "1.3rem",
                  height: isMobile ? "7vh" : isTab ? "4vh" : "8vh",
                  width: isMobile ? "80vw" : isTab ? "25vw" : "30vw",

                }}
              >
                {customerApplication.customerName?.toUpperCase()}
              </Typography>
              {/* Delete button for admin only */}
              {userRole === "admin" && handleDeleteTicket && (
                <Button
                  variant="contained"
                  sx={{
                    width: "10%",
                    borderRadius: "50px",
                    backgroundColor: "transparent",
                    position: "absolute",
                    top: "2.5vh",
                    ml: "17vw",
                    "&:hover": {
                      bgcolor: "#cc0000",
                    },
                  }}
                  onClick={openConfirmDialog}
                >
                  <DeleteOutlined />
                </Button>
              )
              }
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
                {userRole !== "sales" &&
                  <>
                    <InfoRow
                      icon={<MailRounded />}
                      text={customerApplication.customerEmail}
                    />

                    <InfoRow
                      icon={<PhoneRounded />}
                      text={customerApplication.customerContact}
                    />
                  </>
                }
                <InfoRow
                  icon={<CurrencyRupeeIcon />}
                  text={formatRupees( customerApplication.applicationAmount )}
                />
                <InfoRow
                  icon={<AccessTimeRounded />}
                  text={formatTenure( customerApplication.applicationTenure )}
                />
                <InfoRow
                  icon={<AccountBalanceIcon />}
                  text={( customerApplication.applicationProvider || "No provider available...." )}
                />
                {customerApplication.customerLocation && (
                  <InfoRow
                    icon={<LocationOnRounded />}
                    text={capitalizeFirstLetter(
                      customerApplication.customerLocation
                    )}
                  />
                )}
                {customerApplication.customerState && (
                  <InfoRow
                    icon={<LocationOnRounded />}
                    text={capitalizeFirstLetter(
                      customerApplication.customerState
                    )}
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
                    display: "none",
                  },
                }}
              >
                {historyData.length > 0 ? (
                  historyData.map( ( history, index ) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", flexDirection: "column", mb: 2 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "black", fontStyle: "normal", mb: 1 }}
                      >
                        <strong>
                          {capitalizeFirstLetter( history.action.split( " " )[ 0 ] )}
                        </strong>
                        {` ${ history.action.substring(
                          history.action.indexOf( " " ) + 1
                        ) }`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "blue" }}>
                        {calculateDaysAgo( history.created_at )} days ago
                      </Typography>
                    </Box>
                  ) )
                ) : (
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    No history data available.
                  </Typography>
                )}
              </Box>
            )}
            {handleStartClick && customerApplication.ticketId ? (
              <Box
                sx={{
                  display: "flex",
                  borderRadius: "0px 0px 20px 20px",
                }}
              >
                {userRole !== "sales" &&
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      width: "100%",
                      borderRadius: "0px 0px 0px 10px",
                      bgcolor: "#f06292",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#f06292",
                        color: "white",
                      },
                    }}
                    onClick={handleStartClick}
                  >
                    Visit Ticket
                  </Button>
                }


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
                  label={`${ calculateDaysAgo(
                    customerApplication.applicationDate
                  ) } days ago`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    fontWeight: "bold",
                    "& .MuiChip-label": { color: "#6E44FF" },
                  }}
                />
                {( decodedToken()?.role === "sales" ) ? null : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ mr: 1, color: "white", fontWeight: "bold" }}
                    >
                      Pick
                    </Typography>
                    <Checkbox
                      onChange={() =>
                        handleCheckboxChange( customerApplication.applicationId )
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
      </Grid >
    )
  }

  return (
    <>
      {toggleListView ? (
        <ListView />
      ) : (
        <GridView />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          borderRadius: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            backgroundImage: `
    linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
  `,
            backgroundBlendMode: "multiply, screen, normal",
            color: "white",
            padding: "20px",
            borderRadius: "1px 1px 0 0",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.25rem",
          }}
        >
          Confirm Ticket Deletion
        </DialogTitle>
        <DialogContent
          sx={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "1rem",
            lineHeight: "1.5",
            bgcolor: "lightcyan"
          }}
        >
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              fontSize: "0.9rem",
              color: "#555",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Are you sure you want to delete this ticket? This action cannot be undone.
          </DialogContentText>

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Reason for deletion"
            value={deleteReason}
            onChange={( e ) => setDeleteReason( e.target.value )}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#6E44FF",
                },
                "&:hover fieldset": {
                  borderColor: "#6E44FF",
                },
              },
            }}
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            bgcolor: "lightcyan"
          }}
        >
          <Button
            onClick={closeConfirmDialog}
            color="primary"
            variant="outlined"
            sx={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#ddd",
              },
            }}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={!deleteReason.trim()} // Disable if no reason provided
            sx={{
              backgroundColor: "#FF3B30",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#D32F2F",
              },
              "&:disabled": {
                backgroundColor: "#cccccc",
                color: "#666666",
              },
            }}
            startIcon={<DeleteForever />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationCard;
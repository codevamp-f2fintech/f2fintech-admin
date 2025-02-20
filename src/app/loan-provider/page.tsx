/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
    Card,
    CardContent,
    Chip,
    TextField,
    Button,
    IconButton,
    Typography,
    Box,
    Container,
    Grid,
    Tooltip,
    Avatar,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import {
    ClearRounded,
    SearchRounded,
    PersonAddRounded,
    MailRounded,
    EditRounded,
    DeleteRounded,
    PersonRounded,
} from "@mui/icons-material";

const dummyData = [
    { id: 1, name: "Loan Provider A", email: "a@provider.com", type: "Bank"},
    { id: 2, name: "Loan Provider B", email: "b@provider.com", type: "Credit Union"},
    { id: 3, name: "Loan Provider C", email: "c@provider.com", type: "Online Lender"},
    { id: 4, name: "Loan Provider D", email: "d@provider.com", type: "Bank"},
    { id: 5, name: "Loan Provider E", email: "e@provider.com", type: "Online Lender"},
];


const LoanProviderPage = () => {
    const router = useRouter();

    const [ searchTerm, setSearchTerm ] = useState<string>( "" );
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
     const [openDialog, setOpenDialog] = useState(false);
      const [updatePassword, setUpdatePassword] = useState(false);

    const filteredLoanProviders = useMemo( () => {
        return dummyData.filter( ( val ) =>
            val.name.toLowerCase().includes( searchTerm.toLowerCase() )
        );
    }, [ searchTerm ] );

    const handleOpenDialog = ( userId: string | null = null ) => {
        setSelectedUserId( userId );
        setUpdatePassword( false );
        setOpenDialog( !openDialog );
    };

    return (
        <Box sx={{ minHeight: "100vh", px: { xs: 2, sm: 4 } }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <TextField
                        placeholder="Search by name..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={( e ) => setSearchTerm( e.target.value )}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded sx={{ color: "action.active", mr: 1 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm( "" )}>
                                        <ClearRounded sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: "100px",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                "& fieldset": { border: "none" },
                                width: { xs: "100%", md: "320px" },
                            },
                        }}
                        InputLabelProps={{
                            style: {
                                color: "black",
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<PersonAddRounded />}
                        onClick={() => router.push("/loan-provider/loanFormPage")}


                        sx={{
                            borderRadius: "100px",
                            px: 3,
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            bgcolor: "#f06292",
                            color: "white",
                            "&:hover": {
                                bgcolor: "#9D50BB",
                                color: "white",
                            },
                        }}
                    >
                        Create
                    </Button>
                </Box>

                {/* Loan Provider Grid */}
                <Grid container spacing={3}>
                    {filteredLoanProviders.length &&
                        filteredLoanProviders.map( ( provider ) => (
                            <Grid item xs={12} md={6} key={provider.id}>
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        backgroundImage: `linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)`,
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
                                            <Box>
                                                <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
                                                    {provider.name}
                                                </Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <MailRounded sx={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }} />
                                                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                                                        {provider.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Chip
                                                    icon={<PersonRounded sx={{ color: "white !important" }} />}
                                                    label={provider.type}
                                                    sx={{
                                                        bgcolor: "rgba(255,255,255,0.2)",
                                                        color: "white",
                                                        borderRadius: "100px",
                                                        "& .MuiChip-icon": { color: "white" },
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}>
                                                {provider.name.charAt( 0 )}
                                            </Avatar>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: "white",
                                                            bgcolor: "rgba(255,255,255,0.1)",
                                                            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                                        }}
                                                        onClick={() => handleOpenDialog( provider.id.toString() )}


                                                    >
                                                        <EditRounded />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: "white",
                                                            bgcolor: "rgba(255,255,255,0.1)",
                                                            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                                        }}
                                                    >
                                                        <DeleteRounded />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) )}
                </Grid>
            </Container>

            {false && (
                <Box display="flex" justifyContent="center" mb={2}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default LoanProviderPage;

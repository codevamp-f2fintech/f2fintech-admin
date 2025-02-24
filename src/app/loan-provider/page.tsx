"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { setLoanProviders } from "@/redux/features/loanProviderSlice";
import { useGetLoanProviders } from "@/hooks/loanProvider";
import { Utility } from "@/utils";
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
import { ClearRounded, SearchRounded, PersonAddRounded } from "@mui/icons-material";
import PublicIcon from '@mui/icons-material/Public';

const ITEMS_PER_PAGE = 10;

const LoanProviderPage = () => {
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ hasMoreData, setHasMoreData ] = useState( true );
    const { loanProvider, reduxLoading } = useSelector( ( state: RootState ) => state.loanProviders );
    const { debounceScroll } = Utility();

    const {
        value: data,
        swrLoading,
        refetch,
    } = useGetLoanProviders( null, "get-all-loan-providers", currentPage, ITEMS_PER_PAGE );

    const dispatch: AppDispatch = useDispatch();
    const router = useRouter();

    // Set loan providers when data changes
    useEffect( () => {
        if ( data?.data?.results )
        {
            dispatch( setLoanProviders( data?.data?.results ) );
            setHasMoreData( data.data.results.length === ITEMS_PER_PAGE );
        } else
        {
            setHasMoreData( false );
        }
    }, [ data?.data?.results, dispatch ] );

    const [ searchTerm, setSearchTerm ] = useState<string>( "" );

    const filteredLoanProviders = useMemo( () => {
        return ( loanProvider || [] ).filter( ( provider ) =>
            provider.title?.toLowerCase().includes( searchTerm.toLowerCase() )
        );
    }, [ searchTerm, loanProvider ] );

    // Infinite Scroll Logic
    const handleScroll = useCallback(
        debounceScroll( () => {
            const nearBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 400; // 400px threshold
            if ( nearBottom && !swrLoading && hasMoreData )
            {
                setCurrentPage( ( prevPage ) => prevPage + 1 );
            }
        }, 500 ),
        [ swrLoading, hasMoreData ]
    );

    useEffect( () => {
        window.addEventListener( "scroll", handleScroll );
        return () => window.removeEventListener( "scroll", handleScroll );
    }, [ handleScroll ] );

    return (
        <Box sx={{ minHeight: "100vh", px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 4 } }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2, mb: 4 }}>
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
                        onClick={() => router.push( "/loan-provider/loanFormPage" )}
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
                                <Card sx={{ borderRadius: 4, boxShadow: "0 10px 20px rgba(0,0,0,0.1)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.15)" } }}>
                                    <CardContent sx={{ p: 3, minHeight: "30vh" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 0 }}>
                                            {/* Image */}
                                            <Box sx={{ width: "50%", height: "28vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <img
                                                    src={provider.home_image}
                                                    alt="Home"
                                                    style={{ width: "100%", height: "100%", objectFit: "fit" }}
                                                />
                                            </Box>

                                            {/* Text */}
                                            <Box sx={{ width: "55%", paddingLeft: 2 }}>
                                                <Typography variant="h5" sx={{ color: "black", fontWeight: 600, mb: 1 }}>
                                                    {provider.title}
                                                </Typography>

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                    <PublicIcon sx={{ color: "blue", fontSize: 18 }} />
                                                    <Typography sx={{ color: "black", fontSize: "0.9rem" }}>
                                                        {provider.country}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PublicIcon sx={{ color: "blue", fontSize: 18 }} />
                                                    <Typography sx={{ color: "black", fontSize: "0.9rem" }}>
                                                        {provider.short_description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) )}

                    {/* Show "No more data" message */}
                    {!hasMoreData && !swrLoading && (
                        <Typography sx={{ width: "100%", textAlign: "center", mt: 4, color: "black" }}>
                            No more loan providers to load...
                        </Typography>
                    )}
                </Grid>
            </Container>

            {/* Show loading spinner */}
            {swrLoading && (
                <Box display="flex" justifyContent="center" mb={2}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default LoanProviderPage;

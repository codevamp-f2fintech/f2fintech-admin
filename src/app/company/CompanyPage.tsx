"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    Pagination,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Switch,
    FormControlLabel,
} from "@mui/material";
import {
    ClearRounded,
    SearchRounded,
    BusinessRounded,
    EditRounded,
    DeleteRounded,
    AddRounded,
    CheckCircleRounded,
    CancelRounded,
    VisibilityRounded,
    CalendarMonthRounded,
    EmailRounded,
    LocationOnRounded,
    PhoneRounded,
} from "@mui/icons-material";

import type { AppDispatch, RootState } from "@/redux/store";
import type { Company, CompaniesResponse } from "@/types/company";
import { CompanyAPI } from "@/apis/CompanyAPI";
import { Utility } from "@/utils";
import Toast from "../components/common/Toast";
import CompanyForm from "./CompanyForm";
import { axiosInstance } from "@/apis/config/axiosConfig";

interface CompanyPageProps {
    initialData: CompaniesResponse;
}

const ITEMS_PER_PAGE = 12;

const CompanyPage: React.FC<CompanyPageProps> = ( { initialData } ) => {
    const [ openDialog, setOpenDialog ] = useState( false );
    const [ selectedCompanyId, setSelectedCompanyId ] = useState<number | null>( null );
    const [ searchTerm, setSearchTerm ] = useState<string>( "" );
    const [ currentPage, setCurrentPage ] = useState<number>( 1 );
    const [ showInactive, setShowInactive ] = useState<boolean>( false );
    const [ companies, setCompanies ] = useState<Company[]>( initialData?.results );
    const [ totalCount, setTotalCount ] = useState<number>( initialData?.count );
    const [ totalPages, setTotalPages ] = useState<number>( initialData?.pages );
    const [ loading, setLoading ] = useState<boolean>( false );
    const [ deleteDialog, setDeleteDialog ] = useState<{
        open: boolean;
        companyId: number | null;
        companyName: string;
    }>( {
        open: false,
        companyId: null,
        companyName: "",
    } );

    const { toast } = useSelector( ( state: RootState ) => state.toast );
    const dispatch: AppDispatch = useDispatch();
    const { capitalizeFirstLetter, toastAndNavigate } = Utility();

    const fetchCompanies = async () => {
        setLoading( true );
        try
        {
            // Prepare filters object
            const filters: any = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };

            if ( showInactive )
            {
                filters.isActive = 'false';
            } else
            {
                filters.isActive = 'true';
            }
            const response = await CompanyAPI.getAll( filters );

            let companiesData;
            if ( response.data )
            {
                companiesData = response.data;
            } else
            {
                companiesData = response;
            }

            setCompanies( [ ...companiesData.results ] );
            setTotalCount( companiesData.count );
            setTotalPages( companiesData.pages );

            const totalCountResponse = await CompanyAPI.getAll( {
                page: 1,
                limit: 1,
            } );

            let totalCompaniesData;
            if ( totalCountResponse.data )
            {
                totalCompaniesData = totalCountResponse.data;
            } else
            {
                totalCompaniesData = totalCountResponse;
            }
            setTotalCount( totalCompaniesData.count );

        } catch ( error: any )
        {
            console.error( 'Error fetching companies:', error );
            const errorMessage = error?.response?.data?.message || "Error fetching companies";
            toastAndNavigate( dispatch, true, "error", errorMessage );
        } finally
        {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchCompanies();
    }, [ currentPage, showInactive ] );

    useEffect( () => {
        fetchCompanies();
    }, [ currentPage, showInactive ] );

    // Filter companies based on search term
    const filteredCompanies = useMemo( () => {
        return companies?.filter( company =>
            company.name.toLowerCase().includes( searchTerm.toLowerCase() )
        );
    }, [ searchTerm, companies ] );

    // Handle company creation/update
    const handleCompanySubmit = async ( companyData: any ) => {
        try
        {
            if ( selectedCompanyId )
            {
                await CompanyAPI.update( selectedCompanyId, companyData );
                toastAndNavigate( dispatch, true, "success", "Company updated successfully" );
            } else
            {
                await CompanyAPI.create( companyData );
                toastAndNavigate( dispatch, true, "success", "Company created successfully" );
            }
            setOpenDialog( false );
            setSelectedCompanyId( null );
            await fetchCompanies();
        } catch ( error: any )
        {
            const errorMessage = error?.response?.data?.message || "Error saving company";
            toastAndNavigate( dispatch, true, "error", errorMessage );
        }
    };

    // Handle company deletion
    const handleCompanyDelete = async ( companyId: number ) => {
        try
        {
            console.log( 'Attempting to delete company with ID:', companyId );

            const userId = 1;

            const deleteData = {
                reason: "Deleted from company management page",
                deletedBy: userId
            };
            const response = await axiosInstance.delete( `/companies/${ companyId }`, {
                data: deleteData
            } );

            console.log( 'Delete API response:', response );

            toastAndNavigate( dispatch, true, "success", "Company deleted successfully" );
            setDeleteDialog( { open: false, companyId: null, companyName: "" } );

            // Reset to first page and reload data
            if ( currentPage !== 1 )
            {
                setCurrentPage( 1 );
            }

            await fetchCompanies();

            console.log( 'Company deleted and data refreshed' );

        } catch ( error: any )
        {
            console.error( 'Error in handleCompanyDelete:', error );

            const errorMessage = error?.response?.data?.message || "Error deleting company";
            toastAndNavigate( dispatch, true, "error", errorMessage );
        }
    };

    // Handle company activation/deactivation
    const handleCompanyStatusToggle = async ( company: Company ) => {
        try
        {
            if ( company.isActive )
            {
                await CompanyAPI.deactivate( company.id );
                toastAndNavigate( dispatch, true, "success", "Company deactivated successfully" );
            } else
            {
                await CompanyAPI.activate( company.id );
                toastAndNavigate( dispatch, true, "success", "Company activated successfully" );
            }
            fetchCompanies();
        } catch ( error: any )
        {
            const errorMessage = error?.response?.data?.message || "Error updating company status";
            toastAndNavigate( dispatch, true, "error", errorMessage );
        }
    };

    const handleOpenDialog = ( companyId: number | null = null ) => {
        setSelectedCompanyId( companyId );
        setOpenDialog( true );
    };

    const handleCloseDialog = () => {
        setOpenDialog( false );
        setSelectedCompanyId( null );
    };

    const handlePageChange = ( event: React.ChangeEvent<unknown>, page: number ) => {
        setCurrentPage( page );
    };

    const formatDate = ( dateString: string ) => {
        return new Date( dateString ).toLocaleDateString( "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        } );
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                // width: "100%",
                // backgroundColor: "background.default",
            }}
        >
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Section */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "stretch", md: "center" },
                        justifyContent: "space-between",
                        gap: 3,
                        mb: 4,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                mb: 1,
                            }}
                        >
                            Company Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your companies and their settings
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <TextField
                            placeholder="Search companies..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={( e ) => setSearchTerm( e.target.value )}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRounded sx={{ color: "action.active" }} />
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
                                    borderRadius: "8px",
                                    backgroundColor: "background.paper",
                                    minWidth: { xs: "100%", sm: 300 },
                                },
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showInactive}
                                    onChange={( e ) => setShowInactive( e.target.checked )}
                                    color="primary"
                                />
                            }
                            label="Show Inactive"
                            sx={{ mr: 2 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            onClick={() => handleOpenDialog( null )}
                            sx={{
                                borderRadius: "8px",
                                px: 3,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Add Company
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {totalCount}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Total Companies
                                        </Typography>
                                    </Box>
                                    <BusinessRounded sx={{ fontSize: 40, opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {showInactive
                                                ? companies?.filter( c => !c.isActive ).length // Count inactive companies
                                                : companies?.filter( c => c.isActive ).length  // Count active companies
                                            }
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            {showInactive ? "Inactive Companies" : "Active Companies"}
                                        </Typography>
                                    </Box>
                                    {showInactive
                                        ? <CancelRounded sx={{ fontSize: 40, opacity: 0.8 }} />
                                        : <CheckCircleRounded sx={{ fontSize: 40, opacity: 0.8 }} />
                                    }
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Companies Grid */}
                {filteredCompanies?.length === 0 && !loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "400px",
                            textAlign: "center",
                        }}
                    >
                        <BusinessRounded sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No companies found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first company"}
                        </Typography>
                        {!searchTerm && (
                            <Button
                                variant="contained"
                                startIcon={<AddRounded />}
                                onClick={() => handleOpenDialog( null )}
                            >
                                Create Company
                            </Button>
                        )}
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {filteredCompanies?.map( ( company ) => (
                                <Grid item xs={12} sm={6} md={4} key={company.id}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                            transition: "all 0.3s ease",
                                            border: company.isActive ? "1px solid #e0e0e0" : "1px solid #ffcdd2",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            {/* Company Header */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    mb: 3,
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: company.isActive ? "primary.main" : "error.main",
                                                            width: 50,
                                                            height: 50,
                                                            fontSize: "1.2rem",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {company.name.charAt( 0 ).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: "text.primary",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            {capitalizeFirstLetter( company.name )}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                            <Chip
                                                                label={`Company ID: ${ company.id }`}
                                                                size="small"
                                                                variant="outlined"
                                                                color="default"
                                                            />
                                                            <Chip
                                                                label={company.isActive ? "Active" : "Inactive"}
                                                                size="small"
                                                                color={company.isActive ? "success" : "error"}
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Company Details */}
                                            <Box sx={{ mb: 3, mt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>

                                                {/* Created Date */}
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <CalendarMonthRounded sx={{ fontSize: 20, color: "text.secondary" }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80, color: "text.secondary" }}>
                                                        Created:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {formatDate( company.created_at )}
                                                    </Typography>
                                                </Box>

                                                {/* Email */}
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <EmailRounded sx={{ fontSize: 20, color: "text.secondary" }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80, color: "text.secondary" }}>
                                                        Email:
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: 600, color: "text.primary", wordBreak: "break-word" }}
                                                    >
                                                        {company.email}
                                                    </Typography>
                                                </Box>

                                                {/* Address */}
                                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                    <LocationOnRounded sx={{ fontSize: 20, color: "text.secondary", mt: "2px" }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80, color: "text.secondary", mt: "2px" }}>
                                                        Address:
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "text.primary",
                                                            whiteSpace: "normal",
                                                            wordBreak: "break-word",
                                                            maxWidth: "220px",
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {company.address}
                                                    </Typography>
                                                </Box>

                                                {/* Contact Number */}
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PhoneRounded sx={{ fontSize: 20, color: "text.secondary" }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80, color: "text.secondary" }}>
                                                        Contact:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {company.contactNumber}
                                                    </Typography>
                                                </Box>

                                            </Box>


                                            {/* Action Buttons */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Tooltip title="Edit Company">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: "primary.main",
                                                                bgcolor: "action.hover",
                                                                "&:hover": { bgcolor: "primary.light", color: "white" },
                                                            }}
                                                            onClick={() => handleOpenDialog( company.id )}
                                                        >
                                                            <EditRounded fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title={company.isActive ? "Deactivate" : "Activate"}>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                color: company.isActive ? "warning.main" : "success.main",
                                                                bgcolor: "action.hover",
                                                                "&:hover": {
                                                                    bgcolor: company.isActive ? "warning.light" : "success.light",
                                                                    color: "white",
                                                                },
                                                            }}
                                                            onClick={() => handleCompanyStatusToggle( company )}
                                                        >
                                                            {company.isActive ? <CancelRounded fontSize="small" /> : <CheckCircleRounded fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                <Tooltip title="Delete Company">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: "error.main",
                                                            bgcolor: "action.hover",
                                                            "&:hover": { bgcolor: "error.light", color: "white" },
                                                        }}
                                                        onClick={() =>
                                                            setDeleteDialog( {
                                                                open: true,
                                                                companyId: company.id,
                                                                companyName: company.name,
                                                            } )
                                                        }
                                                    >
                                                        <DeleteRounded fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ) )}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </>
                )}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
            </Container>

            {/* Company Form Dialog */}
            <CompanyForm
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={handleCompanySubmit}
                companyId={selectedCompanyId}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog( { open: false, companyId: null, companyName: "" } )}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delete Company</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone. This will permanently delete the company and all associated data.
                    </Alert>
                    <Typography>
                        Are you sure you want to delete <strong>{deleteDialog.companyName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog( { open: false, companyId: null, companyName: "" } )}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteDialog.companyId && handleCompanyDelete( deleteDialog.companyId )}
                    >
                        Delete Company
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast
                alerting={toast.toastAlert}
                message={toast.toastMessage}
                severity={toast.toastSeverity}
            />
        </Box>
    );
};

export default CompanyPage;
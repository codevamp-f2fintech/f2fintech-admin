"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    IconButton,
    Dialog,
    TextField,
    Grid,
} from "@mui/material";
import { Add, Edit, Delete, Business } from "@mui/icons-material";
import { CompanyAPI } from "@/apiClient";
import { Company } from "@/types/user";

interface CompanyManagementProps {
    currentUser: any;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ( { currentUser } ) => {
    const [ companies, setCompanies ] = useState<Company[]>( [] );
    const [ openDialog, setOpenDialog ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const [ editingCompany, setEditingCompany ] = useState<Company | null>( null );

    useEffect( () => {
        loadCompanies();
    }, [] );

    const loadCompanies = async () => {
        try
        {
            const response = await CompanyAPI.getAllCompanies();
            setCompanies( response.data?.results || [] );
        } catch ( error )
        {
            console.error( "Error loading companies:", error );
        }
    };

    const handleCreateCompany = async ( companyData: { name: string; domain?: string } ) => {
        setLoading( true );
        try
        {
            await CompanyAPI.createCompany( companyData );
            await loadCompanies();
            setOpenDialog( false );
        } catch ( error )
        {
            console.error( "Error creating company:", error );
        } finally
        {
            setLoading( false );
        }
    };

    const handleDeleteCompany = async ( companyId: string ) => {
        if ( window.confirm( "Are you sure you want to delete this company?" ) )
        {
            try
            {
                await CompanyAPI.deleteCompany( companyId );
                await loadCompanies();
            } catch ( error )
            {
                console.error( "Error deleting company:", error );
            }
        }
    };

    if ( currentUser.role !== "super_admin" )
    {
        return null;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Company Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog( true )}
                >
                    Add Company
                </Button>
            </Box>

            <Grid container spacing={3}>
                {companies.map( ( company ) => (
                    <Grid item xs={12} sm={6} md={4} key={company.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Business sx={{ mr: 1 }} />
                                    <Typography variant="h6">{company.name}</Typography>
                                </Box>
                                {company.domain && (
                                    <Typography variant="body2" color="textSecondary" mb={2}>
                                        Domain: {company.domain}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                    Created: {new Date( company.created_at ).toLocaleDateString()}
                                </Typography>
                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setEditingCompany( company )}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteCompany( company.id )}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ) )}
            </Grid>

            <CompanyDialog
                open={openDialog}
                onClose={() => setOpenDialog( false )}
                onSubmit={handleCreateCompany}
                loading={loading}
                company={null}
            />

            <CompanyDialog
                open={!!editingCompany}
                onClose={() => setEditingCompany( null )}
                onSubmit={async ( data ) => {
                    if ( editingCompany )
                    {
                        await CompanyAPI.updateCompany( editingCompany.id, data );
                        setEditingCompany( null );
                        await loadCompanies();
                    }
                }}
                loading={loading}
                company={editingCompany}
            />
        </Box>
    );
};

// Company Dialog Component
const CompanyDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onSubmit: ( data: any ) => void;
    loading: boolean;
    company: Company | null;
}> = ( { open, onClose, onSubmit, loading, company } ) => {
    const [ name, setName ] = useState( company?.name || "" );
    const [ domain, setDomain ] = useState( company?.domain || "" );

    const handleSubmit = () => {
        if ( name.trim() )
        {
            onSubmit( { name: name.trim(), domain: domain.trim() || undefined } );
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <Box p={3}>
                <Typography variant="h6" mb={2}>
                    {company ? "Edit Company" : "Create Company"}
                </Typography>
                <TextField
                    fullWidth
                    label="Company Name"
                    value={name}
                    onChange={( e ) => setName( e.target.value )}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Domain (optional)"
                    value={domain}
                    onChange={( e ) => setDomain( e.target.value )}
                    margin="normal"
                    placeholder="example.com"
                />
                <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                    >
                        {company ? "Update" : "Create"}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default CompanyManagement;
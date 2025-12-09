import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    InputAdornment,
    useMediaQuery,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Business,
    Email,
    Phone,
    Language,
    LocationOn,
    Description,
} from '@mui/icons-material';
import { CompanyAPI } from '@/apis/CompanyAPI';
import type { Company } from '@/types/company';

interface CompanyFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: ( companyData: any ) => void;
    companyId: number | null;
}

interface FormData {
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    website: string;
    description: string;
    isActive: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ( { open, onClose, onSubmit, companyId } ) => {
    const [ formData, setFormData ] = useState<FormData>( {
        name: '',
        email: '',
        contactNumber: '',
        address: '',
        website: '',
        description: '',
        isActive: true,
    } );
    const [ loading, setLoading ] = useState( false );
    const [ errors, setErrors ] = useState<Partial<FormData>>( {} );

    const theme = useTheme();
    const fullScreen = useMediaQuery( theme.breakpoints.down( 'md' ) );

    useEffect( () => {
        if ( companyId && open )
        {
            fetchCompanyData();
        } else
        {
            // Reset form when creating new company
            setFormData( {
                name: '',
                email: '',
                contactNumber: '',
                address: '',
                website: '',
                description: '',
                isActive: true,
            } );
            setErrors( {} );
        }
    }, [ companyId, open ] );

    const fetchCompanyData = async () => {
        if ( !companyId ) return;

        setLoading( true );
        try
        {
            const response = await CompanyAPI.getById( companyId );
            const company = response.data || response; // Handle both response structures

            setFormData( {
                name: company.name || '',
                email: company.email || '',
                contactNumber: company.contactNumber || '',
                address: company.address || '',
                website: company.website || '',
                description: company.description || '',
                isActive: company.isActive,
            } );
        } catch ( error )
        {
            console.error( 'Error fetching company data:', error );
        } finally
        {
            setLoading( false );
        }
    };

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        const { name, value, type, checked } = e.target;
        setFormData( prev => ( {
            ...prev,
            [ name ]: type === 'checkbox' ? checked : value,
        } ) );

        // Clear error when user starts typing
        if ( errors[ name as keyof FormData ] )
        {
            setErrors( prev => ( {
                ...prev,
                [ name ]: undefined,
            } ) );
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if ( !formData.name.trim() )
        {
            newErrors.name = 'Company name is required';
        }

        if ( formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( formData.email ) )
        {
            newErrors.email = 'Please enter a valid email address';
        }

        // if ( formData.website && !/^https?:\/\/.+\..+/.test( formData.website ) )
        // {
        //     newErrors.website = 'Please enter a valid website URL';
        // }

        setErrors( newErrors );
        return Object.keys( newErrors ).length === 0;
    };

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();

        if ( !validateForm() )
        {
            return;
        }

        // Prepare the data for submission
        const submissionData = {
            name: formData.name.trim(),
            email: formData.email.trim() || undefined,
            contactNumber: formData.contactNumber.trim() || undefined,
            address: formData.address.trim() || undefined,
            website: formData.website.trim() || undefined,
            description: formData.description.trim() || undefined,
            isActive: formData.isActive,
        };

        console.log( 'Submitting company data:', submissionData );
        onSubmit( submissionData );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                <DialogTitle sx={{ p: 2 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        {companyId ? 'Edit Company' : 'Create New Company'}
                    </Typography>
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                            sx={{
                                "& > div": {
                                    gridColumn: {
                                        xs: "span 2",
                                        sm: "span 1"
                                    }
                                },
                                "& > div:last-of-type": {
                                    gridColumn: "span 2"
                                }
                            }}
                        >
                            <TextField
                                fullWidth
                                label="* Company Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Business sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                            />

                            <TextField
                                fullWidth
                                label="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                            />

                            <TextField
                                fullWidth
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                error={!!errors.website}
                                helperText={errors.website}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Language sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                                placeholder="https://example.com"
                            />

                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOn sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                                multiline
                                rows={2}
                                sx={{ gridColumn: "span 2" }}
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Description sx={{ color: "black" }} />
                                        </InputAdornment>
                                    ),
                                    style: { color: "black", fontSize: "15px" },
                                }}
                                InputLabelProps={{ style: { color: "black" } }}
                                variant="outlined"
                                multiline
                                rows={3}
                                placeholder="Brief description about the company..."
                                sx={{ gridColumn: "span 2" }}
                            />

                            <Box sx={{ gridColumn: "span 2" }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            color="primary"
                                        />
                                    }
                                    label="Active Company"
                                />
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={onClose}
                            variant="outlined"
                            color="error"
                            sx={{ width: '20%', height: '6vh' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            color={companyId ? "info" : "success"}
                            sx={{ width: '20%', height: '6vh', fontSize: '.8rem' }}
                        >
                            {loading ? 'Loading...' : companyId ? 'Update Company' : 'Create Company'}
                        </Button>
                    </DialogActions>
                </form>
            </Box>
        </Dialog>
    );
};

export default CompanyForm;
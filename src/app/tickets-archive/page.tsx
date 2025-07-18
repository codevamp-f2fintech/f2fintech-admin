"use client"
import React, { useState, useEffect } from 'react';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    FilterList as FilterIcon,
    CalendarToday as CalendarIcon,
    Person as UserIcon,
    Business as BuildingIcon,
    Phone as PhoneIcon,
    Email as MailIcon,
    Visibility as EyeIcon,
    Cached as RotateIcon,
    ChevronLeft,
    ChevronRight
} from '@mui/icons-material';
import {
    IconButton,
    Button,
    CircularProgress,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    DialogActions,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Utility } from '@/utils';

const ArchivedTicketsPage = () => {
    const [ tickets, setTickets ] = useState( [] );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalCount, setTotalCount ] = useState( 0 );
    const [ limit ] = useState( 10 );
    const [ selectedTicket, setSelectedTicket ] = useState( null );
    const [ openModal, setOpenModal ] = useState( false );
    const [ users, setUsers ] = useState( [] );

    // Filters
    const [ filters, setFilters ] = useState( {
        status: '',
        provider: '',
        name: '',
        startDate: '',
        endDate: '',
        userId: ''
    } );

    const capitalizeFirstLetter = ( string ) => {
        if ( !string ) return '';
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    };

    const fetchUsers = async () => {
        try
        {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_API_URL }/get-users?page=1&limit=100` ); // Adjust limit as needed
            const data = await response.json();

            if ( data.statusCode === 200 )
            {
                setUsers( data.data.results || data.data );
            } else
            {
                console.error( 'Failed to fetch users:', data.message );
            }
        } catch ( err )
        {
            console.error( 'Error fetching users:', err );
        }
    };

    useEffect( () => {
        fetchUsers();
    }, [] );

    // Mock API call
    const fetchArchivedTickets = async ( page = 1, appliedFilters = filters ) => {
        try
        {
            setLoading( true );

            const queryParams = new URLSearchParams( {
                page: page.toString(),
                limit: limit.toString(),
                ...( appliedFilters.status && { status: appliedFilters.status } ),
                ...( appliedFilters.provider && { provider: appliedFilters.provider } ),
                ...( appliedFilters.name && { name: appliedFilters.name } ),
                ...( appliedFilters.startDate && { startDate: appliedFilters.startDate } ),
                ...( appliedFilters.endDate && { endDate: appliedFilters.endDate } ),
            } );

            const url = `${ process.env.NEXT_PUBLIC_API_URL }/get-all-archived-tickets?${ queryParams }`

            const response = await fetch( url );
            const data = await response.json();

            if ( data.statusCode === 200 )
            {
                setTickets( data.data.results );
                setTotalPages( data.data.pages );
                setTotalCount( data.data.count );
            } else
            {
                setError( data.message || 'Failed to fetch archived tickets' );
            }
        } catch ( err )
        {
            setError( 'Error fetching archived tickets' );
            console.error( 'Error:', err );
        } finally
        {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchArchivedTickets( currentPage );
    }, [ currentPage ] );

    const getUsernameById = ( userId ) => {
        if ( !userId ) return 'System';
        const user = users.find( user => user.id === userId || user._id === userId );
        return user ? user.username || user.name || `User ${ userId }` : `User ${ userId }`;
    };

    const clearFilters = () => {
        const clearedFilters = {
            status: '',
            provider: '',
            name: '',
            startDate: '',
            endDate: '',
            userId: ''
        };
        setFilters( clearedFilters );
        setCurrentPage( 1 );
        fetchArchivedTickets( 1, clearedFilters );
    };

    const handleViewDetails = ( ticket ) => {
        setSelectedTicket( ticket );
        setOpenModal( true );
    };

    const handleCloseModal = () => {
        setOpenModal( false );
        setSelectedTicket( null );
    };

    const handleRestore = async ( archiveId ) => {
        try
        {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_API_URL }/restore-original-ticket/${ archiveId }`, {
                method: 'POST',
            } );
            const data = await response.json();

            if ( data.statusCode === 201 )
            {
                alert( 'Ticket restored successfully' );
                fetchArchivedTickets( currentPage );
            } else
            {
                alert( data.message || 'Failed to restore ticket' );
            }
        } catch ( err )
        {
            alert( 'Error restoring ticket' );
            console.error( 'Error:', err );
        }
    };

    const getStatusColor = ( status ) => {
        const statusColors = {
            'disbursed': 'success',
            'rejected': 'error',
            'pending': 'warning',
            'approved': 'info',
            'under review': 'secondary',
            'default': 'default'
        };
        return statusColors[ status?.toLowerCase() ] || statusColors.default;
    };

    const formatDate = ( dateString ) => {
        if ( !dateString ) return 'N/A';
        return new Date( dateString ).toLocaleDateString( 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        } );
    };

    const formatAmount = ( amount ) => {
        if ( !amount || amount === 'No Amount' ) return 'N/A';
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR'
        } ).format( amount );
    };

    return (
        <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Archived Tickets
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and restore your archived tickets
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <Typography variant="body2" color="text.secondary">Total Archived</Typography>
                                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                            {totalCount}
                                        </Typography>
                                    </div>
                                    <Avatar sx={{ bgcolor: 'grey.100' }}>
                                        <UserIcon color="action" />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tickets Table */}
                <Paper>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold' }}>
                            Archived Tickets
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6 }}>
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>Loading archived tickets...</Typography>
                        </Box>
                    ) : error ? (
                        <Typography color="error" align="center" sx={{ p: 3 }}>{error}</Typography>
                    ) : tickets.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ p: 3 }}>No archived tickets found</Typography>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                        <TableCell>#Archive ID</TableCell>
                                        <TableCell>Archived By</TableCell>
                                        <TableCell>Customer Info</TableCell>
                                        <TableCell>Application Details</TableCell>
                                        <TableCell>Archived Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tickets.map( ( ticket ) => (
                                        <TableRow key={ticket.archiveId} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">#{ticket.archiveId}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {getUsernameById( ticket.archiveBy )}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                                        <UserIcon color="primary" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">{ticket.customerName}</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PhoneIcon sx={{ fontSize: '14px' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {ticket.customerContact}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <MailIcon sx={{ fontSize: '14px' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {ticket.customerEmail}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{formatAmount( ticket.applicationAmount )}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tenure: {ticket.applicationTenure} years
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Provider: {ticket.applicationProvider}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{formatDate( ticket.archivedAt )}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Created: {formatDate( ticket.createdAt )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        onClick={() => handleRestore( ticket.archiveId )}
                                                        color="success"
                                                        title="Restore Ticket"
                                                    >
                                                        <RotateIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleViewDetails( ticket )}
                                                        color="primary"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Showing {( ( currentPage - 1 ) * limit ) + 1} to {Math.min( currentPage * limit, totalCount )} of {totalCount} results
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button
                                        onClick={() => setCurrentPage( prev => Math.max( 1, prev - 1 ) )}
                                        disabled={currentPage === 1}
                                        startIcon={<ChevronLeft />}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Previous
                                    </Button>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {[ ...Array( Math.min( 5, totalPages ) ) ].map( ( _, index ) => {
                                            const pageNumber = Math.max( 1, Math.min( currentPage - 2 + index, totalPages - 4 + index ) );
                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    onClick={() => setCurrentPage( pageNumber )}
                                                    variant={currentPage === pageNumber ? 'contained' : 'outlined'}
                                                    size="small"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        } )}
                                    </Box>

                                    <Button
                                        onClick={() => setCurrentPage( prev => Math.min( totalPages, prev + 1 ) )}
                                        disabled={currentPage === totalPages}
                                        endIcon={<ChevronRight />}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {selectedTicket && (
                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        py: 2,
                        px: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box display="flex" alignItems="center">
                            <Avatar sx={{
                                bgcolor: 'primary.light',
                                mr: 2,
                                width: 40,
                                height: 40
                            }}>
                                <UserIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Ticket #{selectedTicket.archiveId}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {selectedTicket.customerName}'s Application
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{ color: 'white' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers sx={{ p: 0 }}>
                        <Grid container>
                            {/* Left Section - Customer Info */}
                            <Grid item xs={12} md={5} sx={{
                                backgroundColor: 'grey.50',
                                p: 3,
                                borderRight: { md: '1px solid' },
                                borderColor: { md: 'divider' }
                            }}>
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <UserIcon fontSize="small" />
                                    Customer Details
                                </Typography>

                                <Box sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    p: 2,
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                                    mb: 3
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            alt={
                                                // Extract name after title (e.g., "Mr. John Doe" → "John Doe")
                                                capitalizeFirstLetter(
                                                    selectedTicket.customerName
                                                        .split( '.' )[ 1 ]?.trim() ||
                                                    selectedTicket.customerName.split( ' ' ).slice( 1 ).join( ' ' )
                                                )
                                            }
                                            src={
                                                Array.isArray( selectedTicket.customerProfileImage ) &&
                                                    selectedTicket.customerProfileImage.length > 0
                                                    ? selectedTicket.customerProfileImage[ 0 ]
                                                    : undefined
                                            }
                                            sx={{
                                                bgcolor: 'primary.light',
                                                color: 'primary.main',
                                                mr: 2,
                                                width: 48,
                                                height: 48,
                                                fontSize: 20,
                                                fontWeight: 'bold',
                                                border: '1px solid rgba(255,255,255,0.3)'
                                            }}
                                        >
                                            {capitalizeFirstLetter(
                                                selectedTicket.customerName
                                                    .split( '.' )[ 1 ]?.trim() ||
                                                selectedTicket.customerName.split( ' ' ).slice( 1 ).join( ' ' )
                                            ).charAt( 0 )}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {selectedTicket.customerName}
                                            </Typography>
                                            <Chip
                                                label={selectedTicket.ticketStatus}
                                                color={getStatusColor( selectedTicket.ticketStatus )}
                                                size="small"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </Box>

                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <PhoneIcon fontSize="small" color="action" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={selectedTicket.customerContact || 'Not provided'}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondary="Contact"
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <MailIcon fontSize="small" color="action" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={selectedTicket.customerEmail || 'Not provided'}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondary="Email"
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>

                                {/* Timeline Section */}
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 600,
                                    mb: 2,
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <CalendarIcon fontSize="small" />
                                    Timeline
                                </Typography>

                                <Box sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    p: 2,
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'success.main'
                                                }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={formatDate( selectedTicket.createdAt )}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondary="Created"
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'warning.main'
                                                }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={formatDate( selectedTicket.archivedAt )}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondary="Archived"
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </Grid>

                            {/* Right Section - Application Details */}
                            <Grid item xs={12} md={7} sx={{ p: 3 }}>
                                <Typography variant="subtitle1" sx={{
                                    fontWeight: 600,
                                    mb: 3,
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <BuildingIcon fontSize="small" />
                                    Application Details
                                </Typography>

                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Loan Amount
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {formatAmount( selectedTicket.applicationAmount )}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Tenure
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {selectedTicket.applicationTenure} years
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Provider
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Avatar sx={{
                                                bgcolor: 'secondary.light',
                                                color: 'secondary.main',
                                                mr: 2,
                                                width: 36,
                                                height: 36
                                            }}>
                                                <BuildingIcon fontSize="small" />
                                            </Avatar>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {selectedTicket.applicationProvider}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Additional Notes */}
                                {selectedTicket.additionalNotes && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: 600,
                                            mb: 1,
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography fontSize="small">📝</Typography>
                                            Additional Notes
                                        </Typography>
                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                    {selectedTicket.additionalNotes}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                )}
                                {/* Right Section - Application Details */}
                                <Grid item xs={12} md={7} sx={{ p: 3 }}>


                                    {/* Archived By User Section */}
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        mb: 2,
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <UserIcon fontSize="small" />
                                        Archived By
                                    </Typography>

                                    <Box sx={{
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        p: 2,
                                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                                        mb: 3
                                    }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>

                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {getUsernameById( selectedTicket.archiveBy )}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ID: #{selectedTicket.archiveBy || 'System'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>

                                        </Grid>
                                    </Box>

                                    {/* Additional Notes */}
                                    {selectedTicket.additionalNotes && (
                                        <Box>
                                            <Typography variant="subtitle1" sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Typography fontSize="small">📝</Typography>
                                                Additional Notes
                                            </Typography>
                                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                        {selectedTicket.additionalNotes}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Button
                            onClick={handleCloseModal}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                handleRestore( selectedTicket.archiveId );
                                handleCloseModal();
                            }}
                            variant="contained"
                            color="success"
                            startIcon={<RotateIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Restore Ticket
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default ArchivedTicketsPage;
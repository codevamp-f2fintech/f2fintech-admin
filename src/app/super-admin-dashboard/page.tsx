"use client";

import * as React from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Paper,
} from "@mui/material";
import {
    Business,
    People,
    Dashboard as DashboardIcon,
    Add,
    List
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Utility } from "@/utils";

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ( { title, value, icon, color, onClick } ) => (
    <Card
        sx={{
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: onClick ? 'translateY(-4px)' : 'none',
                boxShadow: onClick ? 4 : 1,
            }
        }}
        onClick={onClick}
    >
        <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        backgroundColor: color,
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

export default function SuperAdminDashboard (): React.JSX.Element {
    const router = useRouter();
    const { decodedToken } = Utility();
    const userRole = decodedToken()?.role;

    // Redirect if not super admin
    React.useEffect( () => {
        if ( userRole && userRole !== "super admin" )
        {
            router.push( "/unauthorised" );
        }
    }, [ userRole, router ] );

    // Mock data - replace with actual API calls
    const dashboardStats = {
        totalCompanies: "12",
        totalUsers: "45",
        activeCompanies: "10",
        inactiveCompanies: "2",
    };

    const quickActions = [
        {
            title: "Create Company",
            description: "Add a new company to the system",
            icon: <Business sx={{ fontSize: 40 }} />,
            action: () => router.push( "/company" ),
            color: "#1976d2"
        },
        {
            title: "Create User",
            description: "Add a new user account",
            icon: <People sx={{ fontSize: 40 }} />,
            action: () => router.push( "/users" ),
            color: "#2e7d32"
        },
        {
            title: "View Companies",
            description: "Manage all companies",
            icon: <List sx={{ fontSize: 40 }} />,
            action: () => router.push( "/company" ),
            color: "#ed6c02"
        },
        {
            title: "View Users",
            description: "Manage all users",
            icon: <People sx={{ fontSize: 40 }} />,
            action: () => router.push( "/users" ),
            color: "#9c27b0"
        },
    ];

    if ( userRole !== "super admin" )
    {
        return (
            <Container>
                <Typography variant="h4" component="h1" gutterBottom>
                    Unauthorized
                </Typography>
                <Typography>
                    You don't have permission to access this page.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Super Admin Dashboard
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    Manage companies and users across the platform
                </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Companies"
                        value={dashboardStats.totalCompanies}
                        icon={<Business sx={{ color: 'white' }} />}
                        color="#1976d2"
                        onClick={() => router.push( '/company' )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Users"
                        value={dashboardStats.totalUsers}
                        icon={<People sx={{ color: 'white' }} />}
                        color="#2e7d32"
                        onClick={() => router.push( '/users' )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Active Companies"
                        value={dashboardStats.activeCompanies}
                        icon={<Business sx={{ color: 'white' }} />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Inactive Companies"
                        value={dashboardStats.inactiveCompanies}
                        icon={<Business sx={{ color: 'white' }} />}
                        color="#d32f2f"
                    />
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Quick Actions
            </Typography>
            <Grid container spacing={3}>
                {quickActions.map( ( action, index ) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: `2px solid ${ action.color }20`,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    border: `2px solid ${ action.color }`,
                                    backgroundColor: `${ action.color }08`,
                                },
                            }}
                            onClick={action.action}
                        >
                            <Box
                                sx={{
                                    color: action.color,
                                    mb: 2,
                                }}
                            >
                                {action.icon}
                            </Box>
                            <Typography variant="h6" component="h3" gutterBottom>
                                {action.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {action.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ) )}
            </Grid>

            {/* Recent Activity Section */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Recent Activity
                </Typography>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary">
                            Recent system activities will appear here...
                        </Typography>
                        {/* You can add a list of recent activities here */}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
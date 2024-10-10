"use client";
import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Link,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  customerLength: number;
  notificationsCount: number;
  anchorEl: null | HTMLElement;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  handleMenuClose: () => void;
  isLoggedIn: boolean;
  handleLogout: () => void;
  handleLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  customerLength,
  notificationsCount,
  anchorEl,
  handleMenuClick,
  handleMenuClose,
  isLoggedIn,
  handleLogout,
  handleLogin,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        padding: "10px 20px",
        background: "linear-gradient(to right, #5e0ecc, #1a69fc)",
        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.4)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Box display="flex" alignItems="center">
        <Avatar
          src="https://www.f2fintech.com/img/F2-Fintech-logoblack.png"
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
          Total Applications: {customerLength}
        </Typography>
      </Box>

      {/* Search Input */}
      <TextField
        label="Search by Name"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: 200,
          bgcolor: "background.paper",
          marginRight: "60px",
          marginLeft: "auto",
        }}
      />

      {/* Notifications and Menu */}
      <Box display="flex" alignItems="center">
        <IconButton color="inherit" onClick={handleMenuClick}>
          <Badge badgeContent={notificationsCount} color="primary">
            <NotificationsIcon
              sx={{
                color: "#fff",
              }}
            />
          </Badge>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {isLoggedIn ? (
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          ) : (
            <MenuItem onClick={handleLogin}>Login</MenuItem>
          )}
        </Menu>

        <Button variant="contained" color="primary" sx={{ ml: 2 }} href="/home">
          Choose More Tickets
        </Button>
      </Box>
    </Box>
  );
};

export default Header;

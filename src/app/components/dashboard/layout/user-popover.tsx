import * as React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";

import { Utility } from "@/utils";
import { UserAPI } from "@/apis/UserAPI";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({
  anchorEl,
  onClose,
  open
}: UserPopoverProps): React.JSX.Element {
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const [userProfile, setUserProfile] = React.useState<object>();
  const { capitalizeFirstLetter, decodedToken } = Utility();
  const userId = decodedToken()?.id;

  const fetchUserProfile = React.useCallback(async () => {
    if (userId) {
      try {
        const { data: response } = await UserAPI.getUserProfile(userId);
        setUserProfile(response.data)
        console.log(response, "response");
        if (response.statusCode === 200) {
          const nameLength = response.data.username?.length || 0;
          const emailLength = response.data.email?.length || 0;
          const longestTextLength = Math.max(nameLength, emailLength);
          // Calculate the required width dynamically based on text length
          const requiredWidth = Math.min(
            400, // Max width
            Math.max(230, longestTextLength * 10) // Min width and dynamic scaling
          );

          if (popoverRef.current) {
            popoverRef.current.style.width = `${requiredWidth}px`;
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, [userId]);

  React.useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      document.cookie = "token=; path=/; max-age=0; secure; samesite=strict";
      location.reload();
    } catch (err) {
      console.log("Sign out error", err);
    }
  }, []);

  return (
    <Popover
      ref={popoverRef}
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            maxWidth: "400px",
            minWidth: "230px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "visible",
          },
        },
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          p: "16px 20px",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2,
          borderTopRightRadius: (theme) => theme.shape.borderRadius * 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* User Avatar */}
        <Avatar
          src={userProfile?.username}
          alt={userProfile?.username}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "gray",
          }}
        />

        {/* User Info */}
        <Box>
          {/* User Name */}
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
              width: "100%",
            }}
          >
            {capitalizeFirstLetter(userProfile?.username)}
          </Typography>

          {/* User Email */}
          <Typography
            variant="body2"
            color="inherit"
            sx={{
              opacity: 0.8,
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
              width: "100%",
            }}
          >
            {userProfile?.email}
          </Typography>

          {/* User Role */}
          <Typography
            variant="body2"
            color="inherit"
            sx={{
              opacity: 0.8,
              overflowWrap: "break-word",
              wordWrap: "break-word",
              whiteSpace: "normal",
              width: "100%",
            }}
          >
            {capitalizeFirstLetter(userProfile?.role)}
          </Typography>
        </Box>
      </Box>

      <Divider />
      <MenuList
        disablePadding
        sx={{
          p: "8px",
          "& .MuiMenuItem-root": {
            borderRadius: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.08),
              transform: "translateX(4px)",
            },
          },
        }}
      >
        <MenuItem
          onClick={handleSignOut}
          sx={{
            gap: 2,
            alignItems: "center",
            color: "error.main",
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <SignOutIcon
              fontSize="var(--icon-fontSize-md)"
              style={{ color: "currentColor", opacity: 0.7 }}
            />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}

// user-popover.tsx

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
export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover ( {
  anchorEl,
  onClose,
  open,
}: UserPopoverProps ): React.JSX.Element {
  const popoverRef = React.useRef<HTMLDivElement | null>( null );
  const [ userProfile, setUserProfile ] = React.useState( null );
  const { capitalizeFirstLetter, decodedToken } = Utility();

  // Get user info including company_id from token
  const userInfo = decodedToken();

  console.log( "User Profile:", userProfile );
  // console.log( "User Info from token:", userInfo );

  const handleSignOut = React.useCallback( async (): Promise<void> => {
    try
    {
      // Clear token cookie
      document.cookie = "token=; path=/; max-age=0; secure; samesite=strict";

      // Clear all user data cookies
      document.cookie = "userId=; path=/; max-age=0; secure; samesite=strict";
      document.cookie = "userRole=; path=/; max-age=0; secure; samesite=strict";
      document.cookie = "companyId=; path=/; max-age=0; secure; samesite=strict";
      document.cookie = "companyName=; path=/; max-age=0; secure; samesite=strict";

      // Clear localStorage
      localStorage.removeItem( 'userId' );
      localStorage.removeItem( 'companyId' );
      localStorage.removeItem( 'selectedCompanyId' );
      localStorage.removeItem( 'companyName' );
      localStorage.removeItem( 'userRole' );
      localStorage.removeItem( 'email' );

      console.log( 'All storage cleared successfully' );
      location.reload();
    } catch ( err )
    {
      console.log( "Sign out error", err );
    }
  }, [] );

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
          background: ( theme ) =>
            `linear-gradient(135deg, #0c66e4 0%, #0c66e4 100%)`,
          borderTopLeftRadius: ( theme ) => theme.shape.borderRadius * 2,
          borderTopRightRadius: ( theme ) => theme.shape.borderRadius * 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* User Avatar */}
        <Avatar
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "gray",
            color: "white",
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
            {capitalizeFirstLetter( userInfo?.username || 'User' )}
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
            {userProfile?.designation
              ? capitalizeFirstLetter( userProfile.designation )
              : capitalizeFirstLetter( userProfile?.role || userInfo?.role || 'User' )}
          </Typography>

          {/* Company Info - Add this if you want to show company */}
          {userProfile?.company?.name && (
            <Typography
              variant="body2"
              color="inherit"
              sx={{
                opacity: 0.8,
                overflowWrap: "break-word",
                wordWrap: "break-word",
                whiteSpace: "normal",
                width: "100%",
                fontStyle: 'italic',
              }}
            >
              {userProfile.company.name}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />
      <MenuList
        disablePadding
        sx={{
          backgroundColor: "#deebff",
          p: "8px",
          "& .MuiMenuItem-root": {
            borderRadius: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: ( theme ) =>
                alpha( theme.palette.primary.main, 0.08 ),
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
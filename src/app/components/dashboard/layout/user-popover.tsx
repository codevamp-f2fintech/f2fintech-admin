// user-popover.tsx — view-only profile modal, styled after reference design

"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/EmailRounded";
import BadgeIcon from "@mui/icons-material/BadgeRounded";
import WorkIcon from "@mui/icons-material/WorkRounded";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";

import { Utility } from "@/utils";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ onClose, open }: UserPopoverProps): React.JSX.Element {
  const { capitalizeFirstLetter, decodedToken } = Utility();
  const userInfo = decodedToken();

  const name = capitalizeFirstLetter(userInfo?.username || "User");
  const role = capitalizeFirstLetter(userInfo?.role || "User");
  const email = userInfo?.email || null;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((s: string) => s[0].toUpperCase())
    .slice(0, 2)
    .join("");

  const infoRows = [
    ...(email ? [{ icon: <EmailIcon sx={{ fontSize: 18 }} />, label: "Email", value: email, color: "#1976d2" }] : []),
    { icon: <BadgeIcon sx={{ fontSize: 18 }} />, label: "Username", value: name, color: "#7b1fa2" },
    { icon: <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />, label: "Role", value: role, color: "#0288d1" },
    { icon: <WorkIcon sx={{ fontSize: 18 }} />, label: "Status", value: "Active", color: "#2e7d32" },
    { icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, label: "Access", value: "Verified Member", color: "#00796b" },
  ];

  const AVATAR_SIZE = 72;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          maxWidth: 480,
        },
      }}
    >
      {/* ── Banner ── */}
      <Box
        sx={{
          bgcolor: "#3f50b5",
          position: "relative",
          flexShrink: 0,
          height: 110,
        }}
      >
        {/* subtle overlay */}
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0.04)" }} />

        {/* Profile Overview label */}
        <Typography
          sx={{
            position: "absolute",
            top: 14,
            left: 20,
            color: "rgba(255,255,255,0.85)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Profile Overview
        </Typography>

        {/* Close button */}
        <Tooltip title="Close" arrow>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.18)",
              "&:hover": { bgcolor: "#e53935", transform: "scale(1.08)" },
              transition: "all 0.2s",
              width: 28,
              height: 28,
              zIndex: 1,
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {/* Avatar — bottom edge touches banner bottom */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 24,
            zIndex: 2,
          }}
        >
          <Avatar
            sx={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              border: "4px solid white",
              background: "#3f50b5",
              fontSize: "1.6rem",
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {initials}
          </Avatar>
          {/* Active dot */}
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: "#10b981",
              border: "2px solid white",
              boxShadow: "0 0 0 2px rgba(16,185,129,0.3)",
            }}
          />
        </Box>

        {/* Name + role — beside avatar, aligned to bottom of banner */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 24 + AVATAR_SIZE + 16,
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={role}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <Typography sx={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ● Active
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: "#f5f8ff", overflowX: "hidden" }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
          <Divider sx={{ borderColor: "rgba(12,66,160,0.12)", mb: 2 }} />

          {/* ── Info cards ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {infoRows.map(({ icon, label, value, color }) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.2,
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: "white",
                  border: "1px solid rgba(12,66,160,0.08)",
                  boxShadow: "0 1px 4px rgba(12,66,160,0.06)",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 12px rgba(12,66,160,0.12)" },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: `${color}14`,
                    color: color,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#90a4ae", textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.3, fontFamily: "'Inter', sans-serif" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#1e3a5f", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
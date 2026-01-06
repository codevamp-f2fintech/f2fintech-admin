"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";
import { Utility } from "@/utils";
import { usePopover } from "@/hooks/use-popover";
import { CompanyAPI } from "@/apis/CompanyAPI";
import { useCallback, useEffect, useState } from "react";

export function AppBarNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedCompanyId");
      if (saved) setSelectedCompany(saved);
    }
  }, []);
  console.log("Selected Company ID:", selectedCompany);
  const pathname = usePathname();
  const userPopover = usePopover<HTMLDivElement>();

  const { decodedToken } = Utility();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await CompanyAPI.getAll({
        page: 1,
        limit: 100
      });

      setCompanies(res.data.results || []);
    } catch (error) {
      console.error("Failed to load companies", error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCompanyChange = (e: SelectChangeEvent) => {
    const value = e.target.value as string;
    setSelectedCompany(value);

    if (!value) {
      // ALL companies
      localStorage.removeItem("selectedCompanyId");
    } else {
      localStorage.setItem("selectedCompanyId", value);
    }

    // Dispatch a custom event with the company ID
    window.dispatchEvent(new CustomEvent('companyChanged', { detail: value }));
  };


  // Hide AppBarNav on login page
  if (pathname === "/login") return <></>;

  return (
    <React.Fragment>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid var(--mui-palette-divider)",
          backgroundImage: "linear-gradient(#c4d5eb, #c4d5eb)",
          top: 0,
          zIndex: "6",
          height: "12vh",
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', alignItems: 'center' }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              <IconButton
                onClick={(): void => {
                  setOpenNav(true);
                }}
                sx={{ display: { lg: "none" } }}
              >
                <ListIcon />
              </IconButton>

            </Stack>
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              {/* Company Selector - Left side */}
              <FormControl
                sx={{
                  minWidth: 220,
                  display: { xs: "none", sm: "block" },
                }}
                size="small"
              >
                <InputLabel
                  id="company-select-label"
                  shrink
                >
                  Aggregator
                </InputLabel>
                <Select
                  labelId="company-select-label"
                  id="company-select"
                  value={selectedCompany}
                  label="Aggregator"
                  onChange={handleCompanyChange}
                  displayEmpty
                  notched
                  fullWidth
                  sx={{
                    height: "40px",
                    backgroundColor: "white",
                    "& .MuiSelect-select": {
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 0,
                      paddingBottom: 0,
                      boxSizing: "border-box"
                    }
                  }}
                >
                  <MenuItem
                    value=""
                  >
                    All Aggregators
                  </MenuItem>
                  {companies?.map((company: any, index: number) => (
                    <MenuItem
                      key={company.id || `company-${index}`}
                      value={company.id ? company.id.toString() : ""}
                    >
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Optional: Show notifications icon */}
              {/* <Tooltip title="Notifications">
                <Badge badgeContent={4} color="success" variant="dot">
                  <IconButton sx={{ height: 40, width: 40 }}>
                    <BellIcon />
                  </IconButton>
                </Badge>
              </Tooltip> */}

              <Avatar
                onClick={userPopover.handleOpen}
                ref={userPopover.anchorRef}
                sx={{
                  cursor: "pointer",
                  height: 40,
                  width: 40
                }}
              >
                {decodedToken()?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
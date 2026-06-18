"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useGetAllAssignments } from "@/hooks/teams";
import { useGetUsers } from "@/hooks/user";
import MemberAssignModal from "./MemberAssignModal";
import Loader from "@/app/components/common/Loader";
import Toast from "@/app/components/common/Toast";
import { TeamsAPI } from "@/apis/TeamsAPI";
import { Utility } from "@/utils";

const L2_DESIGNATIONS = ['sales manager', 'relationship manager', 'growth manager', 'branch manager'];
const L1_DESIGNATIONS = ['team leader', 'sr team leader', 'ast team leader', 'atl'];

const TeamManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRole, setSelectedRole] = useState("sales");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; memberId: number | null; level: 'l1' | 'l2' | null }>({
    open: false,
    memberId: null,
    level: null,
  });

  const dispatch = useDispatch();
  const { toastAndNavigate, capitalizeFirstLetter } = Utility();

  // Fetch all assignments for the selected role
  const { value: assignmentsData, swrLoading: assignmentsLoading, refetch: refetchAssignments } = useGetAllAssignments(selectedRole);

  // Fetch all users to get full user list
  // We use page=1, limit=1000 to get all users for the management screen
  const { value: usersData, swrLoading: usersLoading } = useGetUsers("get-users", 1, 1000, 'active', '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) setSelectedRole("sales");
    if (newValue === 1) setSelectedRole("credit");
    if (newValue === 2) setSelectedRole("operations");
  };

  const users = usersData?.data?.results || [];
  const assignments = assignmentsData?.data || [];

  // Filter users by selected role
  const roleUsers = users.filter((u: any) => u.role === selectedRole);

  // Group users by designation level
  const { managers, teamLeaders, members } = useMemo(() => {
    const managers: any[] = [];
    const teamLeaders: any[] = [];
    const members: any[] = [];

    roleUsers.forEach((user: any) => {
      const designation = user.designation?.toLowerCase() || '';
      if (L2_DESIGNATIONS.includes(designation)) {
        managers.push(user);
      } else if (L1_DESIGNATIONS.includes(designation)) {
        teamLeaders.push(user);
      } else {
        members.push(user);
      }
    });

    return { managers, teamLeaders, members };
  }, [roleUsers]);

  const promptRemoveMember = (memberId: number, level: 'l1' | 'l2') => {
    setDeleteDialog({ open: true, memberId, level });
  };

  const handleRemoveMember = async () => {
    const { memberId, level } = deleteDialog;
    if (!memberId || !level) return;

    try {
      await TeamsAPI.removeMember({ memberId, level, role: selectedRole });
      toastAndNavigate(dispatch, true, "success", "Assignment removed successfully");
      refetchAssignments();
    } catch (error: any) {
      toastAndNavigate(dispatch, true, "error", error?.response?.data?.message || "Failed to remove assignment");
    } finally {
      setDeleteDialog({ open: false, memberId: null, level: null });
    }
  };

  const openAssignModal = (supervisor?: any) => {
    setSelectedSupervisor(supervisor || null);
    setIsAssignModalOpen(true);
  };

  if (usersLoading || assignmentsLoading) return <Loader />;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a2340" }}>
          Team Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openAssignModal()}
          sx={{ bgcolor: "#3f50b5", "&:hover": { bgcolor: "#303f9f" }, borderRadius: '8px' }}
        >
          Assign Member
        </Button>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: '12px' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Sales" />
          <Tab label="Credit" />
          <Tab label="Operations" />
        </Tabs>
      </Paper>

      {/* Main Hierarchy View */}
      <Grid container spacing={4}>
        {/* Managers Column */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color="primary" /> Managers (L2)
          </Typography>

          <Grid container spacing={3}>
            {managers.map((manager: any) => {
              // Find who reports to this manager
              const directReports = assignments.filter((a: any) => a.supervisor_id === manager.id && a.level === 'l2');

              return (
                <Grid item xs={12} md={6} key={manager.id}>
                  <Card sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'none' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: "#3f50b5" }}>{manager.username?.charAt(0)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{capitalizeFirstLetter(manager.username)}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{manager.designation}</Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => openAssignModal(manager)}>Assign Member
                        </Button>
                      </Box>

                      {/* Direct Reports List */}
                      {directReports.length > 0 ? (
                        <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #e2e8f0' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Direct Reports ({directReports.length})</Typography>
                          {directReports.map((report: any) => {
                            const reportUser = users.find((u: any) => u.id === report.member_id);
                            if (!reportUser) return null;
                            const isTL = L1_DESIGNATIONS.includes(reportUser.designation?.toLowerCase());

                            return (
                              <Box key={report.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <PersonIcon sx={{ color: '#eab308', fontSize: 20 }} />
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{capitalizeFirstLetter(reportUser.username)}</Typography>
                                  <Chip size="small" label={reportUser.designation} sx={{ height: 24, fontSize: '0.75rem', textTransform: 'capitalize', bgcolor: '#e2e8f0', color: '#334155', fontWeight: 500 }} />
                                </Box>
                                <Tooltip title="Delete member" arrow>
                                  <IconButton size="small" sx={{ bgcolor: '#fee2e2', color: '#ef4444', '&:hover': { bgcolor: '#fecaca' }, width: 32, height: 32 }} onClick={() => promptRemoveMember(report.member_id, 'l2')}>
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>No members assigned</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Independent Team Leaders Column */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ color: '#eab308' }} /> Team Leaders (L1)
          </Typography>

          <Grid container spacing={3}>
            {teamLeaders.map((tl: any) => {
              // Find who reports to this TL
              const directMembers = assignments.filter((a: any) => a.supervisor_id === tl.id && a.level === 'l1');
              // Check if this TL has a manager
              const tlManagerAssignment = assignments.find((a: any) => a.member_id === tl.id && a.level === 'l2');
              const tlManager = tlManagerAssignment ? users.find((u: any) => u.id === tlManagerAssignment.supervisor_id) : null;

              return (
                <Grid item xs={12} md={6} lg={4} key={tl.id}>
                  <Card sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'none', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: "#eab308" }}>{tl.username?.charAt(0)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>{capitalizeFirstLetter(tl.username)}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{tl.designation}</Typography>
                          </Box>
                        </Box>
                        <Tooltip title="Assign Member">
                          <IconButton size="small" color="primary" onClick={() => openAssignModal(tl)}><AddIcon /></IconButton>
                        </Tooltip>
                      </Box>

                      {tlManager && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#64748b', bgcolor: '#f1f5f9', p: 0.5, borderRadius: '4px' }}>
                          Reports to: {capitalizeFirstLetter(tlManager.username)}
                        </Typography>
                      )}

                      {/* Members List */}
                      {directMembers.length > 0 ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Members ({directMembers.length})</Typography>
                          {directMembers.map((report: any) => {
                            const memberUser = users.find((u: any) => u.id === report.member_id);
                            if (!memberUser) return null;

                            return (
                              <Box key={report.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <PersonIcon sx={{ color: '#eab308', fontSize: 20 }} />
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{capitalizeFirstLetter(memberUser.username)}</Typography>
                                  <Chip size="small" label={memberUser.designation} sx={{ height: 24, fontSize: '0.75rem', textTransform: 'capitalize', bgcolor: '#e2e8f0', color: '#334155', fontWeight: 500 }} />
                                </Box>
                                <Tooltip title="Delete member" arrow>
                                  <IconButton size="small" sx={{ bgcolor: '#fee2e2', color: '#ef4444', '&:hover': { bgcolor: '#fecaca' }, width: 32, height: 32 }} onClick={() => promptRemoveMember(report.member_id, 'l1')}>
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}>No members assigned</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      {/* Unassigned Members Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Other Members (L0)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {members.map((member: any) => {
            const hasL1 = assignments.some((a: any) => a.member_id === member.id && a.level === 'l1');
            const hasL2 = assignments.some((a: any) => a.member_id === member.id && a.level === 'l2');

            if (hasL1 || hasL2) return null; // Only show completely unassigned members here

            return (
              <Chip
                key={member.id}
                icon={<PersonIcon />}
                label={`${capitalizeFirstLetter(member.username)} (${member.designation})`}
                variant="outlined"
                sx={{ textTransform: 'capitalize', bgcolor: '#fff' }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <MemberAssignModal
          open={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          role={selectedRole}
          users={roleUsers}
          managers={managers}
          teamLeaders={teamLeaders}
          members={members}
          preSelectedSupervisor={selectedSupervisor}
          onSuccess={refetchAssignments}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, memberId: null, level: null })}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#1a2340' }}>Remove Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this member from the team?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, memberId: null, level: null })} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRemoveMember} variant="contained" sx={{ bgcolor: '#3f50b5', '&:hover': { bgcolor: '#303f9f' } }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Toast alerting={toast.toastAlert} message={toast.toastMessage} severity={toast.toastSeverity} /> */}
    </Box>
  );
};

export default TeamManagementPage;

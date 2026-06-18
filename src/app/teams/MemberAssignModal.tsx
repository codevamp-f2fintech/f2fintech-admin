"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { TeamsAPI } from "@/apis/TeamsAPI";
import { useDispatch } from "react-redux";
import { Utility } from "@/utils";

interface MemberAssignModalProps {
  open: boolean;
  onClose: () => void;
  role: string;
  users: any[];
  managers: any[];
  teamLeaders: any[];
  members: any[];
  preSelectedSupervisor?: any;
  onSuccess: () => void;
}

const MemberAssignModal: React.FC<MemberAssignModalProps> = ({
  open,
  onClose,
  role,
  users,
  managers,
  teamLeaders,
  members,
  preSelectedSupervisor,
  onSuccess,
}) => {
  const [supervisorId, setSupervisorId] = useState<string>("");
  const [memberId, setMemberId] = useState<string>("");
  const [level, setLevel] = useState<'l1' | 'l2' | "">("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { toastAndNavigate, capitalizeFirstLetter } = Utility();

  useEffect(() => {
    if (preSelectedSupervisor) {
      setSupervisorId(preSelectedSupervisor.id.toString());
      // Auto-determine level
      const isManager = managers.some(m => m.id === preSelectedSupervisor.id);
      setLevel(isManager ? 'l2' : 'l1');
    } else {
      setSupervisorId("");
      setLevel("");
    }
    setMemberId("");
  }, [preSelectedSupervisor, managers, open]);

  const handleSupervisorChange = (e: any) => {
    const sId = e.target.value;
    setSupervisorId(sId);
    
    // Auto-determine level
    const isManager = managers.some(m => m.id.toString() === sId);
    setLevel(isManager ? 'l2' : 'l1');
  };

  const handleSubmit = async () => {
    if (!supervisorId || !memberId || !level) return;

    setLoading(true);
    try {
      await TeamsAPI.assignMember({
        memberId: Number(memberId),
        supervisorId: Number(supervisorId),
        level: level as 'l1' | 'l2',
        role
      });
      toastAndNavigate(dispatch, true, "success", "Member assigned successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toastAndNavigate(dispatch, true, "error", error?.response?.data?.message || "Failed to assign member");
    } finally {
      setLoading(false);
    }
  };

  const allSupervisors = [...managers, ...teamLeaders];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Assign Team Member</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          
          <FormControl fullWidth size="small">
            <InputLabel>Supervisor (L1 / L2)</InputLabel>
            <Select
              value={supervisorId}
              label="Supervisor (L1 / L2)"
              onChange={handleSupervisorChange}
              disabled={!!preSelectedSupervisor}
            >
              <MenuItem value=""><em>Select Supervisor</em></MenuItem>
              {allSupervisors.map(s => (
                <MenuItem key={s.id} value={s.id.toString()}>
                  {capitalizeFirstLetter(s.username)} ({s.designation})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {level && (
            <Typography variant="caption" sx={{ mt: -2, color: 'primary.main', fontWeight: 600 }}>
              Determined Level: {level === 'l2' ? 'L2 (Manager)' : 'L1 (Team Leader)'}
            </Typography>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Member to Assign</InputLabel>
            <Select
              value={memberId}
              label="Member to Assign"
              onChange={(e) => setMemberId(e.target.value)}
            >
              <MenuItem value=""><em>Select Member</em></MenuItem>
              {/* If supervisor is L2, they can manage L1s and L0s. If L1, they can only manage L0s */}
              {level === 'l2' && teamLeaders.map(m => {
                if (m.id.toString() === supervisorId) return null; // Cannot manage self
                return (
                  <MenuItem key={m.id} value={m.id.toString()}>
                    {capitalizeFirstLetter(m.username)} ({m.designation})
                  </MenuItem>
                )
              })}
              {members.map(m => {
                if (m.id.toString() === supervisorId) return null;
                return (
                  <MenuItem key={m.id} value={m.id.toString()}>
                    {capitalizeFirstLetter(m.username)} ({m.designation})
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>

        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!supervisorId || !memberId || !level || loading}
          sx={{ bgcolor: "#3f50b5" }}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberAssignModal;

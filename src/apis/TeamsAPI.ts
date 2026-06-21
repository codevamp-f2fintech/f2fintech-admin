import { axiosInstance } from "@/apis/config/axiosConfig";
import { defineCancelApiObject } from "@/apis/config/axiosUtils";

export const TeamsAPI = {
  /** Assign a member to a supervisor */
  assignMember: async (data: { memberId: number; supervisorId: number; level: 'l1' | 'l2'; role?: string }, cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/assign`,
      method: "POST",
      data,
      signal: cancel ? cancelApiObject[TeamsAPI.assignMember.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Remove a member assignment */
  removeMember: async (data: { memberId: number; level: 'l1' | 'l2'; role?: string }, cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/remove`,
      method: "DELETE",
      data,
      signal: cancel ? cancelApiObject[TeamsAPI.removeMember.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get all members under a specific supervisor */
  getSupervisorTeam: async (supervisorId: number, level?: 'l1' | 'l2', role: string = 'sales', cancel = false) => {
    const params: any = { role };
    if (level) params.level = level;

    return await axiosInstance.request({
      url: `/teams/supervisor/${supervisorId}`,
      method: "GET",
      params,
      signal: cancel ? cancelApiObject[TeamsAPI.getSupervisorTeam.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get supervisors of a specific member */
  getMemberSupervisors: async (memberId: number, role: string = 'sales', cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/member/${memberId}`,
      method: "GET",
      params: { role },
      signal: cancel ? cancelApiObject[TeamsAPI.getMemberSupervisors.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get all team assignments */
  getAllAssignments: async (role: string = 'sales', cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/all`,
      method: "GET",
      params: { role },
      signal: cancel ? cancelApiObject[TeamsAPI.getAllAssignments.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get all subordinate members of a user */
  getMySubordinates: async (userId: number, designation: string, role: string = 'sales', cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/my-subordinates/${userId}`,
      method: "GET",
      params: { designation, role },
      signal: cancel ? cancelApiObject[TeamsAPI.getMySubordinates.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get all member IDs under a user (including their own) */
  getMyTeamMemberIds: async (userId: number, designation: string, role: string = 'sales', cancel = false) => {
    return await axiosInstance.request({
      url: `/teams/my-team-member-ids/${userId}`,
      method: "GET",
      params: { designation, role },
      signal: cancel ? cancelApiObject[TeamsAPI.getMyTeamMemberIds.name].handleRequestCancellation().signal : undefined,
    });
  },
};

const cancelApiObject = defineCancelApiObject(TeamsAPI);

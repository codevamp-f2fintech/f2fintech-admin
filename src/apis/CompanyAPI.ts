/**
 * Copyright © 2024, F2FINTECH. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of F2FINTECH., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with F2 FINTECH.
 */

import { axiosInstance } from "@/apis/config/axiosConfig";
import { defineCancelApiObject } from "@/apis/config/axiosUtils";
import type { Company, CompaniesResponse } from '@/types/company';

export const CompanyAPI = {
    /** Get all companies with pagination and filters */
    getAll: async (filters: any, cancel = false,) => {
        try {
            const response = await axiosInstance.get(`/companies`, {
                params: filters,
                signal: cancel
                    ? cancelApiObject[CompanyAPI.getAll.name].handleRequestCancellation().signal
                    : undefined
            });

            // Check the response structure - adjust based on what your backend actually returns
            if (response.data && response.data.data) {
                // If response has a data property (common pattern)
                return response.data;
            } else {
                // If response is direct
                return {
                    statusCode: response.status,
                    message: "Companies retrieved successfully",
                    data: response.data
                };
            }
        } catch (error: any) {
            console.error("API Error fetching companies:", error);
            throw error;
        }
    },

    /** Get company by ID */
    getById: async (id: number, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies/${id}`,
            method: "GET",
            signal: cancel
                ? cancelApiObject[CompanyAPI.getById.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },

    /** Create a new company */
    create: async (companyData: any, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies`,
            method: "POST",
            data: companyData,
            signal: cancel
                ? cancelApiObject[CompanyAPI.create.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },

    /** Update an existing company */
    update: async (id: number, companyData: any, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies/${id}`,
            method: "PATCH",
            data: companyData,
            signal: cancel
                ? cancelApiObject[CompanyAPI.update.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },

    /** Delete a company permanently */
    delete: async (id: string, data?: any, cancel = false) => {
        try {
            const response = await axiosInstance.request({
                url: `/companies/${id}`,
                method: "DELETE",
                data: data,
                signal: cancel
                    ? cancelApiObject[CompanyAPI.delete.name].handleRequestCancellation().signal
                    : undefined,
            });

            return response.data;

        } catch (error: any) {
            console.error('API: Delete error:', error);
            throw error;
        }
    },

    /** Deactivate a company (soft delete) */
    deactivate: async (id: number, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies/${id}/deactivate`,
            method: "PATCH",
            signal: cancel
                ? cancelApiObject[CompanyAPI.deactivate.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },

    /** Activate a company */
    activate: async (id: number, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies/${id}/activate`,
            method: "PATCH",
            signal: cancel
                ? cancelApiObject[CompanyAPI.activate.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },

    /** Get companies by status with pagination */
    getCompaniesByStatus: async (isActive: boolean, page: number = 1, limit: number = 10, cancel = false) => {
        const response = await axiosInstance.request({
            url: `/companies`,
            method: "GET",
            params: {
                isActive,
                page,
                limit
            },
            signal: cancel
                ? cancelApiObject[CompanyAPI.getCompaniesByStatus.name].handleRequestCancellation().signal
                : undefined,
        });

        return response.data; // Return the data directly for consistency
    },
};

// defining the cancel API object for CompanyAPI
const cancelApiObject: any = defineCancelApiObject(CompanyAPI);
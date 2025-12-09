// src/types/company.ts
export interface Company {
    id: number;
    name: string;
    email?: string;
    contactNumber?: string;
    address?: string;
    website?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    users?: any[];
    applications?: any[];
    tickets?: any[];
}

export interface CreateCompanyRequest {
    name: string;
    email?: string;
    contactNumber?: string;
    address?: string;
    website?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CompaniesResponse {
    results: Company[];
    count: number;
    pages: number;
}
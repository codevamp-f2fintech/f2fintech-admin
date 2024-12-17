export interface CustomerApplicationData {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  applicationAmount: string;
  applicationTenure: number;
  applicationDate: string;
  applicationId: number;
  loanStatus: string;
  customerDesignation: string;
  customerProfileImage: string;
  customerLocation: string;
  is_picked: number;
}

export interface CustomerApplication {
  results: CustomerApplicationData[];
  count: number;
  pages: number;
  errorMessage?: string;
}

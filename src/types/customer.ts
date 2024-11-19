export interface CustomerData {
  Id: number;
  Name: string;
  Email: string;
  Contact: string;
  Amount: string;
  Tenure: number;
  applicationDate: string;
  applicationId: number;
  status: string;
  Designation: string;
  Image: string;
  Location: string;
  is_picked: number;
}

export interface Customer {
  results: CustomerData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

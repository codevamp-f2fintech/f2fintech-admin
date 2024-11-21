export interface UserData {
  id: string;
  username: string;
  password: string;
  number: string;
  email: string;
  designation: string;
  gender: string;
  status: string;
  role: string;
  created_at: string;
}

export interface User {
  results: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  statusCode: number;
  message: string;
  data: {
    results: UserData[];
    count: number;
    pages: number;
  };
  errorMessage?: string;
}

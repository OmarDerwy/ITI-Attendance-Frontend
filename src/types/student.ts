export interface User {
  id: number;
  email: string;
  groups: string[];
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active?: boolean;
  tracks?: string;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface CsvStudentData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  [key: string]: string | undefined;
}

export interface StudentFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

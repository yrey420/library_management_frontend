export interface User {
  id: number;
  username: string;
  password?: string; // Opcional para respuestas de API
  email: string;
  name: string;
  phone: string;
  address: string;
  role: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: UserSummary;
}

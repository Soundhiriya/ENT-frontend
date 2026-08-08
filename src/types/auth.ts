export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    role: string;
    name: string;
}

export interface AuthMe{
    id:number;
    role:Role;
    name:string;
    email:string
}

export type Role = "ADMIN" | "DOCTOR" | "NURSE";
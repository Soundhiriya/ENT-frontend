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

// RECEPTIONIST is a synonym of NURSE — identical permissions and screens,
// separate only so front-desk staff carry an accurate job title.
export type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST";
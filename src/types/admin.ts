import { Role } from "./auth";

export interface Organization {
    id: number;
    name: string;
    type: string;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface UserManagementDto {
    id: number;
    name: string;
    email: string;
    role: Role;
    organizationName: string;
    active: boolean;
    createdAt: string;
}

export interface RegisterUserDto {
    name: string;
    email: string;
    role: Role;
    organizationName: string;
}

export interface UpdateUserDto {
    name: string;
    role: Role;
    active: boolean;
}

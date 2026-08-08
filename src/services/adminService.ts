import { Organization, RegisterUserDto, UpdateUserDto, UserManagementDto } from "../types/admin";
import { Role } from "../types/auth";
import { request } from "./api";

export async function getAllUsers(): Promise<UserManagementDto[]> {
    return request<UserManagementDto[]>("/admin/users");
}

export async function getOrganizations(): Promise<Organization[]> {
    return request<Organization[]>("/admin/getOrganizations");
}

export async function getRoles(): Promise<Role[]> {
    return request<Role[]>("/admin/getRole");
}

export async function registerUser(dto: RegisterUserDto): Promise<{ message: string }> {
    return request<{ message: string }>("/admin/register", {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/update-users/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
}

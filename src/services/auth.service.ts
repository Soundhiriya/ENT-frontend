import { request } from "./api";
import { AuthMe, LoginRequest,LoginResponse } from "../types/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response =await request<LoginResponse>("/public/login", {
            method: "POST",
            body: JSON.stringify(data),
              });
        return response;
      } catch (error) {
          throw error;
      }

    }

export async function getMe(): Promise<AuthMe> {
    return await request<AuthMe>("/admin/auth/me");
}

export async function logout(): Promise<void> {
    await request<void>("/public/logout", { method: "POST" });
}

export type ForgotPasswordPayload = {
  email: string;
};

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<string> {

  try {
    const res:string = await request("/public/forgotPassword",{
    method:"POST",
    body:JSON.stringify(payload)
    });
    return res;
  } catch (error) {
    throw error;
  }

}

interface SetPasswordPayload{
  password:string|null
  email:string|null
  token:string|null
}


export async function setPasswordRequest(payload: SetPasswordPayload): Promise<string> {

  try {
    const res:string = await request("/public/setPassword",{
    method:"POST",
    body:JSON.stringify(payload)
    });
    return res;
  } catch (error) {
    throw error;
  }

}
"use client"
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContextType } from '../types/contextTypes'
import { AuthMe } from '../types/auth';
import { request } from '../services/api';
import { usePathname } from 'next/navigation';


export const AuthContext = createContext<AuthContextType|undefined >(undefined);

type AuthProviderProps = {
    children:ReactNode;
}

export const AuthProvider = ({children} :AuthProviderProps) => {
    const[user ,setUser] = useState<AuthMe | null>(null);
    const[loading , setLoading] = useState(true);

    const pathname = usePathname();

    function loginUser(user :AuthMe){
        setUser(user);
    }
    function logoutUser(){
        setUser(null);
    }
    useEffect(() =>{
        if (
        pathname === "/" ||
        pathname.startsWith("/patient/prescription") || pathname.startsWith("/set-password")
    ) {
        setLoading(false);
        return;
    }
        async function loadUser(){
            // [AUTH-DIAG] Temporary diagnostic logging for the mobile
            // auto-logout investigation. Logging only — no behavior change,
            // and never logs tokens/cookies/headers. Remove with the rest
            // of the AUTH-DIAG logs in api.ts once the cause is found.
            console.log("[AUTH]", new Date().toISOString(), "/admin/auth/me started");
            try {
                const response = await request<AuthMe>("/admin/auth/me")
                console.log("[AUTH]", new Date().toISOString(), "/admin/auth/me succeeded");
                setUser(response);
            } catch (error: any) {
                console.log("[AUTH]", new Date().toISOString(), "/admin/auth/me failed | status:", error?.status);
                throw error;
            }finally{
                setLoading(false);
            }
        }
        loadUser();
    },[])

    return(
        <AuthContext.Provider
        value={{
            user,
            loading,
            loginUser,
            logoutUser
        }}
        >
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export default AuthProvider
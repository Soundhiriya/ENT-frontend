"use client"

import { ReactNode, useEffect } from "react"
import { useAuth } from "../Context/AuthProvider"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../components/LoadingSpinner"
import { Role } from "../types/auth"

interface RoleGaurdProps{
    allowed:Role[]
    children:ReactNode
}

export const RoleGaurd= ({allowed,children}:RoleGaurdProps) => {
    const{user,loading} = useAuth();
    const router = useRouter();

    useEffect( () => {
        if(loading)return;

        if(!user){
            router.replace("/");
        }

        if(user?.role && !allowed.includes(user?.role)){
            router.replace("/unauthorized")
        }

    },[user,loading,allowed,router])

    if(loading){
        return <LoadingSpinner/>
    }
    if (!user) {
        return null;
    }

    if (!allowed.includes(user?.role)) {
        return null;
    }

    return <>{children}</>

}
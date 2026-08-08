import { AuthMe } from "./auth";

export type AuthContextType = {
    user: AuthMe | null;
    loading: boolean;
    loginUser: (user: AuthMe) => void;
    logoutUser: () => void;
}
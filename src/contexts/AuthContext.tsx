"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface SessionUser {
    userId: number;
    email?: string;
}

interface AuthContextValue {
    user: SessionUser | null;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/session")
            .then((res) => (res.status === 401 ? fetch("/api/auth/session/refresh", { method: "POST" }) : res))
            .then((res) => (res.ok ? res.json().then((data: SessionUser) => setUser(data)) : setUser(null)))
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    const logout = useCallback(() => {
        return fetch("/api/auth/session", { method: "DELETE" })
            .finally(() => {
                setUser(null);
                router.push("/login");
            });
    }, [router]);

    return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

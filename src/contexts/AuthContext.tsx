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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function initSession() {
            try {
                let res = await fetch("/api/auth/session");

                if (res.status === 401) {
                    res = await fetch("/api/auth/session/refresh", { method: "POST" });
                }

                if (res.ok) {
                    const data: SessionUser = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        }

        initSession();
    }, []);

    const logout = useCallback(async () => {
        await fetch("/api/auth/session", { method: "DELETE" });
        setUser(null);
        router.push("/login");
    }, [router]);

    return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

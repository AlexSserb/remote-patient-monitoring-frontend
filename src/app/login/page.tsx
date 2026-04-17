"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { OtpForm } from "./components/OtpForm";
import { useLoginFlow } from "./hooks/useLoginFlow";

export default function LoginPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { step, preAuthToken, onCredentialsSuccess } = useLoginFlow();

    // Redirect already-authenticated users away from the login page
    useEffect(() => {
        if (!isLoading && user) {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    if (isLoading || user) return null;

    const title = step === "credentials" ? "Вход в систему" : "Подтверждение входа";

    return (
        <AuthCard title={title}>
            {step === "credentials" && <LoginForm onSuccess={onCredentialsSuccess} />}
            {step === "otp" && preAuthToken !== null && (
                <OtpForm
                    preAuthToken={preAuthToken}
                    onSuccess={() => router.push("/")}
                />
            )}
        </AuthCard>
    );
}

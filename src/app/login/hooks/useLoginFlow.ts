"use client";

import { useState } from "react";

type Step = "credentials" | "otp";

interface UseLoginFlowReturn {
    step: Step;
    preAuthToken: string | null;
    onCredentialsSuccess: (preAuthToken: string) => void;
}

export function useLoginFlow(): UseLoginFlowReturn {
    const [step, setStep] = useState<Step>("credentials");
    const [preAuthToken, setPreAuthToken] = useState<string | null>(null);

    const onCredentialsSuccess = (token: string) => {
        setPreAuthToken(token);
        setStep("otp");
    };

    return { step, preAuthToken, onCredentialsSuccess };
}

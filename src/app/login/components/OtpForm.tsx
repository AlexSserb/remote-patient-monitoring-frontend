"use client";

import { Alert, PinInput, Stack, Text } from "@mantine/core";
import { useVerifyOtp } from "@/hooks/useVerifyOtp";

interface OtpFormProps {
    preAuthToken: string;
    onSuccess: () => void;
}

export function OtpForm({ preAuthToken, onSuccess }: OtpFormProps) {
    const { verifyOtp, isLoading, error } = useVerifyOtp();

    function handleComplete(otp: string) {
        verifyOtp(preAuthToken, otp).then((ok) => {
            if (ok) onSuccess();
        });
    }

    return (
        <Stack gap="md" align="center">
            <Text size="sm" c="dimmed" ta="center">
                Код подтверждения отправлен на вашу почту
            </Text>
            {error && (
                <Alert color="red" variant="light" w="100%">
                    {error}
                </Alert>
            )}
            <PinInput
                length={6}
                type="number"
                disabled={isLoading}
                onComplete={handleComplete}
                aria-label="Код из письма"
            />
        </Stack>
    );
}
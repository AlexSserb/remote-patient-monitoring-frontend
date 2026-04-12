"use client";

import { Alert, Button, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useVerifyOtp } from "@/hooks/useVerifyOtp";

interface OtpFormProps {
    preAuthToken: string;
    onSuccess: () => void;
}

export function OtpForm({ preAuthToken, onSuccess }: OtpFormProps) {
    const { verifyOtp, isLoading, error } = useVerifyOtp();

    const form = useForm({
        initialValues: { otp: "" },
        validate: {
            otp: v => (v.trim().length > 0 ? null : "Введите код из письма"),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        const ok = await verifyOtp(preAuthToken, values.otp.trim());
        if (ok) onSuccess();
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                <Text
                    size="sm"
                    c="dimmed"
                    ta="center">
                    Код подтверждения отправлен на вашу почту
                </Text>
                {error && (
                    <Alert
                        color="red"
                        variant="light">
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="Код из письма"
                    placeholder="123456"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    {...form.getInputProps("otp")}
                />
                <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}>
                    Подтвердить
                </Button>
            </Stack>
        </form>
    );
}

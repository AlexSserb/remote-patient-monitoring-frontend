"use client";

import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLogin } from "@/hooks/useLogin";

interface LoginFormProps {
    onSuccess: (preAuthToken: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const { login, isLoading, error } = useLogin();

    const form = useForm({
        initialValues: { email: "", password: "" },
        validate: {
            email: v => (/^\S+@\S+\.\S+$/.test(v) ? null : "Введите корректный email"),
            password: v => (v.length > 0 ? null : "Введите пароль"),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        const preAuthToken = await login(values.email, values.password);
        if (preAuthToken) onSuccess(preAuthToken);
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                {error && (
                    <Alert
                        color="red"
                        variant="light">
                        {error}
                    </Alert>
                )}
                <TextInput
                    label="Email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...form.getInputProps("email")}
                />
                <PasswordInput
                    label="Пароль"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...form.getInputProps("password")}
                />
                <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}>
                    Войти
                </Button>
            </Stack>
        </form>
    );
}

"use client";

import { useState } from "react";
import { Button, Group, Modal, PasswordInput, PinInput, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { usePasswordReset } from "../hooks/usePasswordReset";

interface PasswordResetModalProps {
    opened: boolean;
    onClose: () => void;
}

export function PasswordResetModal({ opened, onClose }: PasswordResetModalProps) {
    const [step, setStep] = useState<"send" | "otp" | "password">("send");
    const [confirmedOtp, setConfirmedOtp] = useState("");
    const { sendOtp, resetPassword, isLoading, error, resetError } = usePasswordReset();

    const passwordForm = useForm({
        initialValues: { newPassword: "", confirmPassword: "" },
        validate: {
            newPassword: v => (v.length >= 8 ? null : "Пароль должен содержать не менее 8 символов"),
            confirmPassword: (v, values) => (v === values.newPassword ? null : "Пароли не совпадают"),
        },
    });

    function handleClose() {
        setStep("send");
        setConfirmedOtp("");
        passwordForm.reset();
        resetError();
        onClose();
    }

    function handleSend() {
        sendOtp().then(ok => {
            if (ok) setStep("otp");
        });
    }

    function handleOtpComplete(otp: string) {
        setConfirmedOtp(otp);
        setStep("password");
    }

    function handlePasswordSubmit(values: typeof passwordForm.values) {
        resetPassword(confirmedOtp, values.newPassword).then(ok => {
            if (ok) handleClose();
        });
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Сменить пароль"
            centered>
            {step === "send" && (
                <Stack gap="sm">
                    <Text
                        size="sm"
                        c="dimmed"
                        ta="center">
                        Код подтверждения будет отправлен на вашу почту
                    </Text>
                    {error && (
                        <Text
                            size="sm"
                            c="red"
                            ta="center">
                            {error}
                        </Text>
                    )}
                    <Group
                        justify="flex-end"
                        mt="xs">
                        <Button
                            variant="default"
                            onClick={handleClose}
                            disabled={isLoading}>
                            Отмена
                        </Button>
                        <Button
                            loading={isLoading}
                            onClick={handleSend}>
                            Отправить код
                        </Button>
                    </Group>
                </Stack>
            )}

            {step === "otp" && (
                <Stack
                    gap="sm"
                    align="center">
                    <Text
                        size="sm"
                        c="dimmed"
                        ta="center">
                        Введите код из письма
                    </Text>
                    <PinInput
                        length={6}
                        type="number"
                        disabled={isLoading}
                        onComplete={handleOtpComplete}
                        aria-label="Код подтверждения"
                    />
                    {error && (
                        <Text
                            size="sm"
                            c="red"
                            ta="center">
                            {error}
                        </Text>
                    )}
                    <Button
                        variant="subtle"
                        size="xs"
                        disabled={isLoading}
                        onClick={() => {
                            setStep("send");
                            resetError();
                        }}>
                        Отправить код повторно
                    </Button>
                </Stack>
            )}

            {step === "password" && (
                <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                    <Stack gap="sm">
                        <PasswordInput
                            label="Новый пароль"
                            {...passwordForm.getInputProps("newPassword")}
                        />
                        <PasswordInput
                            label="Повторите пароль"
                            {...passwordForm.getInputProps("confirmPassword")}
                        />
                        {error && (
                            <Text
                                size="sm"
                                c="red">
                                {error}
                            </Text>
                        )}
                        <Group
                            justify="flex-end"
                            mt="xs">
                            <Button
                                variant="default"
                                onClick={handleClose}
                                disabled={isLoading}>
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                loading={isLoading}>
                                Сохранить
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </Modal>
    );
}

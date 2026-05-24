"use client";

import { useState } from "react";
import { Button, Group, Modal, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEmailChange } from "../hooks/useEmailChange";

interface EmailChangeModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmailChangeModal({ opened, onClose, onSuccess }: EmailChangeModalProps) {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [pendingEmail, setPendingEmail] = useState("");
    const { requestChange, verifyChange, isLoading, error, resetError } = useEmailChange();

    const emailForm = useForm({
        initialValues: { newEmail: "" },
        validate: {
            newEmail: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Введите корректный email"),
        },
    });

    function handleClose() {
        setStep("email");
        emailForm.reset();
        resetError();
        onClose();
    }

    function handleEmailSubmit(values: { newEmail: string }) {
        requestChange(values.newEmail).then(ok => {
            if (ok) {
                setPendingEmail(values.newEmail);
                setStep("otp");
            }
        });
    }

    function handleOtpComplete(otp: string) {
        verifyChange(otp).then(ok => {
            if (ok) {
                onSuccess();
                handleClose();
            }
        });
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Изменить почту"
            centered>
            {step === "email" ? (
                <form onSubmit={emailForm.onSubmit(handleEmailSubmit)}>
                    <Stack gap="sm">
                        <TextInput
                            label="Новый email"
                            type="email"
                            placeholder="example@mail.com"
                            {...emailForm.getInputProps("newEmail")}
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
                                Отправить код
                            </Button>
                        </Group>
                    </Stack>
                </form>
            ) : (
                <Stack
                    gap="sm"
                    align="center">
                    <Text
                        size="sm"
                        c="dimmed"
                        ta="center">
                        Код подтверждения отправлен на{" "}
                        <Text
                            component="span"
                            fw={500}
                            c="dark">
                            {pendingEmail}
                        </Text>
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
                            setStep("email");
                            resetError();
                        }}>
                        Изменить email
                    </Button>
                </Stack>
            )}
        </Modal>
    );
}

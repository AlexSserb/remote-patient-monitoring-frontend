"use client";

import {useEffect} from "react";
import {Button, Group, Modal, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useUpdateProfile} from "../hooks/useUpdateProfile";

interface EditNameModalProps {
    opened: boolean;
    firstName: string;
    lastName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditNameModal({opened, firstName, lastName, onClose, onSuccess}: EditNameModalProps) {
    const {updateProfile, isLoading, error} = useUpdateProfile();

    const form = useForm({
        initialValues: {firstName, lastName},
        validate: {
            firstName: v => (v.trim().length === 0 ? "Введите имя" : null),
            lastName: v => (v.trim().length === 0 ? "Введите фамилию" : null),
        },
    });

    // Sync form values when modal opens with fresh data
    useEffect(() => {
        if (opened) {
            form.setValues({firstName, lastName});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, firstName, lastName]);

    function handleSubmit(values: typeof form.values) {
        updateProfile(values).then(ok => {
            if (ok) {
                onSuccess();
                onClose();
            }
        }).catch(err => console.error(err));
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Редактировать профиль"
            centered>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="sm">
                    <TextInput
                        label="Имя"
                        {...form.getInputProps("firstName")}
                    />
                    <TextInput
                        label="Фамилия"
                        {...form.getInputProps("lastName")}
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
                            onClick={onClose}
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
        </Modal>
    );
}

"use client";

import { useEffect } from "react";
import { Alert, Button, Center, Loader, NumberInput, Stack, Switch, Textarea, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { DiaryEntryInfo, DiaryEntryValueCreate, DiaryField } from "@/client/types.gen";

type FormValues = Record<string, number | string | boolean | null>;

interface DiaryFormProps {
    fields: DiaryField[];
    fieldsLoading: boolean;
    fieldsError: string | null;
    editingEntry: DiaryEntryInfo | null;
    onSubmitSuccess: () => void;
    onCancelEdit: () => void;
}

function buildInitialValues(fields: DiaryField[]): FormValues {
    return Object.fromEntries(fields.map(f => [f.code, f.type === "boolean" ? null : f.type === "number" ? null : ""]));
}

function buildValidators(fields: DiaryField[]) {
    return Object.fromEntries(
        fields.map(f => [
            f.code,
            (value: number | string | boolean | null) => {
                if (f.isRequired && (value === null || value === "")) {
                    return "Обязательное поле";
                }
                if (f.type === "number" && value !== null && value !== "") {
                    const num = Number(value);
                    if (f.minValue !== null && num < f.minValue) {
                        return `Минимум: ${f.minValue}`;
                    }
                    if (f.maxValue !== null && num > f.maxValue) {
                        return `Максимум: ${f.maxValue}`;
                    }
                }
                return null;
            },
        ])
    );
}

function entryToFormValues(entry: DiaryEntryInfo, fields: DiaryField[]): FormValues {
    const base = buildInitialValues(fields);
    for (const v of entry.values) {
        if (v.metricType === "number") base[v.metricCode] = v.valueNumber ?? null;
        else if (v.metricType === "boolean") base[v.metricCode] = v.valueBoolean ?? null;
        else base[v.metricCode] = v.valueText ?? "";
    }
    return base;
}

function formValuesToPayload(values: FormValues, fields: DiaryField[]): DiaryEntryValueCreate[] {
    return fields
        .filter(f => values[f.code] !== null && values[f.code] !== "")
        .map(f => {
            const raw = values[f.code];
            return {
                metricId: f.id,
                valueNumber: f.type === "number" ? (raw as number) : null,
                valueText: f.type === "text" ? (raw as string) : "",
                valueBoolean: f.type === "boolean" ? (raw as boolean) : null,
            };
        });
}

export function DiaryForm({
    fields,
    fieldsLoading,
    fieldsError,
    editingEntry,
    onSubmitSuccess,
    onCancelEdit,
}: DiaryFormProps) {
    const isEditing = editingEntry !== null;

    const form = useForm<FormValues>({
        initialValues: buildInitialValues(fields),
        validate: buildValidators(fields),
    });

    // Пересобираем форму при смене набора полей или выбранной записи
    useEffect(() => {
        if (fields.length === 0) return;
        const next = isEditing ? entryToFormValues(editingEntry, fields) : buildInitialValues(fields);
        form.setValues(next);
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields, editingEntry]);

    function handleSubmit(values: FormValues) {
        const payload = { values: formValuesToPayload(values, fields) };

        const url = isEditing ? `/api/diary-entries/${editingEntry.id}` : "/api/diary-entries";
        const method = isEditing ? "PATCH" : "POST";

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then(() => {
                form.setValues(buildInitialValues(fields));
                onSubmitSuccess();
            })
            .catch(() => {
                form.setErrors({ _form: "Ошибка при сохранении записи." } as never);
            });
    }

    if (fieldsLoading) {
        return (
            <Center h={200}>
                <Loader />
            </Center>
        );
    }

    if (fieldsError) {
        return <Alert color="red">{fieldsError}</Alert>;
    }

    if (fields.length === 0) {
        return (
            <Center h={200}>
                <Text c="dimmed">Нет полей дневника. Обратитесь к врачу.</Text>
            </Center>
        );
    }

    return (
        <Stack gap="md">
            <Title order={4}>{isEditing ? "Редактирование записи" : "Новая запись"}</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="sm">
                    {fields.map(field => {
                        const key = field.code;
                        const label = field.unit ? `${field.name} (${field.unit})` : field.name;

                        if (field.type === "number") {
                            return (
                                <NumberInput
                                    key={key}
                                    label={label}
                                    required={field.isRequired}
                                    min={field.minValue ?? undefined}
                                    max={field.maxValue ?? undefined}
                                    decimalScale={2}
                                    value={(form.values[key] as number | null | "") ?? ""}
                                    onChange={val => form.setFieldValue(key, val === "" ? null : val)}
                                    error={form.errors[key]}
                                />
                            );
                        }

                        if (field.type === "boolean") {
                            return (
                                <Switch
                                    key={key}
                                    label={label}
                                    checked={(form.values[key] as boolean | null) ?? false}
                                    onChange={e => form.setFieldValue(key, e.currentTarget.checked)}
                                    error={form.errors[key]}
                                />
                            );
                        }

                        return (
                            <Textarea
                                key={key}
                                label={label}
                                required={field.isRequired}
                                value={(form.values[key] as string) ?? ""}
                                onChange={e => form.setFieldValue(key, e.currentTarget.value)}
                                error={form.errors[key]}
                                autosize
                                minRows={2}
                            />
                        );
                    })}

                    <Button
                        type="submit"
                        mt="xs">
                        {isEditing ? "Сохранить" : "Добавить запись"}
                    </Button>

                    {isEditing && (
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={onCancelEdit}>
                            Отмена
                        </Button>
                    )}
                </Stack>
            </form>
        </Stack>
    );
}

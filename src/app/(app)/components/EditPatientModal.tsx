"use client";

import { useEffect } from "react";
import { Button, Group, Modal, MultiSelect, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { PatientListItem } from "@/client/types.gen";
import { useEditPatient } from "../hooks/useEditPatient";
import { useDiagnosesOptions, useDoctorsOptions } from "../hooks/useFilterOptions";

interface EditPatientModalProps {
    opened: boolean;
    patient: PatientListItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditPatientModal({ opened, patient, onClose, onSuccess }: EditPatientModalProps) {
    const { editPatient, isLoading, error } = useEditPatient();
    const { options: doctorOptions, isLoading: doctorOptionsLoading } = useDoctorsOptions();
    const { options: diagnosisOptions, isLoading: diagnosisOptionsLoading } = useDiagnosesOptions();

    const form = useForm({
        initialValues: {
            diagnoses: [] as string[],
            doctors: [] as string[],
        },
    });

    useEffect(() => {
        if (opened && patient) {
            form.setValues({
                diagnoses: patient.diagnoses.map(d => String(d.id)),
                doctors: patient.doctors.map(d => String(d.id)),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, patient]);

    function handleSubmit(values: typeof form.values) {
        if (!patient) return;

        editPatient(patient.id, {
            diagnoses: values.diagnoses.map(Number),
            doctors: values.doctors.map(Number),
        }).then(ok => {
            if (ok) {
                onSuccess();
                onClose();
            }
        });
    }

    const title = patient ? `Пациент ${patient.lastName} ${patient.firstName}` : "Редактировать пациента";

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="sm">
                    <MultiSelect
                        label="Диагнозы"
                        data={diagnosisOptions}
                        disabled={diagnosisOptionsLoading}
                        searchable
                        clearable
                        {...form.getInputProps("diagnoses")}
                    />
                    <MultiSelect
                        label="Доктора"
                        data={doctorOptions}
                        disabled={doctorOptionsLoading}
                        searchable
                        clearable
                        {...form.getInputProps("doctors")}
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

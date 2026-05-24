"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import type { PatientListItem } from "@/client/types.gen";

interface EditPatientButtonProps {
    patient: PatientListItem;
    onClick: (patient: PatientListItem) => void;
}

export function EditPatientButton({ patient, onClick }: EditPatientButtonProps) {
    return (
        <Tooltip label="Редактировать пациента">
            <ActionIcon
                variant="light"
                onClick={() => onClick(patient)}
                aria-label="Редактировать пациента">
                <IconEdit />
            </ActionIcon>
        </Tooltip>
    );
}

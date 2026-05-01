"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconNotebook } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface DiaryButtonProps {
    patientId: number;
}

export function DiaryButton({ patientId }: DiaryButtonProps) {
    const router = useRouter();
    return (
        <Tooltip label="Дневник пациента">
            <ActionIcon
                variant="light"
                color="blue"
                onClick={() => router.push(`/patient-diary/${patientId}`)}
                aria-label="Дневник пациента">
                <IconNotebook />
            </ActionIcon>
        </Tooltip>
    );
}

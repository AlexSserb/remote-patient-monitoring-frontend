"use client";

import { useState } from "react";
import { Button, Grid, Group, ScrollArea, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { DiaryForm } from "./DiaryForm";
import { DiaryEntriesList } from "./DiaryEntriesList";
import { useDiaryFields } from "../hooks/useDiaryFields";
import { useDiaryEntries } from "../hooks/useDiaryEntries";
import { usePatientStreak } from "../hooks/usePatientStreak";
import type { DiaryEntryInfo } from "@/client/types.gen";

interface PatientDashboardProps {
    patientId?: number;
}

export function PatientDashboard({ patientId }: PatientDashboardProps = {}) {
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingEntry, setEditingEntry] = useState<DiaryEntryInfo | null>(null);

    const { fields, isLoading: fieldsLoading, error: fieldsError } = useDiaryFields(patientId);
    const { entries, isLoading: entriesLoading, error: entriesError } = useDiaryEntries(refreshKey, patientId);
    const { streak } = usePatientStreak(patientId, refreshKey);

    function handleSubmitSuccess() {
        setEditingEntry(null);
        setRefreshKey(k => k + 1);
    }

    function handleDelete(entryId: number) {
        const query = patientId !== undefined ? `?patient_id=${patientId}` : "";
        fetch(`/api/diary-entries/${entryId}${query}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    if (editingEntry?.id === entryId) setEditingEntry(null);
                    setRefreshKey(k => k + 1);
                }
            })
            .catch(() => {});
    }

    return (
        <Grid
            px="xl"
            pt="sm"
            pb="xs"
            style={{ height: "calc(100vh - var(--app-shell-header-height, 60px))" }}>
            {/* Левая панель — форма */}
            <Grid.Col
                span={{ base: 12, md: 5 }}
                style={{ display: "flex", flexDirection: "column" }}>
                <Group
                    mb="md"
                    align="center"
                    gap="md">
                    {patientId !== undefined && (
                        <Button
                            variant="outline"
                            onClick={() => router.back()}>
                            <IconArrowLeft />
                        </Button>
                    )}
                    <Title order={2}>Дневник наблюдений</Title>
                </Group>
                <ScrollArea style={{ flex: 1 }}>
                    <DiaryForm
                        fields={fields}
                        fieldsLoading={fieldsLoading}
                        fieldsError={fieldsError}
                        editingEntry={editingEntry}
                        onSubmitSuccess={handleSubmitSuccess}
                        onCancelEdit={() => setEditingEntry(null)}
                        patientId={patientId}
                    />
                </ScrollArea>
            </Grid.Col>

            {/* Правая панель — список записей */}
            <Grid.Col
                span={{ base: 12, md: 7 }}
                style={{ display: "flex", flexDirection: "column" }}>
                <ScrollArea style={{ flex: 1 }}>
                    <DiaryEntriesList
                        entries={entries}
                        isLoading={entriesLoading}
                        error={entriesError}
                        selectedEntryId={editingEntry?.id ?? null}
                        onSelect={setEditingEntry}
                        onDelete={handleDelete}
                        streak={streak}
                    />
                </ScrollArea>
            </Grid.Col>
        </Grid>
    );
}

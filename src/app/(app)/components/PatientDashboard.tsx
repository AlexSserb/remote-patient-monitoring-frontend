"use client";

import { useState } from "react";
import { Grid, ScrollArea, Title } from "@mantine/core";
import { DiaryForm } from "./DiaryForm";
import { DiaryEntriesList } from "./DiaryEntriesList";
import { useDiaryFields } from "../hooks/useDiaryFields";
import { useDiaryEntries } from "../hooks/useDiaryEntries";
import type { DiaryEntryInfo } from "@/client/types.gen";

export function PatientDashboard() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingEntry, setEditingEntry] = useState<DiaryEntryInfo | null>(null);

    const { fields, isLoading: fieldsLoading, error: fieldsError } = useDiaryFields();
    const { entries, isLoading: entriesLoading, error: entriesError } = useDiaryEntries(refreshKey);

    function handleSubmitSuccess() {
        setEditingEntry(null);
        setRefreshKey(k => k + 1);
    }

    function handleDelete(entryId: number) {
        fetch(`/api/diary-entries/${entryId}`, { method: "DELETE" })
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
                <Title
                    order={2}
                    mb="md">
                    Дневник наблюдений
                </Title>
                <ScrollArea style={{ flex: 1 }}>
                    <DiaryForm
                        fields={fields}
                        fieldsLoading={fieldsLoading}
                        fieldsError={fieldsError}
                        editingEntry={editingEntry}
                        onSubmitSuccess={handleSubmitSuccess}
                        onCancelEdit={() => setEditingEntry(null)}
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
                    />
                </ScrollArea>
            </Grid.Col>
        </Grid>
    );
}

"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Center,
    Group,
    Loader,
    Modal,
    Pagination,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure, useMediaQuery } from "@mantine/hooks";
import type { RoleEnum } from "@/client/types.gen";
import { type HasCaregiverFilter, usePatientsPage } from "../hooks/usePatientsPage";

const PAGE_SIZE_DESKTOP = 20;
const PAGE_SIZE_MOBILE = 7;

const HAS_CAREGIVER_OPTIONS = [
    { value: "all", label: "Все" },
    { value: "yes", label: "Есть опекун/родственник" },
    { value: "no", label: "Нет опекуна/родственника" },
];

// Дефолтные значения фильтров — сброс возвращает к ним же
const FILTER_DEFAULTS: FilterDraft = { attached: true, hasCaregiver: "all" };

interface PatientsTableProps {
    role: RoleEnum;
}

interface FilterDraft {
    attached: boolean;
    hasCaregiver: HasCaregiverFilter;
}

export function PatientsTable({ role }: PatientsTableProps) {
    // Применённые фильтры (по умолчанию — только свои пациенты)
    const [attached, setAttached] = useState(FILTER_DEFAULTS.attached);
    const [hasCaregiver, setHasCaregiver] = useState<HasCaregiverFilter>(FILTER_DEFAULTS.hasCaregiver);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    // Задержка 400 мс перед отправкой запроса, чтобы не бомбить сервер при вводе
    const [debouncedSearch] = useDebouncedValue(searchInput, 400);

    // Черновик фильтров внутри модалки (инициализируется при открытии)
    const [draft, setDraft] = useState<FilterDraft>(FILTER_DEFAULTS);
    const [filtersOpened, { open: openFilters, close: closeFilters }] = useDisclosure(false);

    // На мобильных показываем 7 строк, на десктопе — 20
    // useMediaQuery возвращает undefined до гидратации, поэтому fallback — десктоп
    const isMobile = useMediaQuery("(max-width: 768px)") ?? false;
    const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

    // Сбрасываем на первую страницу при смене размера страницы
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    // Опекун всегда видит только своих пациентов
    const effectiveAttached = role === "caregiver" ? true : attached;

    const { patients, total, isLoading, error } = usePatientsPage({
        attached: effectiveAttached,
        hasCaregiver,
        search: debouncedSearch,
        page,
        pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    function handleOpenFilters() {
        // Инициализировать черновик текущими значениями при открытии
        setDraft({ attached, hasCaregiver });
        openFilters();
    }

    function handleApplyFilters() {
        setAttached(draft.attached);
        setHasCaregiver(draft.hasCaregiver);
        setPage(1);
        closeFilters();
    }

    function handleResetFilters() {
        setDraft(FILTER_DEFAULTS);
        setAttached(FILTER_DEFAULTS.attached);
        setHasCaregiver(FILTER_DEFAULTS.hasCaregiver);
        setSearchInput("");
        setPage(1);
        closeFilters();
    }

    function handleSearchChange(value: string) {
        setSearchInput(value);
        setPage(1);
    }

    const rows = patients.map((patient) => {
        const dateJoined = new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(patient.date_joined));

        return (
            <Table.Tr key={patient.id}>
                <Table.Td>{patient.last_name}</Table.Td>
                <Table.Td>{patient.first_name}</Table.Td>
                <Table.Td>{patient.email}</Table.Td>
                <Table.Td ta="center">{patient.caregiver_count}</Table.Td>
                <Table.Td>{dateJoined}</Table.Td>
            </Table.Tr>
        );
    });

    return (
        <>
            {/* Модалка фильтров */}
            <Modal opened={filtersOpened} onClose={closeFilters} title="Фильтры" size="sm">
                <Stack gap="md">
                    {role === "doctor" && (
                        <Switch
                            label="Только мои пациенты"
                            checked={draft.attached}
                            onChange={(e) => {
                                // Значение нужно извлечь до передачи в функциональное обновление,
                                // так как после завершения обработчика currentTarget становится null
                                const checked = e.currentTarget.checked;
                                setDraft((d) => ({ ...d, attached: checked }));
                            }}
                        />
                    )}
                    <Select
                        label="Опекун/родственник"
                        data={HAS_CAREGIVER_OPTIONS}
                        value={draft.hasCaregiver}
                        onChange={(v) =>
                            setDraft((d) => ({ ...d, hasCaregiver: (v as HasCaregiverFilter) ?? "all" }))
                        }
                        allowDeselect={false}
                    />
                    <Group justify="space-between" mt="xs">
                        <Button variant="subtle" color="gray" onClick={handleResetFilters}>
                            Сбросить
                        </Button>
                        <Button onClick={handleApplyFilters}>Применить</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Основной layout: занимает полную высоту viewport ниже шапки */}
            <Stack
                gap={0}
                style={{
                    height: "calc(100vh - var(--app-shell-header-height, 60px))",
                    display: "flex",
                    flexDirection: "column",
                }}
                px="xl"
                pt="sm"
                pb="xs"
            >
                {/* Заголовок + кнопка фильтров */}
                <Group justify="space-between" mb="xs">
                    <Title order={2}>Пациенты</Title>
                    <Button variant="light" onClick={handleOpenFilters}>
                        Фильтры
                    </Button>
                </Group>

                {/* Поиск по имени, фамилии и email */}
                <TextInput
                    placeholder="Поиск по имени, фамилии или email…"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    mb="sm"
                />

                {error && (
                    <Alert color="red" mb="sm">
                        {error}
                    </Alert>
                )}

                {/* Область таблицы — занимает всё свободное пространство */}
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {isLoading ? (
                        <Center h="100%">
                            <Loader />
                        </Center>
                    ) : patients.length === 0 ? (
                        <Center h="100%">
                            <Text c="dimmed">Пациенты не найдены</Text>
                        </Center>
                    ) : (
                        <Table striped highlightOnHover withTableBorder stickyHeader>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Фамилия</Table.Th>
                                    <Table.Th>Имя</Table.Th>
                                    <Table.Th>Email</Table.Th>
                                    <Table.Th ta="center">Опекунов</Table.Th>
                                    <Table.Th>Дата регистрации</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    )}
                </div>

                {/* Нижняя строка: счётчик и пагинация */}
                <Group justify="space-between" align="center" pt="xs">
                    <Text size="sm" c="dimmed">
                        Всего: {total}
                    </Text>
                    <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
                </Group>
            </Stack>
        </>
    );
}

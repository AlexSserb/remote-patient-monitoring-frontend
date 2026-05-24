"use client";

import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";

interface DateRangeFilterProps {
    dateFrom: Date;
    dateTo: Date;
    onChangeDateFrom: (d: Date) => void;
    onChangeDateTo: (d: Date) => void;
}

export function DateRangeFilter({ dateFrom, dateTo, onChangeDateFrom, onChangeDateTo }: DateRangeFilterProps) {
    // onChange gives ISO string in @mantine/dates v9; convert back to Date for parent state
    return (
        <>
            <DatePickerInput
                label="Начало периода"
                value={dateFrom}
                onChange={d => d && onChangeDateFrom(new Date(d))}
                maxDate={dateTo}
                valueFormat="DD.MM.YYYY"
            />
            <DatePickerInput
                label="Конец периода"
                value={dateTo}
                onChange={d => d && onChangeDateTo(new Date(d))}
                minDate={dateFrom}
                maxDate={new Date()}
                valueFormat="DD.MM.YYYY"
            />
        </>
    );
}

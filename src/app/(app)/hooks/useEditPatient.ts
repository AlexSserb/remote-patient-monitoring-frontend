"use client";

import { useState } from "react";

interface EditPatientPayload {
    diagnoses: number[];
    doctors: number[];
}

interface UseEditPatientReturn {
    editPatient: (patientId: number, payload: EditPatientPayload) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

export function useEditPatient(): UseEditPatientReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editPatient = (patientId: number, payload: EditPatientPayload): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        return fetch(`/api/patients/${patientId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) {
                    setError("Не удалось сохранить изменения. Попробуйте позже.");
                    return false;
                }
                return true;
            })
            .catch(() => {
                setError("Ошибка соединения. Попробуйте позже.");
                return false;
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return { editPatient, isLoading, error };
}

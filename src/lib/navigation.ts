import type { ComponentType } from "react";

// Compatible with @tabler/icons-react icon components
export interface NavItem {
    label: string;
    href: string;
    icon: ComponentType<{ size?: number | string; stroke?: number }>;
}

export type UserRole = "doctor" | "patient" | "caregiver";

// Navigation items shown to doctors
export const doctorNavItems: NavItem[] = [];

// Navigation items shown to patients
export const patientNavItems: NavItem[] = [];

// Navigation items shown to caregivers
export const caregiverNavItems: NavItem[] = [];

export const navItemsByRole: Record<UserRole, NavItem[]> = {
    doctor: doctorNavItems,
    patient: patientNavItems,
    caregiver: caregiverNavItems,
};

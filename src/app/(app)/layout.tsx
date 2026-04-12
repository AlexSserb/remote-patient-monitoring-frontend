import { AppShellLayout } from "@/components/layout/AppShellLayout";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return <AppShellLayout>{children}</AppShellLayout>;
}
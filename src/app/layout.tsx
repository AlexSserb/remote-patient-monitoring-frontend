import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerInit } from "@/components/ServiceWorkerInit";

export const metadata: Metadata = {
    title: "Мониторинг пациентов",
    description: "Удалённый мониторинг пациентов с эндокринными заболеваниями",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="ru"
            suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="auto" />
            </head>
            <body>
                <MantineProvider defaultColorScheme="auto">
                    <Notifications position="top-right" />
                    <AuthProvider>
                        <ServiceWorkerInit />
                        {children}
                    </AuthProvider>
                </MantineProvider>
            </body>
        </html>
    );
}

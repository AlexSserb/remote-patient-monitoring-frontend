import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { AuthProvider } from "@/contexts/AuthContext";

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
                    <AuthProvider>{children}</AuthProvider>
                </MantineProvider>
            </body>
        </html>
    );
}

import { cookies } from "next/headers";
import { AppShellLayout } from "@/components/layout/AppShellLayout";
import { decodeJwtPayload } from "@/lib/jwt";
import { usersRetrieve } from "@/client/sdk.gen";
import type { RoleEnum } from "@/client/types.gen";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    let role: RoleEnum | undefined;

    if (accessToken) {
        try {
            const payload = decodeJwtPayload(accessToken);
            const { data: profile } = await usersRetrieve({
                path: { userId: payload.user_id },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            role = profile?.role;
        } catch {
            // Not authenticated — individual page components handle the redirect
        }
    }

    return <AppShellLayout role={role}>{children}</AppShellLayout>;
}

import { navItemsByRole, type NavItem, type UserRole } from "@/lib/navigation";

// Returns navigation items for the given role.
// Pass the role resolved from the user session after login.
export function useNavItems(role: UserRole | undefined): NavItem[] {
    if (!role) return [];
    return navItemsByRole[role];
}

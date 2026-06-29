import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FeatureKey, allFeatureKeys } from "@/lib/constants";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export function parsePermissions(permissions?: string | null) {
  if (!permissions) return [];
  try {
    const parsed = JSON.parse(permissions);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return permissions.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

export function serializePermissions(permissions: string[]) {
  return JSON.stringify([...new Set(permissions)]);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const userId = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });
  if (!user) return null;
  return { ...user, permissions: parsePermissions(user.permissions) };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function canWrite(role: string) {
  return role === "ADMINISTRADOR" || role === "COORDENACAO_ADMINISTRATIVA";
}

export function canAccess(user: CurrentUser | null, feature: FeatureKey) {
  if (!user) return false;
  if (user.role === "ADMINISTRADOR") return true;
  return user.permissions.includes(feature);
}

export async function requireFeature(feature: FeatureKey) {
  const user = await requireUser();
  if (!canAccess(user, feature)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMINISTRADOR") redirect("/");
  return user;
}

export async function requireWriteAccess() {
  const user = await requireUser();
  if (!canWrite(user.role)) {
    throw new Error("Seu perfil não tem permissão para alterar dados.");
  }
  return user;
}

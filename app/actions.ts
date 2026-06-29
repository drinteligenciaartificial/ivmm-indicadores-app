"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { requireAdmin, requireWriteAccess, requireUser, serializePermissions } from "@/lib/auth";
import { booleanValue, numberValue, optionalNumber, optionalValue, value } from "@/lib/forms";
import { calculateAchievement, getTrafficLight } from "@/lib/kpi";
import { COLLECTION_OWNER } from "@/lib/constants";
import { hashPassword, passwordNeedsUpgrade, verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

function indicatorData(formData: FormData) {
  return {
    code: value(formData, "code"),
    name: value(formData, "name"),
    area: value(formData, "area"),
    responsiblePrimary: COLLECTION_OWNER,
    responsibleSecondary: optionalValue(formData, "responsibleSecondary"),
    status: value(formData, "status") || "ATIVO",
    bscPerspective: value(formData, "bscPerspective"),
    strategicObjective: value(formData, "strategicObjective"),
    linkedProject: optionalValue(formData, "linkedProject"),
    organizationalGoal: optionalValue(formData, "organizationalGoal"),
    type: value(formData, "type"),
    level: value(formData, "level"),
    polarity: value(formData, "polarity"),
    unit: value(formData, "unit"),
    collectionFrequency: value(formData, "collectionFrequency") || "MENSAL",
    analysisFrequency: value(formData, "analysisFrequency") || "MENSAL",
    purpose: value(formData, "purpose"),
    operationalDefinition: value(formData, "operationalDefinition"),
    relevance: optionalValue(formData, "relevance"),
    limitations: optionalValue(formData, "limitations"),
    formula: value(formData, "formula"),
    numerator: optionalValue(formData, "numerator"),
    denominator: optionalValue(formData, "denominator"),
    inclusionCriteria: optionalValue(formData, "inclusionCriteria"),
    exclusionCriteria: optionalValue(formData, "exclusionCriteria"),
    sourceSystem: value(formData, "sourceSystem"),
    storageLocation: optionalValue(formData, "storageLocation"),
    collectionMethod: value(formData, "collectionMethod"),
    collectionOwner: COLLECTION_OWNER,
    evidence: optionalValue(formData, "evidence"),
    isAiEligible: booleanValue(formData, "isAiEligible"),
    isAiIntegrable: booleanValue(formData, "isAiIntegrable"),
    dashboardName: optionalValue(formData, "dashboardName"),
    aiAgentName: optionalValue(formData, "aiAgentName"),
    dataReliability: value(formData, "dataReliability") || "Médio",
    requiresAudit: booleanValue(formData, "requiresAudit"),
    auditFrequency: optionalValue(formData, "auditFrequency"),
  };
}

export async function login(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) redirect("/login?erro=1");
  if (passwordNeedsUpgrade(user.password)) {
    await prisma.user.update({ where: { id: user.id }, data: { password: hashPassword(password) } });
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const currentPassword = value(formData, "currentPassword");
  const newName = value(formData, "name");
  const newPassword = value(formData, "newPassword");
  const confirmation = value(formData, "confirmPassword");
  const savedUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!verifyPassword(currentPassword, savedUser.password)) redirect("/perfil?erro=senha");
  if (newPassword && newPassword !== confirmation) redirect("/perfil?erro=confirmacao");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: newName,
      ...(newPassword ? { password: hashPassword(newPassword) } : {}),
    },
  });
  await audit(user, "Usuário", "EDITAR PERFIL", `Perfil atualizado: ${newName}`, user.id);
  revalidatePath("/");
  redirect("/perfil?ok=1");
}

function selectedPermissions(formData: FormData) {
  return formData.getAll("permissions").map(String);
}

export async function createUser(formData: FormData) {
  const admin = await requireAdmin();
  const created = await prisma.user.create({
    data: {
      name: value(formData, "name"),
      email: value(formData, "email").toLowerCase(),
      password: hashPassword(value(formData, "password")),
      role: value(formData, "role"),
      permissions: serializePermissions(selectedPermissions(formData)),
    },
  });
  await audit(admin, "Usuário", "CRIAR", `${created.name} (${created.email})`, created.id);
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function updateUser(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const password = value(formData, "password");
  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: value(formData, "name"),
      email: value(formData, "email").toLowerCase(),
      role: value(formData, "role"),
      permissions: serializePermissions(selectedPermissions(formData)),
      ...(password ? { password: hashPassword(password) } : {}),
    },
  });
  await audit(admin, "Usuário", "EDITAR", `${updated.name} (${updated.email})`, updated.id);
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) redirect("/usuarios?erro=proprio");
  const removed = await prisma.user.delete({ where: { id } });
  await audit(admin, "Usuário", "EXCLUIR", `${removed.name} (${removed.email})`, removed.id);
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function createIndicator(formData: FormData) {
  const user = await requireWriteAccess();
  const indicator = await prisma.indicator.create({ data: indicatorData(formData) });
  await audit(user, "Indicador", "CRIAR", `${indicator.code} - ${indicator.name}`, indicator.id);
  revalidatePath("/");
  redirect(`/indicadores/${indicator.id}`);
}

export async function updateIndicator(id: string, formData: FormData) {
  const user = await requireWriteAccess();
  const indicator = await prisma.indicator.update({ where: { id }, data: indicatorData(formData) });
  await audit(user, "Indicador", "EDITAR", `${indicator.code} - ${indicator.name}`, indicator.id);
  revalidatePath("/");
  redirect(`/indicadores/${indicator.id}`);
}

export async function deleteIndicator(id: string) {
  const user = await requireWriteAccess();
  const indicator = await prisma.indicator.delete({ where: { id } });
  await audit(user, "Indicador", "EXCLUIR", `${indicator.code} - ${indicator.name}`, id);
  revalidatePath("/");
  redirect("/indicadores");
}

export async function createGoal(formData: FormData) {
  const user = await requireWriteAccess();
  const goal = await prisma.goal.create({
    data: {
      indicatorId: value(formData, "indicatorId"),
      year: numberValue(formData, "year"),
      quarter: optionalNumber(formData, "quarter"),
      month: optionalNumber(formData, "month"),
      targetValue: numberValue(formData, "targetValue"),
      alertValue: optionalNumber(formData, "alertValue"),
      minimumValue: optionalNumber(formData, "minimumValue"),
      idealValue: optionalNumber(formData, "idealValue"),
    },
    include: { indicator: true },
  });
  await audit(user, "Meta", "CRIAR", `${goal.indicator.code} - ${goal.year}/${goal.month ?? "ano"}`, goal.id);
  revalidatePath("/");
  redirect("/metas");
}

export async function updateGoal(id: string, formData: FormData) {
  const user = await requireWriteAccess();
  const goal = await prisma.goal.update({
    where: { id },
    data: {
      indicatorId: value(formData, "indicatorId"),
      year: numberValue(formData, "year"),
      quarter: optionalNumber(formData, "quarter"),
      month: optionalNumber(formData, "month"),
      targetValue: numberValue(formData, "targetValue"),
      alertValue: optionalNumber(formData, "alertValue"),
      minimumValue: optionalNumber(formData, "minimumValue"),
      idealValue: optionalNumber(formData, "idealValue"),
    },
    include: { indicator: true },
  });
  await audit(user, "Meta", "EDITAR", `${goal.indicator.code} - ${goal.year}/${goal.month ?? "ano"}`, goal.id);
  revalidatePath("/");
  redirect("/metas");
}

export async function deleteGoal(id: string) {
  const user = await requireWriteAccess();
  await prisma.goal.delete({ where: { id } });
  await audit(user, "Meta", "EXCLUIR", `Meta removida`, id);
  revalidatePath("/");
  redirect("/metas");
}

export async function createResult(formData: FormData) {
  const user = await requireWriteAccess();
  const indicator = await prisma.indicator.findUniqueOrThrow({ where: { id: value(formData, "indicatorId") } });
  const actualValue = numberValue(formData, "actualValue");
  const targetValue = numberValue(formData, "targetValue");
  const achievement = calculateAchievement(actualValue, targetValue, indicator.polarity as "MAIOR_MELHOR" | "MENOR_MELHOR");
  const result = await prisma.result.create({
    data: {
      indicatorId: indicator.id,
      referenceDate: new Date(`${value(formData, "year")}-${value(formData, "month").padStart(2, "0")}-01T00:00:00.000Z`),
      actualValue,
      targetValue,
      achievement,
      trafficLight: getTrafficLight(achievement),
      analysis: optionalValue(formData, "analysis"),
      actionPlan: optionalValue(formData, "actionPlan"),
    },
  });
  await audit(user, "Resultado", "CRIAR", `${indicator.code} - ${result.achievement.toFixed(1)}%`, result.id);
  revalidatePath("/");
  redirect("/resultados");
}

function parseDelimited(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((header) => header.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const columns = line.split(delimiter).map((column) => column.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((header, index) => [header, columns[index] ?? ""]));
  });
}

export async function importMonthlyResults(formData: FormData) {
  const user = await requireWriteAccess();
  const file = formData.get("file");
  if (!(file instanceof File)) redirect("/lancamentos?erro=arquivo");
  const text = await file.text();
  const rows = parseDelimited(text);
  let imported = 0;
  for (const row of rows) {
    const code = row.codigo_indicador || row.codigo || row.indicador;
    const indicator = await prisma.indicator.findFirst({ where: { code }, include: { goals: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 } } });
    if (!indicator) continue;
    const year = Number(row.ano);
    const month = Number(row.mes);
    const actualValue = Number(String(row.resultado ?? "").replace(",", "."));
    const targetValue = Number(String(row.meta || indicator.goals[0]?.targetValue || 0).replace(",", "."));
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(actualValue) || !Number.isFinite(targetValue)) continue;
    const achievement = calculateAchievement(actualValue, targetValue, indicator.polarity as "MAIOR_MELHOR" | "MENOR_MELHOR");
    await prisma.result.create({
      data: {
        indicatorId: indicator.id,
        referenceDate: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
        actualValue,
        targetValue,
        achievement,
        trafficLight: getTrafficLight(achievement),
        analysis: row.analise || "Importado por planilha.",
        actionPlan: row.plano_acao || null,
      },
    });
    imported++;
  }
  await audit(user, "Resultado", "IMPORTAR", `${imported} resultado(s) importado(s) por planilha`);
  revalidatePath("/");
  redirect(`/lancamentos?importados=${imported}`);
}

export async function updateResult(id: string, formData: FormData) {
  const user = await requireWriteAccess();
  const indicator = await prisma.indicator.findUniqueOrThrow({ where: { id: value(formData, "indicatorId") } });
  const actualValue = numberValue(formData, "actualValue");
  const targetValue = numberValue(formData, "targetValue");
  const achievement = calculateAchievement(actualValue, targetValue, indicator.polarity as "MAIOR_MELHOR" | "MENOR_MELHOR");
  const result = await prisma.result.update({
    where: { id },
    data: {
      indicatorId: indicator.id,
      referenceDate: new Date(`${value(formData, "year")}-${value(formData, "month").padStart(2, "0")}-01T00:00:00.000Z`),
      actualValue,
      targetValue,
      achievement,
      trafficLight: getTrafficLight(achievement),
      analysis: optionalValue(formData, "analysis"),
      actionPlan: optionalValue(formData, "actionPlan"),
    },
  });
  await audit(user, "Resultado", "EDITAR", `${indicator.code} - ${result.achievement.toFixed(1)}%`, result.id);
  revalidatePath("/");
  redirect("/resultados");
}

export async function deleteResult(id: string) {
  const user = await requireWriteAccess();
  await prisma.result.delete({ where: { id } });
  await audit(user, "Resultado", "EXCLUIR", "Resultado removido", id);
  revalidatePath("/");
  redirect("/resultados");
}

export async function createOkr(formData: FormData) {
  const user = await requireWriteAccess();
  const okr = await prisma.okr.create({
    data: {
      title: value(formData, "title"),
      objective: value(formData, "objective"),
      area: value(formData, "area"),
      year: numberValue(formData, "year"),
      quarter: optionalNumber(formData, "quarter"),
      owner: value(formData, "owner"),
      indicators: {
        create: formData.getAll("indicatorIds").map((indicatorId) => ({
          indicatorId: String(indicatorId),
          weight: 1,
        })),
      },
    },
  });
  await audit(user, "OKR", "CRIAR", okr.title, okr.id);
  revalidatePath("/");
  redirect("/okrs");
}

export async function updateOkr(id: string, formData: FormData) {
  const user = await requireWriteAccess();
  await prisma.okrIndicator.deleteMany({ where: { okrId: id } });
  const okr = await prisma.okr.update({
    where: { id },
    data: {
      title: value(formData, "title"),
      objective: value(formData, "objective"),
      area: value(formData, "area"),
      year: numberValue(formData, "year"),
      quarter: optionalNumber(formData, "quarter"),
      owner: value(formData, "owner"),
      indicators: {
        create: formData.getAll("indicatorIds").map((indicatorId) => ({
          indicatorId: String(indicatorId),
          weight: 1,
        })),
      },
    },
  });
  await audit(user, "OKR", "EDITAR", okr.title, okr.id);
  revalidatePath("/");
  redirect("/okrs");
}

export async function deleteOkr(id: string) {
  const user = await requireWriteAccess();
  const okr = await prisma.okr.delete({ where: { id } });
  await audit(user, "OKR", "EXCLUIR", okr.title, id);
  revalidatePath("/");
  redirect("/okrs");
}

export async function assertLoggedIn() {
  await requireUser();
}

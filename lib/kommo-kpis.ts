import type { PrismaClient } from "@prisma/client";
import { calculateAchievement, getTrafficLight } from "@/lib/kpi";

type GoalLike = { year: number; quarter: number | null; month: number | null; targetValue: number };
type IndicatorLike = {
  id: string;
  code: string;
  polarity: string;
  goals: GoalLike[];
};

type LeadRecord = {
  id: string;
  pipelineId: string | null;
  statusId: string | null;
  monetaryValue: number | null;
  sourceCreatedAt: Date | null;
  sourceUpdatedAt: Date | null;
  payload: string;
};

type MonthBucket = {
  received: number;
  responded: number;
  scheduled: number;
  attended: number;
  won: number;
  lost: number;
  wonValue: number;
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStart(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function parsePayload(payload: string) {
  try {
    return JSON.parse(payload) as Record<string, any>;
  } catch {
    return {};
  }
}

function statusMapFromPipelines(records: { pipelineId: string | null; payload: string }[]) {
  const map = new Map<string, string>();
  for (const record of records) {
    const pipeline = parsePayload(record.payload);
    const pipelineId = String(pipeline.id ?? record.pipelineId ?? "");
    const statuses = pipeline?._embedded?.statuses;
    if (!pipelineId || !Array.isArray(statuses)) continue;
    for (const status of statuses) {
      if (status?.id == null || typeof status?.name !== "string") continue;
      map.set(`${pipelineId}:${status.id}`, status.name);
    }
  }
  return map;
}

function statusName(record: LeadRecord, statuses: Map<string, string>) {
  return statuses.get(`${record.pipelineId ?? ""}:${record.statusId ?? ""}`) ?? "";
}

function isWon(record: LeadRecord, normalizedStatus: string) {
  return record.statusId === "142" || /ganh|sucesso|vend|fech|compr|contrat/.test(normalizedStatus);
}

function isLost(record: LeadRecord, normalizedStatus: string) {
  return record.statusId === "143" || /perd|lost|recus|cancel|nao compr|nao fech/.test(normalizedStatus);
}

function isInitialStatus(normalizedStatus: string) {
  return /(^|\s)(novo|entrada|recebid|sem contato|aguardando|triagem)(\s|$)/.test(normalizedStatus);
}

function isScheduled(normalizedStatus: string) {
  return /agend|marcad|confirmad|consulta/.test(normalizedStatus);
}

function isAttended(normalizedStatus: string) {
  return /comparec|atendid|realiz|presente|consulta realizada|pos consulta/.test(normalizedStatus);
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : null;
}

function goalForPeriod(goals: GoalLike[], year: number, month: number) {
  const quarter = Math.ceil(month / 3);
  return goals.find((item) => item.year === year && item.month === month)
    ?? goals.find((item) => item.year === year && item.quarter === quarter && item.month == null)
    ?? goals.find((item) => item.year === year && item.month == null && item.quarter == null);
}

async function upsertResult(
  prisma: PrismaClient,
  indicator: IndicatorLike,
  referenceDate: Date,
  actualValue: number,
  analysis: string,
) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;
  const goal = goalForPeriod(indicator.goals, year, month);
  const targetValue = goal?.targetValue ?? 0;
  const achievement = goal ? calculateAchievement(actualValue, targetValue, indicator.polarity as "MAIOR_MELHOR" | "MENOR_MELHOR") : 0;
  const data = {
    indicatorId: indicator.id,
    referenceDate,
    actualValue,
    targetValue,
    achievement,
    trafficLight: goal ? getTrafficLight(achievement) : "SEM_META",
    analysis,
    actionPlan: null,
  };
  const existing = await prisma.result.findMany({
    where: { indicatorId: indicator.id, referenceDate },
    orderBy: { createdAt: "asc" },
  });
  if (existing.length) {
    await prisma.result.update({ where: { id: existing[0].id }, data });
    if (existing.length > 1) {
      await prisma.result.deleteMany({ where: { id: { in: existing.slice(1).map((item) => item.id) } } });
    }
    return "updated" as const;
  }
  await prisma.result.create({ data });
  return "created" as const;
}

export async function generateKommoFunnelResults(prisma: PrismaClient) {
  const connection = await prisma.integrationConnection.findUnique({ where: { provider: "KOMMO" } });
  if (!connection) throw new Error("O Kommo ainda não está conectado.");

  const [indicators, leads, pipelines] = await Promise.all([
    prisma.indicator.findMany({
      where: { code: { in: ["COM-004", "COM-005", "COM-006", "COM-007", "COM-008", "FIN-004"] } },
      include: { goals: true },
    }),
    prisma.externalCrmRecord.findMany({
      where: { integrationId: connection.id, entityType: "LEAD" },
      select: { id: true, pipelineId: true, statusId: true, monetaryValue: true, sourceCreatedAt: true, sourceUpdatedAt: true, payload: true },
    }),
    prisma.externalCrmRecord.findMany({
      where: { integrationId: connection.id, entityType: "PIPELINE" },
      select: { pipelineId: true, payload: true },
    }),
  ]);

  const indicatorsByCode = new Map(indicators.map((indicator) => [indicator.code, indicator]));
  const statuses = statusMapFromPipelines(pipelines);
  const buckets = new Map<string, MonthBucket>();

  for (const lead of leads) {
    const reference = lead.sourceCreatedAt ?? lead.sourceUpdatedAt;
    if (!reference) continue;
    const key = monthKey(reference);
    const bucket = buckets.get(key) ?? { received: 0, responded: 0, scheduled: 0, attended: 0, won: 0, lost: 0, wonValue: 0 };
    const normalizedStatus = normalizeText(statusName(lead, statuses));
    const won = isWon(lead, normalizedStatus);
    const lost = isLost(lead, normalizedStatus);
    const scheduled = isScheduled(normalizedStatus) || won || lost;
    const attended = isAttended(normalizedStatus) || won;
    const responded = !isInitialStatus(normalizedStatus) || scheduled || attended || won || lost;

    bucket.received += 1;
    if (responded) bucket.responded += 1;
    if (scheduled) bucket.scheduled += 1;
    if (attended) bucket.attended += 1;
    if (won) {
      bucket.won += 1;
      bucket.wonValue += lead.monetaryValue ?? 0;
    }
    if (lost) bucket.lost += 1;
    buckets.set(key, bucket);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const generatedCodes = new Set<string>();

  async function publish(code: string, key: string, value: number | null, analysis: string) {
    const indicator = indicatorsByCode.get(code);
    if (!indicator || value == null || !Number.isFinite(value)) {
      skipped += 1;
      return;
    }
    const status = await upsertResult(prisma, indicator, monthStart(key), value, analysis);
    if (status === "created") created += 1;
    if (status === "updated") updated += 1;
    generatedCodes.add(code);
  }

  for (const [key, bucket] of buckets) {
    const conversionDenominator = bucket.attended || bucket.won + bucket.lost;
    const lossDenominator = bucket.attended || bucket.won + bucket.lost;
    await publish("COM-004", key, percent(bucket.responded, bucket.received), `Gerado automaticamente pelo Kommo: ${bucket.responded} lead(s) respondido(s) de ${bucket.received} recebido(s).`);
    await publish("COM-005", key, percent(bucket.scheduled, bucket.responded), `Gerado automaticamente pelo Kommo: ${bucket.scheduled} lead(s) agendado(s) de ${bucket.responded} respondido(s).`);
    await publish("COM-006", key, percent(bucket.attended, bucket.scheduled), `Gerado automaticamente pelo Kommo: ${bucket.attended} comparecimento(s) de ${bucket.scheduled} agendamento(s).`);
    await publish("COM-007", key, percent(bucket.won, conversionDenominator), `Gerado automaticamente pelo Kommo: ${bucket.won} venda(s) de ${conversionDenominator} oportunidade(s) qualificadas.`);
    await publish("COM-008", key, percent(bucket.lost, lossDenominator), `Gerado automaticamente pelo Kommo: ${bucket.lost} perda(s) de ${lossDenominator} oportunidade(s) qualificadas.`);
    await publish("FIN-004", key, bucket.won > 0 ? bucket.wonValue / bucket.won : null, `Gerado automaticamente pelo Kommo: R$ ${bucket.wonValue.toFixed(2)} em ${bucket.won} venda(s).`);
  }

  return {
    created,
    updated,
    skipped,
    months: buckets.size,
    leads: leads.length,
    indicators: Array.from(generatedCodes).sort(),
  };
}

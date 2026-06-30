import { prisma } from "@/lib/prisma";
import { decryptValue, encryptValue } from "@/lib/secure-value";

const PROVIDER = "KOMMO";
const PAGE_SIZE = 250;

type KommoEntity = Record<string, unknown> & { id?: number | string };

function requiredEnvironment() {
  const clientId = process.env.KOMMO_CLIENT_ID;
  const clientSecret = process.env.KOMMO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Configure KOMMO_CLIENT_ID e KOMMO_CLIENT_SECRET no Render.");
  }
  return { clientId, clientSecret };
}

export function kommoRedirectUri() {
  return process.env.KOMMO_REDIRECT_URI || "https://ivmm-indicadores-app.onrender.com/api/integracoes/kommo/callback";
}

export function kommoEnvironmentReady() {
  return Boolean(process.env.KOMMO_CLIENT_ID && process.env.KOMMO_CLIENT_SECRET && (process.env.INTEGRATION_ENCRYPTION_KEY || process.env.SESSION_SECRET));
}

export async function saveKommoAuthorization(input: {
  subdomain: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}) {
  return prisma.integrationConnection.upsert({
    where: { provider: PROVIDER },
    create: {
      provider: PROVIDER,
      status: "CONECTADO",
      subdomain: input.subdomain,
      accessToken: encryptValue(input.accessToken),
      refreshToken: encryptValue(input.refreshToken),
      tokenExpiresAt: new Date(Date.now() + input.expiresIn * 1000),
    },
    update: {
      status: "CONECTADO",
      subdomain: input.subdomain,
      accessToken: encryptValue(input.accessToken),
      refreshToken: encryptValue(input.refreshToken),
      tokenExpiresAt: new Date(Date.now() + input.expiresIn * 1000),
      lastError: null,
    },
  });
}

async function connectionWithToken() {
  const connection = await prisma.integrationConnection.findUnique({ where: { provider: PROVIDER } });
  if (!connection?.subdomain || !connection.accessToken || !connection.refreshToken) {
    throw new Error("O Kommo ainda não está conectado.");
  }

  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
    return { connection, accessToken: decryptValue(connection.accessToken) };
  }

  const { clientId, clientSecret } = requiredEnvironment();
  const response = await fetch(`https://${connection.subdomain}.kommo.com/oauth2/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: decryptValue(connection.refreshToken),
      redirect_uri: kommoRedirectUri(),
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Não foi possível renovar o acesso ao Kommo (${response.status}).`);
  const tokens = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
  const updated = await prisma.integrationConnection.update({
    where: { id: connection.id },
    data: {
      status: "CONECTADO",
      accessToken: encryptValue(tokens.access_token),
      refreshToken: encryptValue(tokens.refresh_token),
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      lastError: null,
    },
  });
  return { connection: updated, accessToken: tokens.access_token };
}

async function kommoRequest(path: string) {
  const { connection, accessToken } = await connectionWithToken();
  const response = await fetch(`https://${connection.subdomain}.kommo.com${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 204) return { connection, data: null };
  if (!response.ok) throw new Error(`A API do Kommo respondeu com o código ${response.status}.`);
  return { connection, data: await response.json() as Record<string, any> };
}

function externalDate(value: unknown) {
  return typeof value === "number" && value > 0 ? new Date(value * 1000) : null;
}

export async function upsertKommoEntity(integrationId: string, entityType: string, entity: KommoEntity) {
  const externalId = String(entity.id ?? "");
  if (!externalId) return false;
  await prisma.externalCrmRecord.upsert({
    where: { integrationId_entityType_externalId: { integrationId, entityType, externalId } },
    create: {
      integrationId,
      entityType,
      externalId,
      name: typeof entity.name === "string" ? entity.name : null,
      pipelineId: entity.pipeline_id == null ? null : String(entity.pipeline_id),
      statusId: entity.status_id == null ? null : String(entity.status_id),
      responsibleUserId: entity.responsible_user_id == null ? null : String(entity.responsible_user_id),
      monetaryValue: typeof entity.price === "number" ? entity.price : null,
      sourceCreatedAt: externalDate(entity.created_at),
      sourceUpdatedAt: externalDate(entity.updated_at),
      payload: JSON.stringify(entity),
    },
    update: {
      name: typeof entity.name === "string" ? entity.name : null,
      pipelineId: entity.pipeline_id == null ? null : String(entity.pipeline_id),
      statusId: entity.status_id == null ? null : String(entity.status_id),
      responsibleUserId: entity.responsible_user_id == null ? null : String(entity.responsible_user_id),
      monetaryValue: typeof entity.price === "number" ? entity.price : null,
      sourceCreatedAt: externalDate(entity.created_at),
      sourceUpdatedAt: externalDate(entity.updated_at),
      payload: JSON.stringify(entity),
    },
  });
  return true;
}

async function importCollection(entityType: string, endpoint: string, embeddedKey: string) {
  let page = 1;
  let imported = 0;
  while (true) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const { connection, data } = await kommoRequest(`${endpoint}${separator}limit=${PAGE_SIZE}&page=${page}`);
    const entities = (data?._embedded?.[embeddedKey] ?? []) as KommoEntity[];
    for (const entity of entities) {
      if (await upsertKommoEntity(connection.id, entityType, entity)) imported += 1;
    }
    if (entities.length < PAGE_SIZE || !data?._links?.next?.href) break;
    page += 1;
  }
  return imported;
}

export async function syncKommo() {
  const connection = await prisma.integrationConnection.findUnique({ where: { provider: PROVIDER } });
  if (!connection) throw new Error("O Kommo ainda não está conectado.");
  const sync = await prisma.integrationSync.create({ data: { integrationId: connection.id, status: "EXECUTANDO" } });
  try {
    const accountResponse = await kommoRequest("/api/v4/account");
    const account = accountResponse.data;
    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        accountId: account?.id == null ? null : String(account.id),
        accountName: typeof account?.name === "string" ? account.name : null,
      },
    });
    let imported = 0;
    imported += await importCollection("LEAD", "/api/v4/leads?with=contacts", "leads");
    imported += await importCollection("CONTACT", "/api/v4/contacts?with=leads", "contacts");
    imported += await importCollection("COMPANY", "/api/v4/companies?with=leads,contacts", "companies");
    imported += await importCollection("USER", "/api/v4/users", "users");
    imported += await importCollection("PIPELINE", "/api/v4/leads/pipelines", "pipelines");
    const finishedAt = new Date();
    await prisma.$transaction([
      prisma.integrationSync.update({ where: { id: sync.id }, data: { status: "CONCLUIDO", importedCount: imported, finishedAt } }),
      prisma.integrationConnection.update({ where: { id: connection.id }, data: { status: "CONECTADO", lastSyncAt: finishedAt, lastError: null } }),
    ]);
    return imported;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido na sincronização.";
    await prisma.$transaction([
      prisma.integrationSync.update({ where: { id: sync.id }, data: { status: "ERRO", errorMessage: message, finishedAt: new Date() } }),
      prisma.integrationConnection.update({ where: { id: connection.id }, data: { status: "ERRO", lastError: message } }),
    ]);
    throw error;
  }
}

export async function refreshKommoRecord(entityType: string, externalId: string) {
  const endpointByType: Record<string, string> = {
    LEAD: "leads",
    CONTACT: "contacts",
    COMPANY: "companies",
  };
  const endpoint = endpointByType[entityType];
  if (!endpoint) return;
  const { connection, data } = await kommoRequest(`/api/v4/${endpoint}/${encodeURIComponent(externalId)}`);
  if (data) await upsertKommoEntity(connection.id, entityType, data);
}

export async function disconnectKommo() {
  const connection = await prisma.integrationConnection.findUnique({ where: { provider: PROVIDER } });
  if (!connection) return;
  await prisma.integrationConnection.update({
    where: { id: connection.id },
    data: { status: "DESCONECTADO", accessToken: null, refreshToken: null, tokenExpiresAt: null, lastError: null },
  });
}

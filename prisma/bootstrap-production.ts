import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password.ts";
import { loadOfficialData } from "./official-data.ts";
import { commercialFunnelIndicatorCodes, syncCommercialFunnelIndicators } from "./commercial-funnel-data.ts";
import { syncRecruitmentSeedData } from "./recruitment-data.ts";

const prisma = new PrismaClient();
const allPermissions = ["hub", "dashboard", "recrutamento", "financeiro", "bonificacao", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "head-operacoes", "conselho", "ia-automacao", "historico", "exportacoes", "usuarios", "integracoes"];
const productionProfiles = [
  {
    name: "Head de Operações",
    email: "head@ivmm.local",
    password: "scrypt$38e4ac6e7e48d1fc9bf03ef9418b1ef9$0d8717dd984d7ad1096ddb09da9f9f87a82671c1b5b6070cbade03de76d8c545cf916d0af0f990acb31a33b7288766e5723d09e28a2623d19b325bcdeca7f7d9",
    role: "HEAD_OPERACOES",
    permissions: ["hub", "dashboard", "recrutamento", "indicadores", "resultados", "scorecard", "bsc", "okrs", "head-operacoes", "ia-automacao", "exportacoes"],
  },
  {
    name: "Coordenação Administrativa",
    email: "coordenacao@ivmm.local",
    password: "scrypt$f98eb482db77c2e6c70971adf5c87110$8f422779fd4ac8facfd92b27f4ece7e97ef41fce4454b750047ff495b5a8353a999d59fb5b5a76dfb21f6301b663742c0f96222644959f9caa47408fd3d0a8c7",
    role: "COORDENACAO_ADMINISTRATIVA",
    permissions: ["hub", "dashboard", "recrutamento", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "ia-automacao", "historico", "exportacoes"],
  },
  {
    name: "Conselho Consultivo",
    email: "conselho@ivmm.local",
    password: "scrypt$d50e843dad1c83cfdca4239e3ad8c592$2255362e132285830370bd52a8105736857e8ddc930dea04f67721afedeb34c9afd9a7caf98410ba7cfc6c3cb0132f83e86bc80687b5acd88542011339be32b8",
    role: "CONSELHO_CONSULTIVO",
    permissions: ["hub", "dashboard", "recrutamento", "indicadores", "scorecard", "bsc", "okrs", "conselho", "exportacoes"],
  },
];

const temporaryAccessProfiles = [
  {
    name: "Administrador IVMM",
    email: "admin@ivmm.local",
    password: "scrypt$4325363d98a28c2ccd792b576bc3ff19$4f5aa79686b323622baf3d94fdb342fbc038e2f27506a67a7245156aff5ca021c08aa4e950a0257c3768e51a46394b9163f6709c030594fe94fc2cc79c97d95c",
    role: "ADMINISTRADOR",
    permissions: allPermissions,
  },
  {
    ...productionProfiles[0],
    password: "scrypt$3adbb3dce28db0381ea55450329f7d6e$d86e45ca6f6faf9f34d55dbcbd5330b6a14f616d12f1861f04c451c12f238e7eeb865da4d60dd8107a14cd996f1d8f086350a75784e58720eaf6f4c14b007043",
  },
  {
    ...productionProfiles[1],
    password: "scrypt$8b7e690609d29e0b12784b934f09f204$9d0c4ddc4846e67b3bafd8e6bd0b9c5dcd77fc83b6ac66733445c4189d8870494965e19c43b75faad2076d259368ac7f04922746488b54c27cb2b8c2d45623a4",
  },
  {
    ...productionProfiles[2],
    password: "scrypt$e65460319d5359c9c7eeb2fc6821d60e$e2628f6a0e562f0ea5eb60555b5f2e4d47b3a3bf5325e4d424d15b07a7877b24779c19191d0e0614c87c1d00e23024ede30a1b530dc984ba622aa1c3d543b05c",
  },
];

function requiredEnvironment(name: string) {
  const input = process.env[name]?.trim();
  if (!input) throw new Error(`${name} deve ser configurado no Render.`);
  return input;
}

async function main() {
  const [userCount, indicatorCount] = await Promise.all([
    prisma.user.count(),
    prisma.indicator.count(),
  ]);

  if (userCount === 0) {
    const email = requiredEnvironment("ADMIN_EMAIL").toLowerCase();
    const password = requiredEnvironment("ADMIN_PASSWORD");
    if (password.length < 12) throw new Error("ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");

    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME?.trim() || "Administrador IVMM",
        email,
        password: hashPassword(password),
        role: "ADMINISTRADOR",
        permissions: JSON.stringify(allPermissions),
      },
    });
  }

  const profilesMarker = await prisma.auditLog.findFirst({
    where: { entity: "SYSTEM", action: "PRODUCTION_PROFILES_V1" },
  });

  if (!profilesMarker) {
    for (const profile of productionProfiles) {
      await prisma.user.upsert({
        where: { email: profile.email },
        create: {
          ...profile,
          permissions: JSON.stringify(profile.permissions),
        },
        update: {
          name: profile.name,
          password: profile.password,
          role: profile.role,
          permissions: JSON.stringify(profile.permissions),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        entity: "SYSTEM",
        action: "PRODUCTION_PROFILES_V1",
        summary: "Perfis-padrão de produção criados e normalizados.",
        actorName: "Bootstrap Render",
        actorRole: "SISTEMA",
      },
    });
  }

  const councilMarker = await prisma.auditLog.findFirst({
    where: { entity: "SYSTEM", action: "CONSELHO_PASSWORD_V2" },
  });

  if (!councilMarker) {
    const council = productionProfiles.find((profile) => profile.role === "CONSELHO_CONSULTIVO")!;
    await prisma.user.update({
      where: { email: council.email },
      data: { password: council.password },
    });
    await prisma.auditLog.create({
      data: {
        entity: "SYSTEM",
        action: "CONSELHO_PASSWORD_V2",
        summary: "Senha temporária do Conselho Consultivo normalizada.",
        actorName: "Bootstrap Render",
        actorRole: "SISTEMA",
      },
    });
  }

  const accessResetMarker = await prisma.auditLog.findFirst({
    where: { entity: "SYSTEM", action: "PRODUCTION_CREDENTIALS_V3" },
  });

  if (!accessResetMarker) {
    for (const profile of temporaryAccessProfiles) {
      await prisma.user.upsert({
        where: { email: profile.email },
        create: {
          ...profile,
          permissions: JSON.stringify(profile.permissions),
        },
        update: {
          name: profile.name,
          password: profile.password,
          role: profile.role,
          permissions: JSON.stringify(profile.permissions),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        entity: "SYSTEM",
        action: "PRODUCTION_CREDENTIALS_V3",
        summary: "Credenciais temporárias dos perfis de produção redefinidas.",
        actorName: "Bootstrap Render",
        actorRole: "SISTEMA",
      },
    });
  }

  for (const profile of productionProfiles) {
    await prisma.user.updateMany({
      where: { email: profile.email },
      data: { permissions: JSON.stringify(profile.permissions) },
    });
  }

  if (indicatorCount === 0) {
    await loadOfficialData(prisma, { name: "Bootstrap Render", role: "SISTEMA" });
  }

  const funnelIndicatorCount = await prisma.indicator.count({
    where: { code: { in: commercialFunnelIndicatorCodes } },
  });
  const funnelMarker = await prisma.auditLog.findFirst({
    where: { entity: "SYSTEM", action: "COMMERCIAL_FUNNEL_INDICATORS_V1" },
  });

  if (!funnelMarker || funnelIndicatorCount < commercialFunnelIndicatorCodes.length) {
    await syncCommercialFunnelIndicators(prisma, { name: "Bootstrap Render", role: "SISTEMA" });
    if (!funnelMarker) {
      await prisma.auditLog.create({
        data: {
          entity: "SYSTEM",
          action: "COMMERCIAL_FUNNEL_INDICATORS_V1",
          summary: "Indicadores oficiais do funil comercial cadastrados para integração com Kommo.",
          actorName: "Bootstrap Render",
          actorRole: "SISTEMA",
        },
      });
    }
  }

  const recruitmentMarker = await prisma.auditLog.findFirst({
    where: { entity: "SYSTEM", action: "RECRUITMENT_MODULE_SEED_V1" },
  });

  if (!recruitmentMarker) {
    await syncRecruitmentSeedData(prisma, { name: "Bootstrap Render", role: "SISTEMA" });
    await prisma.auditLog.create({
      data: {
        entity: "SYSTEM",
        action: "RECRUITMENT_MODULE_SEED_V1",
        summary: "Módulo MRS-IVMM de recrutamento inicializado com cargo, vaga, candidatos e evidências fictícias.",
        actorName: "Bootstrap Render",
        actorRole: "SISTEMA",
      },
    });
  }

}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

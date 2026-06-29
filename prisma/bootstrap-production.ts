import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password.ts";
import { loadOfficialData } from "./official-data.ts";

const prisma = new PrismaClient();
const allPermissions = ["dashboard", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "head-operacoes", "conselho", "ia-automacao", "historico", "exportacoes", "usuarios"];
const productionProfiles = [
  {
    name: "Head de Operações",
    email: "head@ivmm.local",
    password: "scrypt$38e4ac6e7e48d1fc9bf03ef9418b1ef9$0d8717dd984d7ad1096ddb09da9f9f87a82671c1b5b6070cbade03de76d8c545cf916d0af0f990acb31a33b7288766e5723d09e28a2623d19b325bcdeca7f7d9",
    role: "HEAD_OPERACOES",
    permissions: ["dashboard", "indicadores", "resultados", "scorecard", "bsc", "okrs", "head-operacoes", "ia-automacao", "exportacoes"],
  },
  {
    name: "Coordenação Administrativa",
    email: "coordenacao@ivmm.local",
    password: "scrypt$f98eb482db77c2e6c70971adf5c87110$8f422779fd4ac8facfd92b27f4ece7e97ef41fce4454b750047ff495b5a8353a999d59fb5b5a76dfb21f6301b663742c0f96222644959f9caa47408fd3d0a8c7",
    role: "COORDENACAO_ADMINISTRATIVA",
    permissions: ["dashboard", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "ia-automacao", "historico", "exportacoes"],
  },
  {
    name: "Conselho Consultivo",
    email: "conselho@ivmm.local",
    password: "scrypt$0a74127e1bbd969ae1c665f53bd47357$69d96c1b489f2d968e1d69b6a161fb99e61f8844966cecee05d2f451b9e4c47bda84d282e24e745bfeb7991b2d127b85ac5d320ec8755e4af",
    role: "CONSELHO_CONSULTIVO",
    permissions: ["dashboard", "indicadores", "scorecard", "bsc", "okrs", "conselho", "exportacoes"],
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

  for (const profile of productionProfiles) {
    const existingUser = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          ...profile,
          permissions: JSON.stringify(profile.permissions),
        },
      });
    }
  }

  if (indicatorCount === 0) {
    await loadOfficialData(prisma, { name: "Bootstrap Render", role: "SISTEMA" });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

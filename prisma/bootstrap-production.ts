import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password.ts";
import { loadOfficialData } from "./official-data.ts";

const prisma = new PrismaClient();
const allPermissions = ["dashboard", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "head-operacoes", "conselho", "ia-automacao", "historico", "exportacoes", "usuarios"];

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

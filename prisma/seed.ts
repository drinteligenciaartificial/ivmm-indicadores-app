import { PrismaClient } from "@prisma/client";
import { loadOfficialData } from "./official-data.ts";
import { syncCommercialFunnelIndicators } from "./commercial-funnel-data.ts";
import { syncRecruitmentSeedData } from "./recruitment-data.ts";
import { hashPassword } from "../lib/password.ts";

const prisma = new PrismaClient();
const allPermissions = ["hub", "dashboard", "recrutamento", "financeiro", "bonificacao", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "head-operacoes", "conselho", "ia-automacao", "historico", "exportacoes", "usuarios", "integracoes"];

async function main() {
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      { name: "Administrador IVMM", email: "admin@ivmm.local", password: hashPassword("admin1234"), role: "ADMINISTRADOR", permissions: JSON.stringify(allPermissions) },
      { name: "Head de Operações", email: "head@ivmm.local", password: hashPassword("head1234"), role: "HEAD_OPERACOES", permissions: JSON.stringify(["hub", "dashboard", "recrutamento", "indicadores", "resultados", "scorecard", "bsc", "okrs", "head-operacoes", "ia-automacao", "exportacoes"]) },
      { name: "Coordenação Administrativa", email: "coordenacao@ivmm.local", password: hashPassword("coord1234"), role: "COORDENACAO_ADMINISTRATIVA", permissions: JSON.stringify(["hub", "dashboard", "recrutamento", "indicadores", "metas", "resultados", "lancamentos", "scorecard", "bsc", "okrs", "ia-automacao", "historico", "exportacoes"]) },
      { name: "Conselho Consultivo", email: "conselho@ivmm.local", password: hashPassword("conselho123"), role: "CONSELHO_CONSULTIVO", permissions: JSON.stringify(["hub", "dashboard", "recrutamento", "indicadores", "scorecard", "bsc", "okrs", "conselho", "exportacoes"]) },
    ],
  });
  await loadOfficialData(prisma, { name: "Seed", role: "SISTEMA" });
  await syncCommercialFunnelIndicators(prisma, { name: "Seed", role: "SISTEMA" });
  await syncRecruitmentSeedData(prisma, { name: "Seed", role: "SISTEMA" });
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import { loadOfficialData } from "./official-data.ts";
import { syncCommercialFunnelIndicators } from "./commercial-funnel-data.ts";

const prisma = new PrismaClient();

loadOfficialData(prisma)
  .then(() => syncCommercialFunnelIndicators(prisma))
  .finally(() => prisma.$disconnect());

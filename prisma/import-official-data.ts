import { PrismaClient } from "@prisma/client";
import { loadOfficialData } from "./official-data.ts";

const prisma = new PrismaClient();

loadOfficialData(prisma).finally(() => prisma.$disconnect());

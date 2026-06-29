import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

export async function audit(user: CurrentUser, entity: string, action: string, summary: string, entityId?: string) {
  await prisma.auditLog.create({
    data: {
      entity,
      entityId,
      action,
      summary,
      actorName: user.name,
      actorRole: user.role,
    },
  });
}

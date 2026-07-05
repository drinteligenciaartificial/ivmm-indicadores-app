import { canAccess, getCurrentUser } from "@/lib/auth";
import { formatIndicatorValue } from "@/lib/kpi";
import { tablePdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!canAccess(user, "metas")) return new Response("Acesso negado", { status: 403 });
  const goals = await prisma.goal.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], include: { indicator: true } });
  const rows = goals.map((goal) => [goal.indicator.code, goal.indicator.name, String(goal.year), goal.quarter ? `${goal.quarter}º` : "-", goal.month ? String(goal.month).padStart(2, "0") : "-", formatIndicatorValue(goal.targetValue, goal.indicator.unit), goal.alertValue == null ? "-" : formatIndicatorValue(goal.alertValue, goal.indicator.unit), goal.minimumValue == null ? "-" : formatIndicatorValue(goal.minimumValue, goal.indicator.unit), goal.idealValue == null ? "-" : formatIndicatorValue(goal.idealValue, goal.indicator.unit)]);
  return new Response(tablePdf("IVMM - Metas", ["Código", "Indicador", "Ano", "Trim.", "Mês", "Meta", "Alerta", "Mínimo", "Ideal"], rows), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="ivmm-metas.pdf"' } });
}

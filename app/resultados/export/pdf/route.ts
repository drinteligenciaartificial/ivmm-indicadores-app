import { canAccess, getCurrentUser } from "@/lib/auth";
import { formatArea, formatIndicatorValue } from "@/lib/kpi";
import { tablePdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!canAccess(user, "resultados")) return new Response("Acesso negado", { status: 403 });
  const params = new URL(request.url).searchParams;
  const indicatorId = params.get("indicatorId") || "";
  const area = params.get("area") || "";
  const traffic = params.get("traffic") || "";
  const results = await prisma.result.findMany({ where: { ...(indicatorId ? { indicatorId } : {}), ...(traffic ? { trafficLight: traffic } : {}), ...(area ? { indicator: { area } } : {}) }, orderBy: { referenceDate: "desc" }, include: { indicator: true } });
  const rows = results.map((result) => [result.referenceDate.toISOString().slice(0, 7), result.indicator.code, result.indicator.name, formatArea(result.indicator.area), formatIndicatorValue(result.actualValue, result.indicator.unit), result.trafficLight === "SEM_META" ? "-" : formatIndicatorValue(result.targetValue, result.indicator.unit), result.trafficLight === "SEM_META" ? "-" : `${result.achievement.toFixed(1)}%`, result.trafficLight === "SEM_META" ? "Sem meta" : result.trafficLight]);
  return new Response(tablePdf("IVMM - Resultados", ["Referência", "Código", "Indicador", "Área", "Resultado", "Meta", "Ating.", "Semáforo"], rows), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="ivmm-resultados.pdf"' } });
}

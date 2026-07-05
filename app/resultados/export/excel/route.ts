import { canAccess, getCurrentUser } from "@/lib/auth";
import { formatArea, formatIndicatorValue } from "@/lib/kpi";
import { prisma } from "@/lib/prisma";
import { tableWorkbook } from "@/lib/presentationExport";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!canAccess(user, "resultados")) return new Response("Acesso negado", { status: 403 });
  const params = new URL(request.url).searchParams;
  const indicatorId = params.get("indicatorId") || "";
  const area = params.get("area") || "";
  const traffic = params.get("traffic") || "";
  const results = await prisma.result.findMany({ where: { ...(indicatorId ? { indicatorId } : {}), ...(traffic ? { trafficLight: traffic } : {}), ...(area ? { indicator: { area } } : {}) }, orderBy: { referenceDate: "desc" }, include: { indicator: true } });
  const rows = results.map((result) => [result.referenceDate.toISOString().slice(0, 7), result.indicator.code, result.indicator.name, formatArea(result.indicator.area), formatIndicatorValue(result.actualValue, result.indicator.unit), result.trafficLight === "SEM_META" ? "-" : formatIndicatorValue(result.targetValue, result.indicator.unit), result.trafficLight === "SEM_META" ? "-" : `${result.achievement.toFixed(1)}%`, result.trafficLight === "SEM_META" ? "Sem meta" : result.trafficLight, result.analysis || "-", result.actionPlan || "-"]);
  return new Response(tableWorkbook("IVMM - Resultados", "Resultados apurados conforme os filtros selecionados na tela.", ["Referência", "Código", "Indicador", "Área", "Resultado", "Meta", "Atingimento", "Semáforo", "Análise", "Plano de ação"], rows), { headers: { "Content-Type": "application/vnd.ms-excel; charset=utf-8", "Content-Disposition": 'attachment; filename="ivmm-resultados.xls"' } });
}

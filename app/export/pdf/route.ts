import { prisma } from "@/lib/prisma";
import { cleanParams } from "@/lib/filters";
import { indicatorPdf } from "@/lib/pdf";
import { canAccess, getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!canAccess(user, "exportacoes")) return new Response("Acesso negado", { status: 403 });
  const url = new URL(request.url);
  const params = cleanParams(Object.fromEntries(url.searchParams.entries()));
  const indicators = await prisma.indicator.findMany({
    where: {
      ...(params.area ? { area: params.area } : {}),
      ...(params.bsc ? { bscPerspective: params.bsc } : {}),
    },
    orderBy: { code: "asc" },
    include: { results: { orderBy: { referenceDate: "desc" }, take: 1 } },
  });
  const rows = indicators
    .filter((indicator) => !params.traffic || indicator.results[0]?.trafficLight === params.traffic)
    .map((indicator) => {
      const last = indicator.results[0];
      return { code: indicator.code, name: indicator.name, area: indicator.area, achievement: last ? `${last.achievement.toFixed(1)}%` : "-", trafficLight: last?.trafficLight, objective: indicator.strategicObjective };
    });
  const pdf = indicatorPdf("IVMM - Banco de Indicadores e Fichas", rows);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ivmm-indicadores.pdf"',
    },
  });
}

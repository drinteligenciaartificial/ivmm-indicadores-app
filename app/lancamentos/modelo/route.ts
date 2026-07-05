import { canAccess, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { brasiliaYear } from "@/lib/time";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!canAccess(user, "lancamentos")) return new Response("Acesso negado", { status: 403 });
  const url = new URL(request.url);
  const indicatorId = url.searchParams.get("indicatorId") || "";
  const indicator = indicatorId ? await prisma.indicator.findUnique({ where: { id: indicatorId }, include: { goals: true } }) : null;
  const header = ["codigo_indicador", "unidade", "ano", "mes", "resultado", "meta", "analise", "plano_acao"];
  const currentYear = brasiliaYear();
  const samples = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const goal = indicator?.goals.find((item) => item.year === currentYear && item.month === month)
      ?? indicator?.goals.find((item) => item.year === currentYear && item.quarter === Math.ceil(month / 3) && item.month == null)
      ?? indicator?.goals.find((item) => item.year === currentYear && item.month == null && item.quarter == null);
    return [indicator?.code ?? "CODIGO-001", indicator?.unit ?? "número", currentYear, month, "", goal?.targetValue ?? "", "", ""];
  });
  const csv = `\uFEFFsep=;\n${[header, ...samples].map((row) => row.map(csvCell).join(";")).join("\n")}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modelo-lancamento-${indicator?.code ?? "ivmm"}.csv"`,
    },
  });
}

import { canAccess, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!canAccess(user, "lancamentos")) return new Response("Acesso negado", { status: 403 });
  const url = new URL(request.url);
  const indicatorId = url.searchParams.get("indicatorId") || "";
  const indicator = indicatorId ? await prisma.indicator.findUnique({ where: { id: indicatorId }, include: { goals: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 } } }) : null;
  const header = ["codigo_indicador", "ano", "mes", "resultado", "meta", "analise", "plano_acao"];
  const sample = [
    indicator?.code ?? "CODIGO-001",
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    "",
    indicator?.goals[0]?.targetValue ?? "",
    "",
    "",
  ];
  const csv = [header, sample].map((row) => row.map(csvCell).join(";")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modelo-lancamento-${indicator?.code ?? "ivmm"}.csv"`,
    },
  });
}

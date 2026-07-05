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
  const indicator = indicatorId ? await prisma.indicator.findUnique({ where: { id: indicatorId } }) : null;
  const header = ["codigo_indicador", "unidade", "ano", "mes", "resultado", "analise", "plano_acao"];
  const currentYear = brasiliaYear();
  const samples = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return [indicator?.code ?? "CODIGO-001", indicator?.unit ?? "número", currentYear, month, "", "", ""];
  });
  const csv = `\uFEFFsep=;\n${[header, ...samples].map((row) => row.map(csvCell).join(";")).join("\n")}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modelo-lancamento-${indicator?.code ?? "ivmm"}.csv"`,
    },
  });
}

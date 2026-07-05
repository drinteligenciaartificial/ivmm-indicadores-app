import Link from "next/link";
import { deleteResult } from "@/app/actions";
import { TrafficBadge } from "@/components/TrafficBadge";
import { requireFeature } from "@/lib/auth";
import { areas, trafficLights } from "@/lib/constants";
import { formatArea, formatIndicatorValue } from "@/lib/kpi";
import { prisma } from "@/lib/prisma";
import { FileSpreadsheet, FileText, Filter, RotateCcw } from "lucide-react";

function param(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value || "";
}

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFeature("resultados");
  const params = await searchParams;
  const filters = {
    indicatorId: param(params, "indicatorId"),
    area: param(params, "area"),
    traffic: param(params, "traffic"),
  };
  const [indicators, results] = await Promise.all([
    prisma.indicator.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, name: true } }),
    prisma.result.findMany({
      where: {
        ...(filters.indicatorId ? { indicatorId: filters.indicatorId } : {}),
        ...(filters.traffic ? { trafficLight: filters.traffic } : {}),
        ...(filters.area ? { indicator: { area: filters.area } } : {}),
      },
      orderBy: { referenceDate: "desc" },
      include: { indicator: true },
    }),
  ]);
  const exportQuery = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString();

  return (
    <>
      <section className="page-header">
        <div><h2>Resultados</h2><p>Consulte e gerencie os resultados apurados por indicador.</p></div>
        <div className="inline-actions">
          <Link className="button secondary" href={`/resultados/export/excel?${exportQuery}`}><FileSpreadsheet aria-hidden="true" size={17} />Excel</Link>
          <Link className="button secondary" href={`/resultados/export/pdf?${exportQuery}`}><FileText aria-hidden="true" size={17} />PDF</Link>
          <Link className="button" href="/resultados/novo">Novo resultado</Link>
        </div>
      </section>
      <form className="card filters result-filters">
        <label>Indicador<select className="select" name="indicatorId" defaultValue={filters.indicatorId}><option value="">Todos</option>{indicators.map((indicator) => <option key={indicator.id} value={indicator.id}>{indicator.code} - {indicator.name}</option>)}</select></label>
        <label>Área<select className="select" name="area" defaultValue={filters.area}><option value="">Todas</option>{areas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Semáforo<select className="select" name="traffic" defaultValue={filters.traffic}><option value="">Todos</option>{trafficLights.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="filter-actions">
          <Link className="button secondary" href="/resultados"><RotateCcw aria-hidden="true" size={17} />Limpar</Link>
          <button className="button" type="submit"><Filter aria-hidden="true" size={17} />Filtrar</button>
        </div>
      </form>
      <section className="card">
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Referência</th><th>Indicador</th><th>Área</th><th>Resultado</th><th>Meta</th><th>Atingimento</th><th>Semáforo</th><th>Ações</th></tr></thead>
          <tbody>{results.map((result) => <tr key={result.id}><td>{result.referenceDate.toISOString().slice(0, 7)}</td><td>{result.indicator.code} - {result.indicator.name}</td><td>{formatArea(result.indicator.area)}</td><td>{formatIndicatorValue(result.actualValue, result.indicator.unit)}</td><td>{result.trafficLight === "SEM_META" ? "-" : formatIndicatorValue(result.targetValue, result.indicator.unit)}</td><td>{result.trafficLight === "SEM_META" ? "-" : `${result.achievement.toFixed(1)}%`}</td><td><TrafficBadge value={result.trafficLight} /></td><td><div className="table-actions"><Link className="button small secondary" href={`/resultados/${result.id}/editar`}>Editar</Link><form action={deleteResult.bind(null, result.id)}><button className="button small danger">Excluir</button></form></div></td></tr>)}</tbody>
        </table></div>
        {!results.length && <p className="muted">Nenhum resultado encontrado para os filtros selecionados.</p>}
      </section>
    </>
  );
}

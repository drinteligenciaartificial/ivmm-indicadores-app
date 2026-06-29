import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatArea, formatPerspective, formatStatus } from "@/lib/kpi";
import { TrafficBadge } from "@/components/TrafficBadge";
import { deleteIndicator } from "@/app/actions";
import { areas, perspectives, trafficLights } from "@/lib/constants";
import { cleanParams } from "@/lib/filters";
import { requireFeature } from "@/lib/auth";
import { FilePenLine, FileSpreadsheet, FileText, Filter, Plus, RotateCcw, Trash2 } from "lucide-react";

export default async function IndicatorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFeature("indicadores");
  const params = cleanParams(await searchParams);
  const indicators = await prisma.indicator.findMany({
    where: {
      ...(params.area ? { area: params.area } : {}),
      ...(params.bsc ? { bscPerspective: params.bsc } : {}),
    },
    orderBy: { code: "asc" },
    include: { results: { orderBy: { referenceDate: "desc" }, take: 1 } },
  });
  const filtered = indicators.filter((item) => {
    const last = item.results[0];
    if (params.traffic && last?.trafficLight !== params.traffic) return false;
    if (params.year && last?.referenceDate.getUTCFullYear() !== Number(params.year)) return false;
    if (params.month && (last?.referenceDate.getUTCMonth() ?? -1) + 1 !== Number(params.month)) return false;
    if (params.quarter) {
      const quarter = Math.floor(((last?.referenceDate.getUTCMonth() ?? 0) + 3) / 3);
      if (quarter !== Number(params.quarter)) return false;
    }
    return true;
  });
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Banco Único de Indicadores</h2>
          <p>Cadastro central que alimenta fichas, dashboards, scorecards, BSC e OKRs.</p>
        </div>
        <div className="inline-actions">
          <Link className="button secondary" href={`/export/excel?${query}`}><FileSpreadsheet aria-hidden="true" size={17} />Excel</Link>
          <Link className="button secondary" href={`/export/pdf?${query}`}><FileText aria-hidden="true" size={17} />PDF</Link>
          <Link className="button" href="/indicadores/novo"><Plus aria-hidden="true" size={17} />Novo indicador</Link>
        </div>
      </section>
      <form className="card filters">
        <label>Área<select className="select" name="area" defaultValue={params.area}><option value="">Todas</option>{areas.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>BSC<select className="select" name="bsc" defaultValue={params.bsc}><option value="">Todas</option>{perspectives.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>Mês<input className="input" name="month" type="number" min="1" max="12" defaultValue={params.month}/></label>
        <label>Trimestre<input className="input" name="quarter" type="number" min="1" max="4" defaultValue={params.quarter}/></label>
        <label>Ano<input className="input" name="year" type="number" defaultValue={params.year}/></label>
        <label>Semáforo<select className="select" name="traffic" defaultValue={params.traffic}><option value="">Todos</option>{trafficLights.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <div className="filter-actions">
          <Link className="button secondary" href="/indicadores"><RotateCcw aria-hidden="true" size={17} />Limpar</Link>
          <button className="button" type="submit"><Filter aria-hidden="true" size={17} />Filtrar</button>
        </div>
      </form>
      <section className="card" style={{ marginTop: 18 }}>
        <div className="table-wrap">
          <table className="table indicator-table">
            <thead><tr><th>Código</th><th>Indicador</th><th>Área</th><th>BSC</th><th>Responsável coleta</th><th>Status</th><th>Atingimento</th><th>Semáforo</th><th>Ações</th></tr></thead>
            <tbody>{filtered.map(item=>{const last=item.results[0];return <tr key={item.id}><td>{item.code}</td><td><Link href={`/indicadores/${item.id}`}>{item.name}</Link></td><td>{formatArea(item.area)}</td><td>{formatPerspective(item.bscPerspective)}</td><td>{item.collectionOwner}</td><td>{formatStatus(item.status)}</td><td>{last?`${last.achievement.toFixed(1)}%`:"Sem resultado"}</td><td>{last?<TrafficBadge value={last.trafficLight}/>:"-"}</td><td className="actions-cell"><div className="table-actions"><Link className="button small secondary" href={`/indicadores/${item.id}/editar`}><FilePenLine aria-hidden="true" size={15} />Editar</Link><form action={deleteIndicator.bind(null,item.id)}><button className="button small danger" type="submit"><Trash2 aria-hidden="true" size={15} />Excluir</button></form></div></td></tr>})}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

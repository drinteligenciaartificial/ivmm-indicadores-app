import Link from "next/link";
import { deleteResult } from "@/app/actions";
import { TrafficBadge } from "@/components/TrafficBadge";
import { formatIndicatorValue } from "@/lib/kpi";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth";

export default async function ResultsPage() {
  await requireFeature("resultados");
  const results = await prisma.result.findMany({ orderBy: { referenceDate: "desc" }, include: { indicator: true } });
  return <><section className="page-header"><div><h2>Resultados</h2><p>CRUD completo de resultados apurados.</p></div><Link className="button" href="/resultados/novo">Novo resultado</Link></section><section className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Referência</th><th>Indicador</th><th>Resultado</th><th>Meta</th><th>Atingimento</th><th>Semáforo</th><th>Ações</th></tr></thead><tbody>{results.map(result=><tr key={result.id}><td>{result.referenceDate.toISOString().slice(0,7)}</td><td>{result.indicator.code} - {result.indicator.name}</td><td>{formatIndicatorValue(result.actualValue,result.indicator.unit)}</td><td>{formatIndicatorValue(result.targetValue,result.indicator.unit)}</td><td>{result.achievement.toFixed(1)}%</td><td><TrafficBadge value={result.trafficLight}/></td><td><div className="table-actions"><Link className="button small secondary" href={`/resultados/${result.id}/editar`}>Editar</Link><form action={deleteResult.bind(null,result.id)}><button className="button small danger">Excluir</button></form></div></td></tr>)}</tbody></table></div></section></>;
}

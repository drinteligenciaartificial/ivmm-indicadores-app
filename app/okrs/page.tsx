import Link from "next/link";
import { deleteOkr } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { formatArea } from "@/lib/kpi";
import { requireFeature } from "@/lib/auth";

export default async function OkrsPage() {
  await requireFeature("okrs");
  const okrs = await prisma.okr.findMany({ include: { indicators: { include: { indicator: { include: { results: { orderBy: { referenceDate: "desc" }, take: 1 } } } } } } });
  return <><section className="page-header"><div><h2>OKRs Vinculados aos Indicadores</h2><p>CRUD completo de objetivos e indicadores-chave.</p></div><Link className="button" href="/okrs/novo">Novo OKR</Link></section><section className="grid">{okrs.map(okr=>{const items=okr.indicators.map(i=>i.indicator).filter(i=>i.results[0]);const score=items.length?items.reduce((a,i)=>a+i.results[0].achievement,0)/items.length:0;return <div className="card" key={okr.id}><div className="page-header" style={{marginBottom:12}}><div><h3>{okr.title}</h3><p><b>Objetivo:</b> {okr.objective}</p><p><b>Área:</b> {formatArea(okr.area)} | <b>Responsável:</b> {okr.owner} | <b>Score:</b> {score.toFixed(1)}%</p></div><div className="table-actions"><Link className="button small secondary" href={`/okrs/${okr.id}/editar`}>Editar</Link><form action={deleteOkr.bind(null,okr.id)}><button className="button small danger">Excluir</button></form></div></div><table className="table"><thead><tr><th>Indicador</th><th>Peso</th><th>Atingimento</th></tr></thead><tbody>{okr.indicators.map(rel=><tr key={rel.id}><td>{rel.indicator.code} - {rel.indicator.name}</td><td>{rel.weight}</td><td>{rel.indicator.results[0]?.achievement.toFixed(1)??"-"}%</td></tr>)}</tbody></table></div>})}</section></>;
}

import { createResult } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth";

export default async function NewResultPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireFeature("resultados");
  const params = await searchParams;
  const indicators = await prisma.indicator.findMany({ orderBy: { code: "asc" }, include: { goals: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 1 } } });
  return <><section className="page-header"><div><h2>Novo Resultado</h2><p>Lançamento com cálculo automático de atingimento e semáforo.</p></div></section><ResultForm action={createResult} indicators={indicators} defaultIndicatorId={params.indicatorId} /></>;
}

export function ResultForm({ action, indicators, result, defaultIndicatorId }: { action: (formData: FormData) => void; indicators: any[]; result?: any; defaultIndicatorId?: string }) {
  const reference = result?.referenceDate ? new Date(result.referenceDate) : new Date();
  return <form action={action} className="card form"><label>Indicador<select className="select" name="indicatorId" defaultValue={result?.indicatorId??defaultIndicatorId}>{indicators.map(i=><option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}</select></label><div className="grid grid-3"><label>Ano<input className="input" name="year" type="number" defaultValue={reference.getUTCFullYear()} required/></label><label>Mês<input className="input" name="month" type="number" min="1" max="12" defaultValue={reference.getUTCMonth()+1} required/></label><label>Resultado<input className="input" name="actualValue" type="number" step="0.01" defaultValue={result?.actualValue??""} required/></label></div><label>Análise<textarea className="textarea" name="analysis" defaultValue={result?.analysis??""}/></label><label>Plano de ação<textarea className="textarea" name="actionPlan" defaultValue={result?.actionPlan??""}/></label><button className="button">Salvar</button></form>;
}

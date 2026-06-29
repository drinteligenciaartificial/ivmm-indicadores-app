import { createOkr } from "@/app/actions";
import { areas } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth";

export default async function NewOkrPage() {
  await requireFeature("okrs");
  const indicators = await prisma.indicator.findMany({ orderBy: { code: "asc" } });
  return <><section className="page-header"><div><h2>Novo OKR</h2><p>Vincule objetivos aos indicadores de desempenho.</p></div></section><OkrForm action={createOkr} indicators={indicators} /></>;
}

export function OkrForm({ action, indicators, okr }: { action: (formData: FormData) => void; indicators: any[]; okr?: any }) {
  const selected = new Set((okr?.indicators ?? []).map((rel: any) => rel.indicatorId));
  return <form action={action} className="card form"><div className="grid grid-2"><label>Título<input className="input" name="title" defaultValue={okr?.title??""} required/></label><label>Área<select className="select" name="area" defaultValue={okr?.area}>{areas.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div><label>Objetivo<textarea className="textarea" name="objective" defaultValue={okr?.objective??""} required/></label><div className="grid grid-3"><label>Ano<input className="input" name="year" type="number" defaultValue={okr?.year??2026} required/></label><label>Trimestre<input className="input" name="quarter" type="number" min="1" max="4" defaultValue={okr?.quarter??""}/></label><label>Responsável<input className="input" name="owner" defaultValue={okr?.owner??"Head de Operações"} required/></label></div><div className="card"><h3>Indicadores vinculados</h3><div className="grid grid-2">{indicators.map(indicator=><label className="check-row" key={indicator.id}><input type="checkbox" name="indicatorIds" value={indicator.id} defaultChecked={selected.has(indicator.id)}/>{indicator.code} - {indicator.name}</label>)}</div></div><button className="button">Salvar</button></form>;
}

import { createGoal } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth";

export default async function NewGoalPage() {
  await requireFeature("metas");
  const indicators = await prisma.indicator.findMany({ orderBy: { code: "asc" } });
  return <><section className="page-header"><div><h2>Nova Meta</h2><p>Defina a meta de referência para um indicador.</p></div></section><GoalForm action={createGoal} indicators={indicators} /></>;
}

function GoalForm({ action, indicators, goal }: { action: (formData: FormData) => void; indicators: any[]; goal?: any }) {
  return <form action={action} className="card form"><label>Indicador<select className="select" name="indicatorId" defaultValue={goal?.indicatorId}>{indicators.map(i=><option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}</select></label><div className="grid grid-3"><label>Ano<input className="input" name="year" type="number" defaultValue={goal?.year??2026} required/></label><label>Trimestre<input className="input" name="quarter" type="number" min="1" max="4" defaultValue={goal?.quarter??""}/></label><label>Mês<input className="input" name="month" type="number" min="1" max="12" defaultValue={goal?.month??""}/></label></div><div className="grid grid-4"><label>Meta<input className="input" name="targetValue" type="number" step="0.01" defaultValue={goal?.targetValue??""} required/></label><label>Alerta<input className="input" name="alertValue" type="number" step="0.01" defaultValue={goal?.alertValue??""}/></label><label>Mínimo<input className="input" name="minimumValue" type="number" step="0.01" defaultValue={goal?.minimumValue??""}/></label><label>Ideal<input className="input" name="idealValue" type="number" step="0.01" defaultValue={goal?.idealValue??""}/></label></div><button className="button">Salvar</button></form>;
}

export { GoalForm };

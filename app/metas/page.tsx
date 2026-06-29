import Link from "next/link";
import { deleteGoal } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth";

export default async function GoalsPage() {
  await requireFeature("metas");
  const goals = await prisma.goal.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], include: { indicator: true } });
  return (
    <>
      <section className="page-header"><div><h2>Metas</h2><p>CRUD completo de metas mensais, trimestrais e anuais.</p></div><Link className="button" href="/metas/novo">Nova meta</Link></section>
      <section className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Indicador</th><th>Ano</th><th>Trimestre</th><th>Mês</th><th>Meta</th><th>Alerta</th><th>Mínimo</th><th>Ideal</th><th>Ações</th></tr></thead><tbody>{goals.map(goal=><tr key={goal.id}><td>{goal.indicator.code} - {goal.indicator.name}</td><td>{goal.year}</td><td>{goal.quarter??"-"}</td><td>{goal.month??"-"}</td><td>{goal.targetValue}</td><td>{goal.alertValue??"-"}</td><td>{goal.minimumValue??"-"}</td><td>{goal.idealValue??"-"}</td><td><div className="table-actions"><Link className="button small secondary" href={`/metas/${goal.id}/editar`}>Editar</Link><form action={deleteGoal.bind(null,goal.id)}><button className="button small danger">Excluir</button></form></div></td></tr>)}</tbody></table></div></section>
    </>
  );
}

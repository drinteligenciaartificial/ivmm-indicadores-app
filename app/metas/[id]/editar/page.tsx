import { notFound } from "next/navigation";
import { updateGoal } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { GoalForm } from "../../novo/page";
import { requireFeature } from "@/lib/auth";

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireFeature("metas");
  const [goal, indicators] = await Promise.all([prisma.goal.findUnique({ where: { id } }), prisma.indicator.findMany({ orderBy: { code: "asc" } })]);
  if (!goal) notFound();
  return <><section className="page-header"><div><h2>Editar Meta</h2><p>Atualize os valores de referência.</p></div></section><GoalForm action={updateGoal.bind(null, goal.id)} indicators={indicators} goal={goal} /></>;
}

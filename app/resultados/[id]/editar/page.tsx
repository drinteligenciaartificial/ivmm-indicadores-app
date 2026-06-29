import { notFound } from "next/navigation";
import { updateResult } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { ResultForm } from "../../novo/page";
import { requireFeature } from "@/lib/auth";

export default async function EditResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireFeature("resultados");
  const [result, indicators] = await Promise.all([prisma.result.findUnique({ where: { id } }), prisma.indicator.findMany({ orderBy: { code: "asc" } })]);
  if (!result) notFound();
  return <><section className="page-header"><div><h2>Editar Resultado</h2><p>Atualize resultado, meta, análise e plano de ação.</p></div></section><ResultForm action={updateResult.bind(null, result.id)} indicators={indicators} result={result} /></>;
}

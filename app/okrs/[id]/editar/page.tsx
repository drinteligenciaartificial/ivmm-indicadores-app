import { notFound } from "next/navigation";
import { updateOkr } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { OkrForm } from "../../novo/page";
import { requireFeature } from "@/lib/auth";

export default async function EditOkrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireFeature("okrs");
  const [okr, indicators] = await Promise.all([
    prisma.okr.findUnique({ where: { id }, include: { indicators: true } }),
    prisma.indicator.findMany({ orderBy: { code: "asc" } }),
  ]);
  if (!okr) notFound();
  return <><section className="page-header"><div><h2>Editar OKR</h2><p>{okr.title}</p></div></section><OkrForm action={updateOkr.bind(null, okr.id)} indicators={indicators} okr={okr} /></>;
}

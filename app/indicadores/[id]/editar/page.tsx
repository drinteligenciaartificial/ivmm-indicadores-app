import { notFound } from "next/navigation";
import { updateIndicator } from "@/app/actions";
import { IndicatorForm } from "@/components/FormFields";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditIndicatorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireFeature("indicadores");
  const { id } = await params;
  const indicator = await prisma.indicator.findUnique({ where: { id } });
  if (!indicator) notFound();
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Editar Ficha Técnica</h2>
          <p>{indicator.code} - {indicator.name}</p>
        </div>
      </section>
      <IndicatorForm action={updateIndicator.bind(null, indicator.id)} indicator={indicator} />
    </>
  );
}

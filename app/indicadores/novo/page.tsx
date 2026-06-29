import { createIndicator } from "@/app/actions";
import { IndicatorForm } from "@/components/FormFields";
import { requireFeature } from "@/lib/auth";

export default async function NewIndicatorPage() {
  await requireFeature("indicadores");
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Nova Ficha Técnica</h2>
          <p>Cadastro completo do indicador. A coleta de dados fica sempre com a Coordenação Administrativa.</p>
        </div>
      </section>
      <IndicatorForm action={createIndicator} />
    </>
  );
}

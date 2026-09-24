import { requireFeature } from "@/lib/auth";

export default async function FinancePage() {
  await requireFeature("financeiro");
  return (
    <section className="page-header">
      <div>
        <h2>Gestão Financeira</h2>
        <p>Módulo reservado para a próxima solução integrada do IVMM.</p>
      </div>
    </section>
  );
}

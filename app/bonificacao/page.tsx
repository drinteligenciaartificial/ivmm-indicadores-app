import { requireFeature } from "@/lib/auth";

export default async function BonusPage() {
  await requireFeature("bonificacao");
  return (
    <section className="page-header">
      <div>
        <h2>Programa de Bonificação</h2>
        <p>Módulo reservado para regras, elegibilidade e acompanhamento de bonificação.</p>
      </div>
    </section>
  );
}

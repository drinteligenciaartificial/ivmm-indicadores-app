import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RecruitmentSettingsPage() {
  await requireFeature("recrutamento");
  const positions = await prisma.recruitmentPosition.findMany({ orderBy: { title: "asc" } });
  return (
    <>
      <section className="page-header"><div><h2>Configurações do MRS-IVMM</h2><p>Pesos, valores culturais e critérios usados pelos cargos cadastrados.</p></div></section>
      <RecruitmentNav />
      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Valores IVMM</h3>
          <div className="tag-row"><span>Lealdade</span><span>Dedicação</span><span>Reconhecimento</span><span>Crescimento</span></div>
          <p className="muted">Esses valores compõem o IAC, sempre a partir de evidências observáveis e validação humana.</p>
        </div>
        <div className="card">
          <h3>Pesos por cargo</h3>
          {positions.map((position) => (
            <article className="evidence-box" key={position.id}>
              <b>{position.title}</b>
              <pre className="pre-wrap">{position.competencyWeights}</pre>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

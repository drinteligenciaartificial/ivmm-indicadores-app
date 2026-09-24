import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RecruitmentAiPage() {
  await requireFeature("recrutamento");
  const analyses = await prisma.recruitmentAiAnalysis.findMany({ include: { candidate: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="page-header"><div><h2>IA e Análises</h2><p>Assistente de recrutamento com evidências, contexto usado e validação humana obrigatória.</p></div></section>
      <RecruitmentNav />
      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Princípios de uso</h3>
          <p>A IA não aprova nem rejeita candidatos. Ela resume evidências, aponta lacunas, sugere perguntas e registra os dados usados.</p>
          <div className="evidence-box"><b>Campos protegidos</b><br />Sexo, idade, raça, religião, saúde, estado civil, gravidez, deficiência, orientação sexual e dados médicos não devem alimentar scores.</div>
          <div className="evidence-box"><b>Explicabilidade</b><br />Todo parecer precisa mostrar fontes, evidências e limites. O raciocínio interno do modelo não é exibido.</div>
        </div>
        <div className="card">
          <h3>Histórico de análises</h3>
          {analyses.map((analysis) => <article className="evidence-box" key={analysis.id}><b>{analysis.candidate.name} · {analysis.analysisType}</b><p>{analysis.result}</p><small>{analysis.promptVersion} · {analysis.model} · {analysis.status}</small></article>)}
        </div>
      </section>
    </>
  );
}

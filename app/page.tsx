import Link from "next/link";
import { ArrowRight, BarChart3, CircleDollarSign, Gift, UsersRound } from "lucide-react";
import { canAccess, requireUser } from "@/lib/auth";

const modules = [
  {
    title: "Dashboard Executivo",
    description: "Indicadores, metas, resultados, BSC, OKRs e visão executiva consolidada.",
    href: "/dashboard",
    feature: "dashboard",
    icon: BarChart3,
    status: "Operacional",
  },
  {
    title: "Recrutamento e Seleção",
    description: "Cargos, vagas, candidatos, entrevistas, assessments, evidências e indicadores de contratação.",
    href: "/recrutamento",
    feature: "recrutamento",
    icon: UsersRound,
    status: "Novo módulo",
  },
  {
    title: "Gestão Financeira",
    description: "Controle financeiro integrado aos indicadores institucionais.",
    href: "/financeiro",
    feature: "financeiro",
    icon: CircleDollarSign,
    status: "Em estruturação",
  },
  {
    title: "Programa de Bonificação",
    description: "Regras, elegibilidade, acompanhamento e simulações de bonificação.",
    href: "/bonificacao",
    feature: "bonificacao",
    icon: Gift,
    status: "Em estruturação",
  },
] as const;

export default async function IntegratedHomePage() {
  const user = await requireUser();
  const accessibleModules = modules.filter((module) => canAccess(user, module.feature));

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Sistema de Gestão Integrada</h2>
          <p>Escolha a solução que deseja acessar no Instituto Viver Mais e Melhor.</p>
        </div>
      </section>

      <section className="module-grid">
        {accessibleModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.title} href={module.href} className="module-card">
              <div className="module-icon"><Icon aria-hidden="true" size={24} /></div>
              <div>
                <span className="module-status">{module.status}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <ArrowRight className="module-arrow" aria-hidden="true" size={20} />
            </Link>
          );
        })}
      </section>
    </>
  );
}

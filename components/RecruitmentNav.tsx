import Link from "next/link";

const items = [
  ["/recrutamento", "Dashboard"],
  ["/recrutamento/cargos", "Cargos e Requisitos"],
  ["/recrutamento/candidatos", "Candidatos"],
  ["/recrutamento/processos", "Processos"],
  ["/recrutamento/entrevistas", "Entrevistas"],
  ["/recrutamento/assessment", "Assessment"],
  ["/recrutamento/comparar", "Comparar"],
  ["/recrutamento/banco-talentos", "Banco de Talentos"],
  ["/recrutamento/ia", "IA e Análises"],
  ["/recrutamento/configuracoes", "Configurações"],
] as const;

export function RecruitmentNav() {
  return (
    <nav className="subnav" aria-label="Navegação do recrutamento">
      {items.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
  );
}

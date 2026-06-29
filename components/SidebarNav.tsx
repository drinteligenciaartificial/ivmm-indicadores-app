"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BriefcaseBusiness,
  CalendarCheck2,
  ChartColumnBig,
  ChartNoAxesCombined,
  Goal,
  History,
  Landmark,
  LayoutDashboard,
  LibraryBig,
  Target,
  UsersRound,
} from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  indicadores: LibraryBig,
  metas: Target,
  resultados: ChartNoAxesCombined,
  lancamentos: CalendarCheck2,
  scorecard: ChartColumnBig,
  bsc: ChartColumnBig,
  okrs: Goal,
  "head-operacoes": BriefcaseBusiness,
  conselho: Landmark,
  "ia-automacao": Bot,
  historico: History,
  usuarios: UsersRound,
};

type SidebarLink = { key: string; label: string; href: string };

export function SidebarNav({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal">
      {links.map((link) => {
        const Icon = icons[link.key as keyof typeof icons] ?? LayoutDashboard;
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link key={link.key} href={link.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

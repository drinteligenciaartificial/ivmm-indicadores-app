import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { logout } from "@/app/actions";
import { GlobalButtonLoading } from "@/components/GlobalButtonLoading";
import { SidebarNav } from "@/components/SidebarNav";
import { SubmitButton } from "@/components/SubmitButton";
import { canAccess, getCurrentUser } from "@/lib/auth";
import { features } from "@/lib/constants";
import { formatRole } from "@/lib/kpi";

export const metadata = {
  title: "IVMM | Dashboard Executivo",
  description: "Dashboard Executivo do Instituto Viver Mais e Melhor",
};

const hiddenFeatures = new Set(["exportacoes"]);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const links = features.filter(([key]) => !hiddenFeatures.has(key)).filter(([key]) => canAccess(user, key as any));
  const navigation = links.map(([key, label, href]) => ({ key, label, href }));
  return (
    <html lang="pt-BR">
      <body>
        <GlobalButtonLoading />
        <div className={`layout${user ? "" : " logged-out"}`}>
          <aside className="sidebar">
            <Link className="brand-lockup" href="/" aria-label="Instituto Viver Mais e Melhor">
              <Image src="/brand/ivmm-wordmark-light.png" alt="Instituto Viver Mais e Melhor" width={4500} height={599} priority unoptimized />
            </Link>
            <div className="product-title">
              <span>Painel de gestão</span>
              <h1>Dashboard Executivo</h1>
            </div>
            <SidebarNav links={navigation} />
            <div className="user-box">
              {user ? (
                <>
                  <b>{user.name}</b>
                  <span>{formatRole(user.role)}</span>
                  <Link className="ghost-button" href="/perfil"><UserRound aria-hidden="true" size={16} />Meu perfil</Link>
                  <form action={logout}><SubmitButton className="ghost-button" pendingLabel="Saindo..."><LogOut aria-hidden="true" size={16} />Sair</SubmitButton></form>
                </>
              ) : (
                <Link className="ghost-button" href="/login"><LogIn aria-hidden="true" size={16} />Entrar</Link>
              )}
            </div>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}

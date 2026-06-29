import { login } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const demoLogin = process.env.NODE_ENV !== "production" || process.env.DEMO_LOGIN === "true";
  const users = demoLogin ? await prisma.user.findMany({ orderBy: { role: "asc" } }) : [];
  return (
    <div className="login-shell">
      <form action={login} className="card form login-card">
        <div className="login-brand">
          <Image src="/brand/ivmm-seal.png" alt="Instituto Viver Mais e Melhor" width={3000} height={2900} priority unoptimized />
          <div>
            <h2>Login</h2>
          <p className="muted">{demoLogin ? "Acesso de demonstração" : "Acesso ao Dashboard Executivo"}</p>
          </div>
        </div>
        {params.erro && <p style={{ color: "var(--red)" }}>E-mail ou senha inválidos.</p>}
        <label>
          Usuário
          {demoLogin ? (
            <select className="select" name="email" required>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          ) : (
            <input className="input" name="email" type="email" autoComplete="username" required />
          )}
        </label>
        <label>
          Senha
          <input className="input" name="password" type="password" autoComplete="current-password" required placeholder={demoLogin ? "admin123, coord123, head123 ou conselho123" : undefined} />
        </label>
        <button className="button" type="submit">Entrar</button>
      </form>
    </div>
  );
}

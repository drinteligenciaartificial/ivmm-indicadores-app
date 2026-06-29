import { createUser, deleteUser, updateUser } from "@/app/actions";
import { parsePermissions, requireAdmin } from "@/lib/auth";
import { features, profiles, rolePermissions } from "@/lib/constants";
import { formatRole } from "@/lib/kpi";
import { prisma } from "@/lib/prisma";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Usuários e Permissões</h2>
          <p>Cadastre novos usuários e configure o acesso de cada perfil às funcionalidades do sistema.</p>
        </div>
      </section>
      {params.erro === "proprio" && <p style={{ color: "var(--red)" }}>O administrador não pode excluir o próprio usuário logado.</p>}
      <section className="card form">
        <h3>Novo usuário</h3>
        <UserForm action={createUser} />
      </section>
      <section className="grid" style={{ marginTop: 18 }}>
        {users.map((user) => (
          <div className="card" key={user.id}>
            <div className="page-header" style={{ marginBottom: 12 }}>
              <div>
                <h3>{user.name}</h3>
                <p>{user.email} | {formatRole(user.role)}</p>
              </div>
              <form action={deleteUser.bind(null, user.id)}><button className="button small danger" type="submit">Excluir</button></form>
            </div>
            <UserForm action={updateUser.bind(null, user.id)} user={user} />
          </div>
        ))}
      </section>
    </>
  );
}

function UserForm({ action, user }: { action: (formData: FormData) => void; user?: any }) {
  const selected = new Set(user ? parsePermissions(user.permissions) : rolePermissions.USUARIO_PERSONALIZADO);
  return (
    <form action={action} className="form">
      <div className="grid grid-3">
        <label>Nome do usuário<input className="input" name="name" defaultValue={user?.name ?? ""} placeholder="Ex.: Maria Silva" required /></label>
        <label>E-mail de acesso<input className="input" name="email" type="email" defaultValue={user?.email ?? ""} placeholder="maria@ivmm.com.br" required /></label>
        <label>Perfil de acesso<select className="select" name="role" defaultValue={user?.role ?? "USUARIO_PERSONALIZADO"}>{profiles.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <label>{user ? "Nova senha opcional" : "Senha"}<input className="input" name="password" type="password" minLength={8} required={!user} /></label>
      <fieldset className="permission-panel">
        <legend>Permissões por funcionalidade</legend>
        <div className="permission-grid">
          {features.map(([key,label]) => (
            <label className="check-row" key={key}>
              <input type="checkbox" name="permissions" value={key} defaultChecked={selected.has(key)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="button" type="submit">Salvar usuário</button>
    </form>
  );
}

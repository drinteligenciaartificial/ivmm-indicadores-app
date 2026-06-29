import { updateProfile } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { formatRole } from "@/lib/kpi";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  return (
    <>
      <section className="page-header">
        <div>
          <h2>Meu Perfil</h2>
          <p>Atualize seu nome de usuário e troque sua senha após confirmar a senha atual.</p>
        </div>
      </section>
      <section className="grid grid-2">
        <form action={updateProfile} className="card form">
          <h3>Dados de acesso</h3>
          {params.ok && <p style={{ color: "var(--green)" }}>Perfil atualizado.</p>}
          {params.erro === "senha" && <p style={{ color: "var(--red)" }}>Senha atual incorreta.</p>}
          {params.erro === "confirmacao" && <p style={{ color: "var(--red)" }}>A nova senha e a confirmação não conferem.</p>}
          <label>Nome de usuário<input className="input" name="name" defaultValue={user.name} required /></label>
          <label>E-mail<input className="input" value={user.email} disabled /></label>
          <label>Perfil<input className="input" value={formatRole(user.role)} disabled /></label>
          <label>Senha atual<input className="input" name="currentPassword" type="password" required /></label>
          <label>Nova senha<input className="input" name="newPassword" type="password" minLength={8} placeholder="Deixe em branco para manter" /></label>
          <label>Confirmar nova senha<input className="input" name="confirmPassword" type="password" /></label>
          <button className="button" type="submit">Salvar perfil</button>
        </form>
        <div className="card">
          <h3>Permissões ativas</h3>
          <p className="muted">Estas são as funcionalidades liberadas para o seu usuário.</p>
          <div className="permission-list">
            {user.permissions.map((permission) => <span className="badge" key={permission}>{permission}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}

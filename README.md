# IVMM Indicadores App

Código-base para transformar a planilha **IVMM Sistema de Gestão por Indicadores V3.0** em um app web.

## Stack

- Next.js com App Router
- TypeScript
- Prisma ORM
- SQLite para protótipo local
- PostgreSQL para produção
- Recharts para gráficos

## Funcionalidades incluídas

- Dashboard executivo com gráficos
- Banco único de indicadores
- CRUD completo de indicadores e ficha técnica digital
- CRUD completo de metas
- CRUD completo de resultados
- CRUD completo de OKRs
- Tela mensal para lançamento de resultados
- Semáforo automático: verde, amarelo e vermelho
- Metas mensais, trimestrais e anuais
- Matriz BSC integrada
- OKRs vinculados aos indicadores
- Scorecard por área
- Dashboard do Head de Operações
- Dashboard do Conselho Consultivo
- Aba de IA e automação
- Cálculo automático de atingimento de metas
- Filtros por área, BSC, mês, trimestre, ano e semáforo
- Exportação de indicadores para Excel/CSV e PDF
- Dashboard executivo com painel de seleção por status, indicador, área, tempo e semáforo
- Exportação do dashboard filtrado em PNG ou JPG
- Exportação do Banco de Indicadores e Fichas em Excel e PDF com layout visual institucional
- Lançamento mensal com modelo de planilha por indicador e importação de dados preenchidos
- Histórico de alterações
- Login com perfis
- Aba **Meu Perfil** para trocar nome de usuário e senha mediante confirmação da senha atual
- Administração de usuários para criar usuários e configurar permissões por funcionalidade

## Como rodar localmente

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

O seed carrega os 12 indicadores oficiais iniciais do IVMM, suas metas de referência e os OKRs documentados. Ele não cria resultados mensais de demonstração.

Acesse `http://127.0.0.1:3001`.

## Usuários de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | admin@ivmm.local | admin123 |
| Head de Operações | head@ivmm.local | head123 |
| Coordenação Administrativa | coordenacao@ivmm.local | coord123 |
| Conselho Consultivo | conselho@ivmm.local | conselho123 |

## Perfil e permissões

Todo usuário autenticado acessa **Meu perfil** pela lateral do sistema.
Nessa tela ele pode alterar nome de usuário e definir uma nova senha, sempre informando a senha atual.

O perfil **Administrador** acessa **Usuários e Permissões**.
Nessa área é possível:

- cadastrar novos usuários;
- alterar nome, e-mail, senha e perfil;
- liberar ou remover acesso a cada funcionalidade do sistema;
- excluir usuários, exceto o próprio administrador logado.

As permissões controlam a navegação lateral e o acesso direto às páginas protegidas.

## Regra de coleta de dados

A coleta de dados é sempre atribuída à **Coordenação Administrativa**.
Mesmo que um formulário seja alterado no navegador, as ações de servidor forçam `responsiblePrimary` e `collectionOwner` para `Coordenação Administrativa`.
O Head de Operações acompanha indicadores, gargalos e planos de ação, mas não fica como responsável pela coleta.

## Exportações

- Excel: `/export/excel`
- PDF: `/export/pdf`

As exportações respeitam os filtros usados no Banco de Indicadores.
O arquivo Excel é gerado em formato `.xls` com HTML estilizado, preservando cores, cabeçalho e tabela visual.
O PDF usa cabeçalho institucional e tabela com semáforo.

## Importação de lançamentos

Na tela **Lançamento Mensal**, selecione um indicador e use **Exportar modelo de planilha**.
O modelo gerado é um CSV compatível com Excel, com as colunas:

`codigo_indicador`, `ano`, `mes`, `resultado`, `meta`, `analise`, `plano_acao`

Depois de preencher a planilha, salve em CSV e use **Solicitar importação de dados**.
O sistema calcula automaticamente atingimento e semáforo no momento da importação.

## Publicação no Render

O arquivo `render.yaml` cria automaticamente:

- um Web Service Node.js para o Next.js;
- um banco PostgreSQL do Render;
- a variável `DATABASE_URL` ligada ao banco;
- um segredo de sessão gerado pelo Render;
- a migração e a carga inicial dos 12 indicadores oficiais.

Na primeira criação do Blueprint, o Render solicitará:

- `ADMIN_EMAIL`: e-mail do primeiro administrador;
- `ADMIN_PASSWORD`: senha forte com pelo menos 12 caracteres.

O login de produção não exibe a lista de usuários. Senhas são armazenadas com `scrypt` e a sessão é assinada.

### Escolha do plano

O Blueprint começa no plano gratuito para permitir uma homologação sem cobrança. O PostgreSQL gratuito do Render expira após 30 dias e não deve receber dados definitivos. Antes do uso contínuo, altere o banco para `Basic-256mb` e, se o sistema não puder hibernar, o Web Service para `Starter`.

Depois que o repositório estiver publicado, use **New > Blueprint** no Render e selecione `drinteligenciaartificial/ivmm-indicadores-app`. O Render detectará o `render.yaml` na raiz.

## Prompt para usar no Codex

```text
Você é um engenheiro full-stack sênior. Evolua este projeto Next.js + Prisma chamado IVMM Indicadores App.

Objetivo:
Transformar o protótipo em um sistema de gestão por indicadores pronto para uso no Instituto Viver Mais e Melhor.

Prioridades:
1. Criar CRUD completo para Indicadores, Metas, Resultados e OKRs.
2. Criar tela para lançamento mensal de resultados.
3. Implementar edição completa da ficha técnica do indicador.
4. Implementar autenticação com perfis: Administrador, Head de Operações, Coordenação Administrativa e Conselho Consultivo.
5. Garantir que a Coordenação Administrativa seja a responsável padrão pela coleta de dados.
6. Criar filtros por área, BSC, mês, trimestre, ano e semáforo.
7. Criar exportação para Excel e PDF.
8. Criar trilha de auditoria de alterações.
9. Criar endpoint de API para integração futura com Power BI.
10. Preparar migração de SQLite para PostgreSQL.

Regras de negócio:
- MAIOR_MELHOR: atingimento = resultado / meta * 100.
- MENOR_MELHOR: atingimento = meta / resultado * 100.
- Verde: atingimento >= 100%.
- Amarelo: atingimento >= 80% e < 100%.
- Vermelho: atingimento < 80%.
- Todo indicador vermelho deve exigir plano de ação.
- Todo indicador deve estar vinculado a uma perspectiva BSC.
- Todo indicador pode estar vinculado a um ou mais OKRs.
- Indicadores de IA devem ter elegibilidade, fonte integrável, agente responsável, confiabilidade e auditoria.

Ao modificar o projeto:
- Mantenha TypeScript estrito.
- Evite bibliotecas desnecessárias.
- Separe componentes reutilizáveis.
- Garanta responsividade.
- Atualize o README com as mudanças.
```

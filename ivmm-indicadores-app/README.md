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
- Ficha técnica digital de indicadores
- Semáforo automático: verde, amarelo e vermelho
- Metas mensais, trimestrais e anuais
- Matriz BSC integrada
- OKRs vinculados aos indicadores
- Scorecard por área
- Dashboard do Head de Operações
- Dashboard do Conselho Consultivo
- Aba de IA e automação
- Cálculo automático de atingimento de metas

## Como rodar localmente

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Acesse `http://localhost:3000`.

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

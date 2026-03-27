# PROJECT_CONTEXT.md — Sede do Movimento

> Arquivo de contexto geral do projeto. Leia antes de iniciar qualquer sessão de trabalho.
> Não contém valores sensíveis — seguro para commitar no GitHub.
> Para valores reais de variáveis de ambiente, consulte .env.local (local) ou o painel da Vercel.

---

## 1. O QUE É A SEDE DO MOVIMENTO

A **Sede do Movimento** é um polo cultural localizado na **Ilha da Conceição, Niterói/RJ**, dedicado à dança, artes cênicas e cultura. É um espaço multidisciplinar que reúne formação artística, produção profissional, impacto social e criação audiovisual sob um mesmo teto.

### Missão
Formar artistas, transformar vidas e produzir cultura de excelência — com foco em dança contemporânea, artes cênicas e audiovisual.

### Frentes do projeto

| Frente | Descrição |
|---|---|
| **Escola de Artes Cênicas e Dança** | Formação em Ballet, Jazz, Sapateado, Danças Urbanas, Teatro, Música, Circo e Capoeira. Atende desde 2 anos até adultos. |
| **Companhia Profissional de Dança** | Grupo de dança profissional com espetáculos autorais e circulação em festivais nacionais e internacionais. |
| **Projeto Social — Sede de Aprender** | Programa de inclusão que oferece acesso à arte para crianças e jovens em situação de vulnerabilidade. |
| **Produtora Audiovisual** | Produção de vídeos, documentários, registros de espetáculos e conteúdo audiovisual para projetos culturais. |
| **Produtora Cultural** | Captação e gestão de projetos incentivados (Lei Rouanet e outras leis de fomento). Realização de eventos e festivais de dança. |
| **Ateliê Fontinelle** | Espaço de criação artística, figurinos e artes visuais integrado ao polo cultural. |

---

## 2. PÚBLICO-ALVO DO SITE

O site se dirige a múltiplos públicos simultaneamente:

| Público | O que busca no site |
|---|---|
| **Alunos e responsáveis** | Informações sobre cursos, modalidades, horários, matrículas e mensalidades |
| **Artistas e bailarinos profissionais** | Informações sobre a Companhia, audições, residências e trabalhe conosco |
| **Parceiros e patrocinadores** | Apresentação institucional, portfólio de espetáculos, projetos incentivados |
| **Público geral / cultura RJ** | Agenda de espetáculos, eventos, galeria e blog |
| **Produtores e realizadores culturais** | Portfólio da produtora, captação via leis de incentivo, co-produções |
| **Setor audiovisual** | Portfólio de produções audiovisuais, parcerias de conteúdo |
| **Projetos incentivados** | Documentação institucional, histórico de projetos, prestação de contas cultural |

### Tom de comunicação
Visual, emocional e profissional. O site deve transmitir **excelência artística** sem perder **acessibilidade e acolhimento**. A dança é o fio condutor de toda a comunicação.

---

## 3. URLS ÚTEIS DO PROJETO

| Destino | URL |
|---|---|
| **Site em produção** | https://www.sededomovimento.art |
| **Sanity Studio (produção)** | https://www.sededomovimento.art/studio |
| **Sanity Studio (local)** | http://localhost:3000/studio |
| **Site local (dev)** | http://localhost:3000 |
| **Repositório GitHub** | https://github.com/andreadamibrazil/Site-Sede-do-Movimento |
| **Painel Vercel** | https://vercel.com/andreadami-1431s-projects/site-sede-do-movimento |
| **Preview Vercel (último deploy)** | https://site-sede-do-movimento-i0lkniu5o-andreadami-1431s-projects.vercel.app |
| **Painel Sanity** | https://www.sanity.io/organizations/oQAlgok4b/project/jjdv6wy3 |

---

## 4. VARIÁVEIS DE AMBIENTE

### Onde configurar
- **Desenvolvimento local:** arquivo `.env.local` na raiz do projeto (nunca commitar)
- **Produção:** painel da Vercel → Project → Settings → Environment Variables

### Variáveis necessárias

| Variável | Obrigatória | Onde encontrar o valor |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Sim | Painel Sanity → Project → API → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Sim | Painel Sanity → Datasets (valor: `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ❌ Opcional | Usar `2026-03-24` como padrão |
| `SANITY_API_READ_TOKEN` | ✅ Sim (preview) | Painel Sanity → API → Tokens → criar token com permissão Viewer |

### Como criar um token de leitura no Sanity
1. Acesse: https://www.sanity.io/organizations/oQAlgok4b/project/jjdv6wy3
2. Vá em **API → Tokens**
3. Clique em **Add API token**
4. Nome: `next-read-token`
5. Permissão: **Viewer**
6. Copie o valor e adicione como `SANITY_API_READ_TOKEN` no `.env.local` e na Vercel

### Template do .env.local
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-03-24
SANITY_API_READ_TOKEN=
```

---

## 5. GUIA DE ACESSO PARA COLABORADORES

### Para desenvolvedores novos no projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/andreadamibrazil/Site-Sede-do-Movimento.git
   cd Site-Sede-do-Movimento
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo `.env.local` na raiz com as variáveis da seção 4 (solicitar valores ao responsável do projeto)

4. Rode localmente:
   ```bash
   npm run dev
   ```

5. Leia obrigatoriamente antes de editar qualquer coisa:
   - `CLAUDE.md` — regras absolutas de desenvolvimento
   - `PROJECT_ARCHITECTURE.md` — mapa completo de arquivos
   - `CMS_EDITABLE_AREAS.md` — o que é gerenciado pelo Sanity
   - `INTEGRATION_MAP.md` — integrações externas e pontos de atenção
   - `design-system.md` — tokens de cor, tipografia e componentes

### Para editores de conteúdo (sem acesso ao código)

1. Acesse o Sanity Studio: https://www.sededomovimento.art/studio
2. Faça login com sua conta Sanity (solicitar acesso ao responsável)
3. No Studio você pode gerenciar:
   - Hero Slides (banners da home)
   - Blog (posts e artigos)
   - Galerias de fotos e vídeos
   - Turmas e horários
   - Espetáculos
   - Informações de contato e rodapé

### Para convidar um novo editor no Sanity
1. Acesse: https://www.sanity.io/organizations/oQAlgok4b/project/jjdv6wy3
2. Vá em **Members → Invite**
3. Informe o e-mail do colaborador
4. Escolha o papel: **Editor** (para gestão de conteúdo) ou **Developer** (para acesso total)

---

## 6. FLUXO DE DEPLOY

```
Edição local (Cursor / VS Code)
         │
         ▼
   npm run build   ← testar antes de subir
         │
         ▼
   git push main
         │
         ▼
   Vercel detecta push automático
         │
         ▼
   Deploy em produção (~2 min)
         │
         ▼
   sededomovimento.art atualizado
```

### Checklist antes de todo deploy
- [ ] `npm run build` passou sem erros
- [ ] `.env.local` NÃO está no git (`git status` para confirmar)
- [ ] Variáveis de ambiente estão configuradas na Vercel
- [ ] Testou no mobile (responsivo)
- [ ] Studio em `/studio` continua funcionando

---

## 7. ARQUIVOS DE DOCUMENTAÇÃO DO PROJETO

| Arquivo | Finalidade |
|---|---|
| `CLAUDE.md` | Regras absolutas para IA e desenvolvedores |
| `PROJECT_ARCHITECTURE.md` | Mapa completo de pastas e arquivos |
| `CMS_EDITABLE_AREAS.md` | Tudo que é gerenciado pelo Sanity |
| `INTEGRATION_MAP.md` | Integrações externas, analytics, formulário, sitemap |
| `design-system.md` | Sistema de design completo (cores, tipografia, espaçamento) |
| `PROJECT_CONTEXT.md` | Este arquivo — contexto geral, URLs e acessos |

---

## 8. PONTOS EM ABERTO (atualizado 2026-03-27)

| # | Problema | Prioridade | Status |
|---|---|---|---|
| 1 | Campos de imagem não aparecem nas galerias no Studio | 🔴 Crítico | Em investigação |
| 2 | Blog `[slug]` ainda usa mockData em vez do Sanity | 🟠 Médio | Pendente |
| 3 | `lastModified` no sitemap usa data do build, não do Sanity | 🔵 Baixo | Pendente |
| 4 | Analytics conectado nos componentes mas não testado em produção | 🟡 Importante | Pendente |

---

*Última atualização: 2026-03-27*
*Manter este arquivo atualizado sempre que URLs, acessos ou estrutura do projeto mudarem.*

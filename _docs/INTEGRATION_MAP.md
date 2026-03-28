# INTEGRATION_MAP.md — Sede do Movimento

> Mapa de integrações externas, pontos de saída de dados e regras operacionais.
> Gerado a partir da leitura direta do código. Itens marcados com ⚠️ indicam lacunas reais.

---

## 1. Formulário de Contato

**Componente:** `components/sections/ContactForm.tsx`
**Tipo:** Client Component (`'use client'`)

### Destino dos dados

> **⚠️ O formulário NÃO envia dados para lugar nenhum.**

O `handleSubmit` atual é um placeholder:

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  await new Promise((r) => setTimeout(r, 1500)); // delay falso
  setLoading(false);
  setSubmitted(true); // apenas troca o estado visual
};
```

Não há chamada a `fetch`, `axios`, API Route do Next.js, ou serviço externo (Formspree, Resend, EmailJS, etc.). O formulário exibe a tela de sucesso sem transmitir nenhum dado.

**Ação necessária:** integrar um serviço de envio antes de ir para produção com este componente.

---

### Campos do formulário

| Campo | Tipo HTML | Obrigatório | Visível em |
|---|---|---|---|
| Nome completo | `text` | ✅ sim | todos os `formType` |
| E-mail | `email` | ✅ sim | todos os `formType` |
| Telefone | `tel` | ❌ não | todos os `formType` |
| Assunto | `select` | ✅ sim | todos os `formType` |
| Currículo / Portfólio (link) | `url` | ❌ não | só `trabalhe-conosco` |
| Mensagem | `textarea` | ✅ sim | todos os `formType` |
| Aceite LGPD (checkbox) | `checkbox` | ✅ sim | todos os `formType` |

### Variantes por `formType`

| `formType` | Opções do campo "Assunto" |
|---|---|
| `"general"` (padrão) | Informações sobre cursos, Matrículas, Parcerias, Espetáculos, Outros |
| `"trabalhe-conosco"` | Professor(a), Produção, Administração, Estágio |
| `"ouvidoria"` | Sugestão, Reclamação, Elogio, Denúncia |

### Validação

- **Nativa do HTML5** (`required` nos campos obrigatórios, `type="email"`, `type="url"`)
- **Sem validação customizada** em JavaScript (sem regex, sem feedback de erro por campo, sem biblioteca de validação)
- O texto do `textarea` no modo `"ouvidoria"` muda o placeholder para "Descreva sua manifestação..."

---

## 2. Analytics

**Arquivo:** `lib/analytics.ts`
**Destinos:** `window.dataLayer` (GTM) e `window.gtag` (GA4) — ambos são verificados antes de chamar.
**Proteção SSR:** todas as funções retornam cedo se `typeof window === "undefined"`.

### Assinaturas das funções

```ts
// Base — todos os outros são wrappers deste
trackEvent({
  name: string,    // nome do evento (ex: "cta_click")
  source?: string, // origem (ex: "hero", "footer", "gallery")
  page?: string,   // página (ex: "home", "ensino")
  label?: string,  // rótulo legível
  value?: number,
}): void

// Wrappers de conveniência
trackWhatsAppClick(source: string, page?: string): void
// → event: "whatsapp_click", label: "Fale conosco", page padrão: "unknown"

trackHeroClick(slideAlt: string): void
// → event: "hero_click", source: "hero", page: "home", label: slideAlt

trackGalleryOpen(imageName: string): void
// → event: "gallery_open", source: "gallery", label: imageName

trackCTAClick(label: string, source: string, page: string): void
// → event: "cta_click"
```

### Onde cada função é chamada

> **⚠️ Nenhum componente importa `lib/analytics.ts` atualmente.**

A busca em todos os arquivos `.ts` e `.tsx` do projeto não encontrou nenhuma importação ou chamada às funções de analytics. As funções estão definidas e exportadas mas **não estão conectadas à UI**.

**Ação necessária:** adicionar chamadas nos componentes relevantes (HeroSlider, SiteFooter/WhatsApp buttons, GalleryViewer, CTAs de matrícula) antes que o rastreamento funcione de fato.

---

## 3. WhatsApp

**Fonte:** `lib/constants/siteConfig.ts` (fallback) + `siteSettings` do Sanity (fonte primária em produção)

### Formato do número em siteConfig.ts

```ts
social: {
  whatsapp: "https://api.whatsapp.com/send?phone=5521965184236",
}
```

- **Formato:** URL completa da API do WhatsApp
- **Número:** `5521965184236`
  - `55` → código do Brasil
  - `21` → DDD Rio de Janeiro
  - `965184236` → número local (9 dígitos)
- O link é **pré-construído** como string — não há concatenação dinâmica em siteConfig.ts

### Como o link é usado

O `siteConfig.social.whatsapp` é um fallback para quando o Sanity está inacessível. Em produção, o link deve vir do campo `whatsapp` do tipo `siteSettings` no Sanity (via `siteSettingsQuery`). Ver regra em `CMS_EDITABLE_AREAS.md` seção 7.

---

## 4. SEO / Sitemap

### sitemap.ts — `app/sitemap.ts`

**Geração:** **híbrida** — rotas estáticas como array hardcoded + rotas dinâmicas buscadas do Sanity via `sanityFetch`.

**Consequência:** ao criar uma nova página estática, adicionar manualmente ao array `routes`. Rotas de blog e galeria são geradas automaticamente a partir do Sanity.

#### Rotas estáticas (hardcoded — array `routes`)

| Seção | Rotas | `changeFrequency` |
|---|---|---|
| Homepage | `/` | `daily` |
| A Escola | `/a-escola`, `/a-escola/apresentacao`, `/a-escola/historia-e-estrutura`, `/a-escola/resultados`, `/a-escola/parcerias`, `/a-escola/espetaculos`, `/a-escola/projeto-social` | `weekly` / `monthly` |
| Ensino | `/ensino`, `/ensino/equipe`, `/ensino/modalidades`, `/ensino/metodologia`, `/ensino/jornadas-artisticas`, `/ensino/formacao-infantil`, `/ensino/horarios`, `/ensino/eventos-extras`, `/ensino/estrutura-pedagogica` | `weekly` / `monthly` |
| Galerias | `/galerias`, `/galerias/fotos`, `/galerias/videos`, `/galerias/youtube` | `weekly` |
| Institucional | `/companhia-profissional`, `/produtora`, `/audiovisual`, `/atelier` | `monthly` |
| Contato | `/contato`, `/contato/trabalhe-conosco`, `/contato/ouvidoria` | `monthly` |
| Blog (lista) | `/blog` | `daily` |

#### Rotas dinâmicas (geradas via Sanity)

| Padrão | Query usada | `changeFrequency` | `priority` |
|---|---|---|---|
| `/blog/[slug]` | `postSlugsQuery` | `monthly` | `0.7` |
| `/galerias/fotos/[albumSlug]` | `allGalleryAlbumsQuery` | `monthly` | `0.6` |

A função `sitemap()` é `async` e busca os dois conjuntos em paralelo com `Promise.all`.

#### `lastModified`

Todos os itens (estáticos e dinâmicos) usam `new Date()` — a data reflete o último build. As queries utilizadas (`postSlugsQuery`, `allGalleryAlbumsQuery`) não projetam `_updatedAt`, portanto não é possível usar a data real de atualização do conteúdo sem criar queries específicas para o sitemap.

---

### robots.ts — `app/robots.ts`

```
User-agent: *
Allow: /
Disallow: /studio/
Disallow: /api/
Sitemap: https://sededomovimento.com.br/sitemap.xml
```

| Regra | Detalhe |
|---|---|
| Todos os robôs | Permitidos em `/` (indexação total por padrão) |
| `/studio/` | Bloqueado — Sanity Studio não deve ser indexado |
| `/api/` | Bloqueado — rotas de API não devem ser indexadas |
| Sitemap declarado | `https://sededomovimento.com.br/sitemap.xml` |

---

## 5. Regras de Deploy

Checklist a executar antes de fazer `git push` para `main` (o push dispara deploy automático na Vercel).

### Antes de commitar

- [ ] `.env.local` está no `.gitignore` e **não foi staged** (`git status` para confirmar)
- [ ] Nenhum valor de variável de ambiente foi hardcoded no código
- [ ] Nenhum `console.log` de debug foi deixado em componentes de produção
- [ ] Nenhum dado de CMS foi hardcoded (títulos, imagens, links — tudo via Sanity)

### Sanity / CMS

- [ ] `SanityLive` continua presente em `app/layout.tsx` (não foi removido)
- [ ] Nenhuma query GROQ em `lib/sanity/queries.ts` foi alterada sem necessidade
- [ ] Nenhum schema em `sanity/schemaTypes/` foi alterado sem atualizar `lib/sanity/types.ts` correspondentemente
- [ ] Se um novo tipo de conteúdo foi criado, o checklist de `CMS_EDITABLE_AREAS.md` (seção "Adding New CMS Content Type") foi seguido

### SEO

- [ ] Se uma nova página pública foi criada, ela foi adicionada a `app/sitemap.ts`
- [ ] A nova página exporta `metadata` (ou `generateMetadata`)
- [ ] `app/robots.ts` não foi alterado inadvertidamente

### Build local

- [ ] `npm run build` passou sem erros de TypeScript ou de compilação
- [ ] `npm run lint` não retornou erros (`eslint-config-next`)

### Visual / Acessibilidade

- [ ] Todas as imagens têm `alt` text
- [ ] Nenhum `<img>` foi usado no lugar de `next/image`
- [ ] Nenhuma cor hardcoded (`#hex` ou `rgb()`) foi adicionada — apenas tokens Tailwind do `tailwind.config.ts`
- [ ] Layout responsivo mantido (testar em mobile antes de push)

### Analytics

> **⚠️ Atenção:** as funções de `lib/analytics.ts` não estão conectadas a nenhum componente ainda. Não assumir que rastreamento funcionará sem integração explícita.

- [ ] Se eventos foram adicionados, confirmar que o nome do evento não quebra triggers existentes no GTM

---

*Documento gerado em 2026-03-27 a partir da leitura direta dos arquivos de código.*

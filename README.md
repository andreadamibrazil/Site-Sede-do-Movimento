# Sede do Movimento

Site institucional do Sede do Movimento — escola de artes cênicas, dança e audiovisual.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS
- **Animações:** Framer Motion
- **CMS:** Sanity v3
- **Deploy:** Vercel

## Páginas

- `/` — Home
- `/a-escola` — A Escola
- `/ensino` — Ensino
- `/companhia-profissional` — Companhia Profissional
- `/atelier` — Atelier
- `/audiovisual` — Audiovisual
- `/produtora` — Produtora
- `/galerias` — Galerias
- `/blog` — Blog
- `/contato` — Contato
- `/studio` — Sanity Studio (admin)

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=seu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=seu_token
```

## CMS

O Sanity Studio fica disponível em `/studio` durante o desenvolvimento. Configure o projeto em [sanity.io](https://sanity.io).

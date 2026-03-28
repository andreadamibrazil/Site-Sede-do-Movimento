import React from "react";

const links = [
  {
    title: "Google Analytics",
    description: "Visitas, páginas mais acessadas, origem do tráfego e comportamento dos usuários.",
    href: "https://analytics.google.com",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 21H2V3h2v16h2v-7h4v7h2V7h4v14h2V11h4v10z" fill="#E37400" />
      </svg>
    ),
    color: "#E37400",
    label: "Abrir GA4",
  },
  {
    title: "Google Search Console",
    description: "Posicionamento no Google, cliques, impressões e erros de indexação por página.",
    href: "https://search.google.com/search-console",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="#4285F4" strokeWidth="2.5" />
        <path d="M20 20l-3-3" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    color: "#4285F4",
    label: "Abrir Search Console",
  },
  {
    title: "Vercel — Deploy",
    description: "Status dos deploys, logs de build e configurações do projeto em produção.",
    href: "https://vercel.com/dashboard",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
        <path d="M12 2L2 19.8h20L12 2z" />
      </svg>
    ),
    color: "#000000",
    label: "Abrir Vercel",
  },
  {
    title: "Microsoft Clarity",
    description: "Heatmaps e gravações de sessão — veja onde os usuários clicam, rolam e abandonam o site.",
    href: "https://clarity.microsoft.com",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#00A4EF" />
        <path d="M7 17l4-8 3 5 2-3 1 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#00A4EF",
    label: "Abrir Clarity",
  },
  {
    title: "Bing Webmaster Tools",
    description: "Indexação no Bing, performance de IA (Copilot), keywords e scan de SEO técnico.",
    href: "https://www.bing.com/webmasters",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 3v11.5l2.5 1.5 6-3.5-4-2.5V5L8 3z" fill="#00809D" />
        <path d="M8 14.5l2.5 1.5v3L8 17.5v-3z" fill="#008272" />
        <path d="M10.5 16l6-3.5v3L10.5 19v-3z" fill="#00A4EF" />
      </svg>
    ),
    color: "#00809D",
    label: "Abrir Bing Webmaster",
  },
  {
    title: "Ver o Site ao Vivo",
    description: "Abrir o site em produção para revisar conteúdo publicado.",
    href: "https://sededomovimento.art",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#6A00FF" strokeWidth="2.2" />
        <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" stroke="#6A00FF" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" stroke="#6A00FF" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M3 12h18" stroke="#6A00FF" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
    color: "#6A00FF",
    label: "Abrir Site",
  },
];

export function DadosDoSite() {
  return (
    <div
      style={{
        padding: "40px 48px",
        fontFamily: "sans-serif",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#101010",
          marginBottom: 6,
        }}
      >
        Dados do Site
      </h1>
      <p style={{ fontSize: 15, color: "#666", marginBottom: 40 }}>
        Acesso rápido aos painéis de analytics e monitoramento da Sede do Movimento.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {links.map((item) => (
          <a
            key={item.title}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: "24px 24px 20px",
              borderRadius: 12,
              border: "1px solid #e5e5e5",
              background: "#fff",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.15s, border-color 0.15s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 4px 20px rgba(0,0,0,0.10)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = item.color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5e5e5";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <strong style={{ fontSize: 16, fontWeight: 700, color: "#101010" }}>
                {item.title}
              </strong>
            </div>
            <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.6, margin: 0 }}>
              {item.description}
            </p>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: item.color,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {item.label} →
            </span>
          </a>
        ))}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: "20px 24px",
          borderRadius: 10,
          background: "#f9f5ff",
          border: "1px solid #e0d0ff",
        }}
      >
        <p style={{ margin: 0, fontSize: 13.5, color: "#555", lineHeight: 1.7 }}>
          <strong style={{ color: "#6A00FF" }}>Dica:</strong> Para ver o relatório de SEO por página, acesse o Search Console → Desempenho → Páginas. Para visualizar visitas em tempo real, acesse o GA4 → Relatórios → Tempo real.
        </p>
      </div>
    </div>
  );
}

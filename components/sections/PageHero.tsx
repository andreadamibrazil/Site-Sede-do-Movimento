import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  dark?: boolean;
  className?: string;
}

export default function PageHero({ eyebrow, title, subtitle, breadcrumbs, className }: PageHeroProps) {
  return (
    <section className={cn("relative bg-gradient-dark pt-28 pb-20 overflow-hidden", className)}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-purple-600/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-brand-pink/20 blur-[80px]" />
      </div>

      <div className="container-main relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center flex-wrap gap-0">
              {/* Home */}
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors duration-150 group"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden>
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Início</span>
                </Link>
              </li>

              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={i} className="flex items-center">
                    {/* Separator */}
                    <span className="mx-2.5 text-brand-pink/50 font-light select-none text-xs" aria-hidden>
                      /
                    </span>
                    {!isLast && crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className="text-white text-sm font-semibold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="text-brand-pink font-bold text-xs uppercase tracking-[0.14em] mb-3">{eyebrow}</p>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 max-w-2xl">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white/65 text-lg leading-relaxed max-w-xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

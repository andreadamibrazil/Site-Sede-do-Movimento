"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X, ChevronDown, Phone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { navigationItems } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/siteConfig";
import { dropdownVariants } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { trackWhatsAppClick } from "@/lib/analytics";

interface SiteHeaderProps {
  whatsapp?: string;
  phone?: string;
}

export default function SiteHeader({ whatsapp, phone }: SiteHeaderProps) {
  const whatsappUrl = whatsapp ?? siteConfig.social.whatsapp;
  const phoneDisplay = phone ?? siteConfig.phone;

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflowY = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflowY = ""; };
  }, [drawerOpen]);

  const isActive = (href: string, children?: { href: string }[]) => {
    if (children?.length) {
      return pathname === href || children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 backdrop-blur-md",
          "bg-white/90 border-b border-gray-100",
          scrolled ? "shadow-sm" : "shadow-none"
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo — branco no topo, preto ao rolar */}
            <Link href="/" className="shrink-0">
              <Image
                src="/images/LogoPreto.png"
                alt="Sede do Movimento"
                width={148}
                height={36}
                className="h-9 w-auto object-contain transition-opacity duration-300"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.slice(0, 6).map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-sm text-[14px] font-medium transition-all duration-150",
                      isActive(item.href, item.children)
                        ? "text-brand-purple-600 font-semibold"
                        : "text-gray-700 hover:text-brand-purple-600 hover:bg-brand-light"
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} className="opacity-60" />}
                  </Link>

                  {/* Dropdown */}
                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.href && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="absolute top-full left-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-[150]"
                        >
                          {/* Parent page link — makes it clear the section itself is navigable */}
                          <Link
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-semibold text-brand-purple-600 hover:bg-brand-light transition-colors duration-150 border-b border-gray-100 mb-1"
                          >
                            <span>Ver tudo em {item.label}</span>
                            <ArrowRight size={13} />
                          </Link>
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center px-3 py-2.5 rounded-sm text-sm transition-colors duration-150",
                                isActive(child.href)
                                  ? "bg-brand-light text-brand-purple-600 font-semibold"
                                  : "text-gray-700 hover:bg-brand-light hover:text-brand-purple-600"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-600 hover:text-brand-purple-600 transition-colors"
              >
                Blog
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { trackWhatsAppClick('header', 'global'); window.open(whatsappUrl, "_blank"); }}
                leftIcon={<Phone size={14} />}
              >
                Fale conosco
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-sm transition-colors text-gray-700 hover:bg-gray-100"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer — CSS-driven, always mounted for instant response */}
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-black/50 z-[190] lg:hidden transition-opacity duration-200",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer panel */}
      <div
        aria-label="Menu de navegação"
        aria-hidden={!drawerOpen}
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-[200] lg:hidden overflow-y-auto",
          "shadow-2xl transition-transform duration-[220ms] ease-out will-change-transform",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" onClick={() => setDrawerOpen(false)}>
            <Image
              src="/images/LogoPreto.png"
              alt="Sede do Movimento"
              width={120}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer links — parent items always expanded */}
        <nav className="py-2">
          {navigationItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center justify-between px-5 py-4 text-[15px] font-medium transition-colors",
                  isActive(item.href, item.children)
                    ? "text-brand-purple-600 font-semibold bg-brand-light"
                    : "text-gray-800 active:bg-gray-50"
                )}
              >
                {item.label}
                {item.children && (
                  <ChevronDown size={15} className="text-gray-400 shrink-0" />
                )}
              </Link>

              {item.children && (
                <div className="bg-gray-50 pb-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center px-6 py-2.5 text-sm transition-colors",
                        isActive(child.href)
                          ? "text-brand-purple-600 font-semibold"
                          : "text-gray-500 active:bg-gray-100"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mx-5 border-b border-gray-100" />
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="p-5 pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              trackWhatsAppClick("header", "global");
              window.open(whatsappUrl, "_blank");
              setDrawerOpen(false);
            }}
            leftIcon={<Phone size={18} />}
          >
            Fale conosco pelo WhatsApp
          </Button>
          {phoneDisplay && (
            <p className="text-center text-sm text-gray-400 mt-3">{phoneDisplay}</p>
          )}
        </div>
      </div>
    </>
  );
}

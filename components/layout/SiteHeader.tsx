"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { navigationItems } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/siteConfig";
import { dropdownVariants, drawerVariants, backdropVariants } from "@/lib/animations";
import Button from "@/components/ui/Button";
import { trackWhatsAppClick } from "@/lib/analytics";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-transparent"
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
                src={scrolled ? "/images/LogoPreto.png" : "/images/LogoBranco.png"}
                alt="Sede do Movimento"
                width={148}
                height={36}
                className="h-9 w-auto object-contain transition-opacity duration-300"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.slice(0, 5).map((item) => (
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
                      isActive(item.href)
                        ? "text-brand-purple-600 font-semibold"
                        : scrolled
                          ? "text-gray-700 hover:text-brand-purple-600 hover:bg-brand-light"
                          : "text-white/90 hover:text-white hover:bg-white/10"
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
                          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-[150]"
                        >
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
                className={cn(
                  "text-sm font-medium transition-colors",
                  scrolled ? "text-gray-600 hover:text-brand-purple-600" : "text-white/80 hover:text-white"
                )}
              >
                Blog
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { trackWhatsAppClick('header', 'global'); window.open(siteConfig.social.whatsapp, "_blank"); }}
                leftIcon={<Phone size={14} />}
              >
                Fale conosco
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                "lg:hidden flex items-center justify-center w-11 h-11 rounded-sm transition-colors",
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
              )}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-[190] lg:hidden"
            />
            <motion.div
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[200] lg:hidden overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
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
                  className="w-10 h-10 flex items-center justify-center rounded-sm text-gray-500 hover:bg-gray-100"
                  aria-label="Fechar menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="p-4">
                {navigationItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3.5 rounded-sm text-[15px] font-medium border-b border-gray-50 transition-colors",
                        isActive(item.href)
                          ? "bg-brand-light text-brand-purple-600 border-l-[3px] border-l-brand-purple-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 mb-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setDrawerOpen(false)}
                            className={cn(
                              "flex items-center px-4 py-2.5 text-sm border-b border-gray-50 transition-colors",
                              isActive(child.href)
                                ? "text-brand-purple-600 font-semibold"
                                : "text-gray-500 hover:text-brand-purple-600"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="p-6 border-t border-gray-100">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => { trackWhatsAppClick('header', 'global'); window.open(siteConfig.social.whatsapp, "_blank"); setDrawerOpen(false); }}
                  leftIcon={<Phone size={18} />}
                >
                  Fale conosco pelo WhatsApp
                </Button>
                <p className="text-center text-sm text-gray-400 mt-3">{siteConfig.phone}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

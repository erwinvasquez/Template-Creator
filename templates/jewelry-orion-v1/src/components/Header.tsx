"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCommerceCapabilities, useHostCart } from "../lib/commerce-host";
import { useSiteContent } from "../lib/site-content";
import { accountPath, resolveNavHref, SHOP_QUERY, withBasePath } from "../content/resolve";
import { showsSalesModeChrome } from "../lib/sales-mode";

function HeaderCartButton({ transparent }: { transparent: boolean }) {
  const { cart, openCart } = useHostCart();
  const itemCount = cart?.itemsCount ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative cursor-pointer rounded-full p-2 transition-colors duration-200 ${
        transparent
          ? "text-white hover:bg-white/10"
          : "text-primary hover:bg-surface"
      }`}
      aria-label={`Abrir estuche${itemCount ? `, ${itemCount} piezas` : ""}`}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-semibold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}

function HeaderAccountLink({ transparent }: { transparent: boolean }) {
  const { payload, basePath } = useSiteContent();

  return (
    <Link
      href={accountPath(basePath, payload.features?.accountBasePath)}
      className={`cursor-pointer rounded-full p-2 transition-colors duration-200 ${
        transparent
          ? "text-white hover:bg-white/10"
          : "text-primary hover:bg-surface"
      }`}
      aria-label="Mi cuenta"
    >
      <User className="h-5 w-5" strokeWidth={1.5} />
    </Link>
  );
}

function SalesModeNavLinks({
  transparent,
  onNavigate,
  layout,
}: {
  transparent: boolean;
  onNavigate?: () => void;
  layout: "desktop" | "mobile";
}) {
  const capabilities = useCommerceCapabilities();
  const { payload, basePath } = useSiteContent();
  const searchParams = useSearchParams();
  const activeMode = searchParams.get(SHOP_QUERY.salesMode);

  if (!showsSalesModeChrome(capabilities)) return null;
  const nav = payload.ui?.salesMode?.nav;
  if (!nav?.length) return null;

  if (layout === "desktop") {
    return (
      <div className="ml-4 flex items-center gap-4 border-l border-border/60 pl-4">
        {nav.map((item) => {
          const active = activeMode === item.salesMode;
          return (
            <Link
              key={item.salesMode}
              href={withBasePath(basePath, item.href)}
              onClick={onNavigate}
              className={`cursor-pointer text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
                active
                  ? transparent
                    ? "text-white"
                    : "text-primary"
                  : transparent
                    ? "text-white/60 hover:text-white"
                    : "text-muted hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {nav.map((item) => (
        <Link
          key={item.salesMode}
          href={withBasePath(basePath, item.href)}
          onClick={onNavigate}
          className="cursor-pointer border-b border-border py-4 text-sm font-medium uppercase tracking-[0.14em] text-muted transition-colors duration-200 hover:text-cta"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Header() {
  const { payload, basePath } = useSiteContent();
  const pathname = usePathname();
  const showCart = payload.features?.cart !== false;
  const showAccount = payload.features?.account !== false;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const isHome = pathname === basePath || pathname === `${basePath}/`;
  const transparent = isHome && !scrolled && !mobileOpen;

  const primaryLinks = payload.navigation.primary;
  const logoText = payload.brand.displayName || payload.brand.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
          transparent
            ? "border-transparent bg-transparent"
            : "border-border bg-background/95 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link
            href={withBasePath(basePath, "/")}
            className={`cursor-pointer font-serif text-xl tracking-[0.14em] transition-colors duration-200 md:text-2xl ${
              transparent ? "text-white" : "text-primary"
            }`}
          >
            {logoText}
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Principal"
          >
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                className={`cursor-pointer text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <SalesModeNavLinks transparent={transparent} layout="desktop" />
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {showAccount ? <HeaderAccountLink transparent={transparent} /> : null}
            {showCart ? <HeaderCartButton transparent={transparent} /> : null}
            <button
              type="button"
              className={`cursor-pointer rounded-full p-2 md:hidden ${
                transparent ? "text-white" : "text-primary"
              }`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 animate-fade-in md:hidden">
          <nav className="flex flex-col gap-1 px-8" aria-label="Móvil">
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer border-b border-border py-5 font-serif text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-cta"
              >
                {link.label}
              </Link>
            ))}
            <SalesModeNavLinks
              transparent={false}
              layout="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
            {showAccount ? (
              <Link
                href={accountPath(basePath, payload.features?.accountBasePath)}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer border-b border-border py-5 font-serif text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-cta"
              >
                Mi cuenta
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </>
  );
}

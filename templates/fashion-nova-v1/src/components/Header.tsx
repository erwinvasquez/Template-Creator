"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useHostCart } from "../lib/commerce-host";
import { useSiteContent } from "../lib/site-content";
import { requireUi } from "../lib/ui";
import { accountPath, resolveNavHref, withBasePath } from "../content/resolve";

function cartAriaLabel(
  openCart: string,
  openCartWithCount: string,
  count: number,
): string {
  if (count > 0) {
    return openCartWithCount.replace("{count}", String(count));
  }
  return openCart;
}

function HeaderCartButton({
  useDark,
  openCartLabel,
  openCartWithCountLabel,
}: {
  useDark: boolean;
  openCartLabel: string;
  openCartWithCountLabel: string;
}) {
  const { cart, openCart } = useHostCart();
  const itemCount = cart?.itemsCount ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative cursor-pointer rounded-full p-2 transition-colors duration-200 ${
        useDark
          ? "text-white hover:bg-white/10"
          : "text-secondary hover:text-primary"
      }`}
      aria-label={cartAriaLabel(
        openCartLabel,
        openCartWithCountLabel,
        itemCount,
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-background">
          {itemCount}
        </span>
      )}
    </button>
  );
}

function HeaderAccountLink({
  useDark,
  myAccountLabel,
}: {
  useDark: boolean;
  myAccountLabel: string;
}) {
  const { payload, basePath } = useSiteContent();

  return (
    <Link
      href={accountPath(basePath, payload.features?.accountBasePath)}
      className={`cursor-pointer rounded-full p-2 transition-colors duration-200 ${
        useDark
          ? "text-white hover:bg-white/10"
          : "text-secondary hover:text-primary"
      }`}
      aria-label={myAccountLabel}
    >
      <User className="h-5 w-5" strokeWidth={1.5} />
    </Link>
  );
}

export function Header() {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const chrome = ui.chrome;
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
  const useDark = isHome && !scrolled && !mobileOpen;

  const primaryLinks = payload.navigation.primary;
  const mainLinks = primaryLinks.slice(0, 3);
  const extraLink = primaryLinks[3];
  const logoText = payload.brand.displayName || payload.brand.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          useDark ? "nova-nav-dark" : "nova-nav"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[4.25rem] md:px-8">
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label={chrome.mainNavAria}
          >
            {mainLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                className={`nova-nav-link cursor-pointer transition-colors duration-200 ${
                  useDark
                    ? "text-white/80 hover:text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href={withBasePath(basePath, "/")}
            className={`nova-header-logo text-xl transition-colors duration-200 md:absolute md:left-1/2 md:-translate-x-1/2 md:text-2xl ${
              useDark ? "text-white" : "text-primary"
            }`}
          >
            {logoText}
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {extraLink && (
              <Link
                href={withBasePath(basePath, resolveNavHref(extraLink))}
                className={`nova-nav-link hidden cursor-pointer transition-colors duration-200 md:inline ${
                  useDark
                    ? "text-white/80 hover:text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {extraLink.label}
              </Link>
            )}
            {showAccount ? (
              <HeaderAccountLink
                useDark={useDark}
                myAccountLabel={chrome.myAccount}
              />
            ) : null}
            {showCart ? (
              <HeaderCartButton
                useDark={useDark}
                openCartLabel={chrome.openCart}
                openCartWithCountLabel={chrome.openCartWithCount}
              />
            ) : null}
            <button
              type="button"
              className={`cursor-pointer rounded-full p-2 md:hidden ${
                useDark ? "text-white" : "text-primary"
              }`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? chrome.closeMenu : chrome.openMenu}
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
        <div className="fixed inset-0 z-40 bg-background pt-28 animate-fade-in md:hidden">
          <nav
            className="flex flex-col gap-1 px-8"
            aria-label={chrome.mobileNavAria}
          >
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer border-b border-border py-5 font-display text-3xl font-bold uppercase tracking-wide text-primary transition-colors duration-200 hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
            {showAccount ? (
              <Link
                href={accountPath(basePath, payload.features?.accountBasePath)}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer border-b border-border py-5 font-display text-3xl font-bold uppercase tracking-wide text-primary transition-colors duration-200 hover:text-secondary"
              >
                {chrome.myAccount}
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </>
  );
}

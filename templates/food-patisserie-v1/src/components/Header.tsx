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
  openCartLabel,
  openCartWithCountLabel,
}: {
  openCartLabel: string;
  openCartWithCountLabel: string;
}) {
  const { cart, openCart } = useHostCart();
  const itemCount = cart?.itemsCount ?? 0;
  const [badgePulse, setBadgePulse] = useState(false);
  useEffect(() => {
    const handler = () => {
      setBadgePulse(true);
      window.setTimeout(() => setBadgePulse(false), 600);
    };
    window.addEventListener("storefront-cart-badge-pulse", handler);
    return () => window.removeEventListener("storefront-cart-badge-pulse", handler);
  }, []);

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative cursor-pointer rounded-full p-2 text-muted transition-colors duration-200 hover:text-primary"
      aria-label={cartAriaLabel(
        openCartLabel,
        openCartWithCountLabel,
        itemCount,
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-background${badgePulse ? " motion-safe:animate-pulse motion-safe:scale-110" : ""}`}>
          {itemCount}
        </span>
      )}
    </button>
  );
}

function HeaderAccountLink({ myAccountLabel }: { myAccountLabel: string }) {
  const { payload, basePath } = useSiteContent();

  return (
    <Link
      href={accountPath(basePath, payload.features?.accountBasePath)}
      className="cursor-pointer rounded-full p-2 text-muted transition-colors duration-200 hover:text-primary"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const primaryLinks = payload.navigation.primary;
  const logoText = payload.brand.displayName || payload.brand.name;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="patisserie-header-bar fixed left-0 right-0 top-0 z-50 border-b border-border/80 bg-background/90 shadow-[0_4px_24px_-8px_rgba(120,53,15,0.12)] backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link
            href={withBasePath(basePath, "/")}
            className="patisserie-wordmark text-lg text-primary md:text-xl"
          >
            {logoText}
          </Link>

          <nav
            className="hidden items-center gap-5 md:flex"
            aria-label={chrome.mainNavAria}
          >
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                className="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted transition-colors duration-200 hover:bg-surface hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {showAccount ? (
              <HeaderAccountLink myAccountLabel={chrome.myAccount} />
            ) : null}
            {showCart ? (
              <HeaderCartButton
                openCartLabel={chrome.openCart}
                openCartWithCountLabel={chrome.openCartWithCount}
              />
            ) : null}
            <button
              type="button"
              className="cursor-pointer rounded-full p-2 text-primary md:hidden"
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
        <div className="fixed inset-0 z-40 bg-background pt-20 animate-fade-in md:hidden">
          <nav
            className="flex flex-col gap-2 px-6"
            aria-label={chrome.mobileNavAria}
          >
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-2xl bg-surface/80 px-5 py-4 font-serif text-xl text-primary"
              >
                {link.label}
              </Link>
            ))}
            {showAccount ? (
              <Link
                href={accountPath(basePath, payload.features?.accountBasePath)}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-2xl bg-surface/80 px-5 py-4 font-serif text-xl text-primary"
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

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

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative cursor-pointer rounded-full p-2 text-background/90 transition-colors duration-200 hover:bg-background/10"
      aria-label={cartAriaLabel(
        openCartLabel,
        openCartWithCountLabel,
        itemCount,
      )}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-background">
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
      className="cursor-pointer rounded-full p-2 text-background/90 transition-colors duration-200 hover:bg-background/10"
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
      <header className="cantina-header-bar fixed left-0 right-0 top-0 z-50 bg-primary shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-5 md:h-16 md:px-8">
          <Link
            href={withBasePath(basePath, "/")}
            className="cantina-wordmark text-lg text-background md:text-2xl"
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
                className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.14em] text-background/85 transition-colors duration-200 hover:text-background"
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
              className="cursor-pointer rounded-full p-2 text-background md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? chrome.closeMenu : chrome.openMenu}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
        <div className="h-1 bg-secondary" />
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-primary pt-16 animate-fade-in md:hidden">
          <nav
            className="flex flex-col px-6"
            aria-label={chrome.mobileNavAria}
          >
            {primaryLinks.map((link) => (
              <Link
                key={`${link.type}-${link.label}`}
                href={withBasePath(basePath, resolveNavHref(link))}
                onClick={() => setMobileOpen(false)}
                className="cantina-wordmark cursor-pointer border-b border-background/20 py-5 text-3xl text-background"
              >
                {link.label}
              </Link>
            ))}
            {showAccount ? (
              <Link
                href={accountPath(basePath, payload.features?.accountBasePath)}
                onClick={() => setMobileOpen(false)}
                className="cantina-wordmark cursor-pointer border-b border-background/20 py-5 text-3xl text-background"
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

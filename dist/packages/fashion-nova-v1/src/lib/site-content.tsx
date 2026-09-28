"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { ContentPayload } from "../content/types";
import { themeStyle } from "../content/resolve";

export type SiteContentValue = {
  payload: ContentPayload;
  basePath: string;
};

const SiteContentContext = createContext<SiteContentValue | null>(null);

export function SiteContentProvider({
  payload,
  basePath,
  children,
}: {
  payload: ContentPayload;
  basePath: string;
  children: ReactNode;
}) {
  const style = themeStyle(payload) as CSSProperties;

  return (
    <SiteContentContext.Provider value={{ payload, basePath }}>
      <div className="nova-root min-h-full flex flex-col" style={style}>
        {children}
      </div>
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

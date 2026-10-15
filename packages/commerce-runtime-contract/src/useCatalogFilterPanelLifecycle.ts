"use client";

import { useEffect, useRef, useState } from "react";

const PANEL_TRANSITION_MS = 300;

/**
 * Montaje → frame cerrado (translate off-screen) → frame abierto (transición visible).
 * Doble rAF evita que el primer paint ya muestre el panel abierto.
 */
function scheduleOpenTransition(setVisible: (v: boolean) => void): () => void {
  setVisible(false);
  let outer = 0;
  let inner = 0;
  outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(() => setVisible(true));
  });
  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

export function useCatalogFilterPanelLifecycle(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return scheduleOpenTransition(setVisible);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), PANEL_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!visible) return;
    closeButtonRef.current?.focus();
  }, [visible]);

  return { mounted, visible, closeButtonRef, transitionMs: PANEL_TRANSITION_MS };
}

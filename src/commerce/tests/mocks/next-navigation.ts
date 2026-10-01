export function usePathname() {
  return "/t/atelier/tienda";
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: async () => {},
  };
}

export function notFound() {
  throw new Error("NEXT_NOT_FOUND");
}

export function usePathname() {
  return "/t/atelier";
}

export function notFound() {
  throw new Error("NEXT_NOT_FOUND");
}

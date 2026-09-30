import { redirect } from "next/navigation";

/** WG lab: cart lives under /t/{slug}/carrito. */
export default function CartLabRedirect() {
  redirect("/t/atelier/carrito");
}

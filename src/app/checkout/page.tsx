import { redirect } from "next/navigation";

/** WG lab: checkout lives under /t/{slug}/checkout, not platform /checkout. */
export default function CheckoutLabRedirect() {
  redirect("/t/atelier/checkout");
}

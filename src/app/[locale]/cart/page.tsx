import { CartClient } from "@/components/cart/CartClient";

export default function CartPage({ params }: { params: { locale: string } }) {
  return <CartClient locale={params.locale} />;
}

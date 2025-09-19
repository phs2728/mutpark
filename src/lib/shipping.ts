export const SHIPPING_THRESHOLD_TRY = 500;
export const SHIPPING_FEE_STANDARD_TRY = 29.9;
export const SHIPPING_FEE_EXPRESS_TRY = 49.9;

export function getShippingFee(method: "standard" | "express", subtotal: number) {
  if (subtotal >= SHIPPING_THRESHOLD_TRY) {
    return 0;
  }
  return method === "express" ? SHIPPING_FEE_EXPRESS_TRY : SHIPPING_FEE_STANDARD_TRY;
}

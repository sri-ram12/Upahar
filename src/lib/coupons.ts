export function calculateCouponDiscount(
  coupon: {
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
    maxDiscount?: number | null;
  },
  subtotal: number
): { valid: boolean; discountAmount: number; reason?: string } {
  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      reason: `Add ₹${Math.ceil(coupon.minOrderAmount - subtotal)} more to use this coupon (Min order ₹${coupon.minOrderAmount}).`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "PERCENT") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);
  return { valid: true, discountAmount: discount };
}


export const COUPON_CODE = {
  BFRIDAY: "BFRIDAY",
  XMAS2030: "XMAS2030",
  NY2028: "NY2028",
  BFRIDAY2025: "BFRIDAY2025",
  CERDOS26: "CERDOS26",
} as const;

export type CouponCode = (typeof COUPON_CODE)[keyof typeof COUPON_CODE];

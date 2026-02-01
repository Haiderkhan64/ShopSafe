export const COUPON_CODE = {
  BFRIDAY: "BFRIDAY",
  XMAS2021: "XMAS2021",
  NY2024: "NY2024",
  BFRIDAY2024: "BFRIDAY2024",
  CERDOS25: "CERDOS25",
} as const;

export type CouponCode = (typeof COUPON_CODE)[keyof typeof COUPON_CODE];

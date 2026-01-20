import type Stripe from "stripe";
import { stripe } from "./stripe.config";

const getPromotionCode = async (code: string) => {
  const result = await stripe.promotionCodes.list({
    limit: 10,
    code,
    expand: ['data.promotion.coupon']
  });
  return result.data.find((c) => c.code === code);
};

export const checkPromotionCode = async (input: string) => {
  const code = await getPromotionCode(input);

  if (!code) throw new Error(`Promotion code ${input} is not valid`);

  const coupon = code.promotion.coupon as Stripe.Coupon;
  const isExpired = (code.expires_at ?? Infinity) * 1000 < Date.now() || coupon.valid === false;

  if (!code || !code.active || isExpired)
    throw new Error(`Promotion code ${input} is not valid`);

  return {
    id: code.id,
    code: code.code,
    coupon: { id: coupon.id },
    percentOff: coupon.percent_off,
    amountOff: coupon.amount_off,
  }
}

export const checkAutoApplyCoupon = async (priceId: string, code: string | undefined) => {
  if (!code) return undefined;
  try {
    const discount = await checkPromotionCode(code);
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;

    if (!product) return undefined;

    const recurring = code.includes("_MONTHLY") ? 'month' :
      code.includes("_YEARLY") ? 'year' : undefined;

    if (recurring) {
      if (price.recurring?.interval !== recurring) { return undefined; }
    }

    return discount;
  } catch {
    return undefined;
  }
}
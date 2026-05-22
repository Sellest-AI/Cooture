type Args = {
  price?: number | string | null;
  currency?: 'USD' | 'EUR' | null;
}

export const sanitizePrice = ({ price, currency }: Args) => {
  if (!price || !currency) return undefined;

  return {
    amountCents: Number(price),
    amount: Number(price) / 100,
    currency,
  };
}

export type SanitizedPrice = ReturnType<typeof sanitizePrice>;
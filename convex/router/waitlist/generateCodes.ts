import { nanoid } from "@/lib/nanoid";
import { updateWaitlist } from "../../functions/waitlist";
import { authMutation, QueryCtx } from "../../procedures";

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const generateCode = async (ctx: QueryCtx) => {
  const code = nanoid(7, { alphabet: ALPHABET });
  const codeUpper = code.toUpperCase();
  const exists = await ctx.db.query('waitlistCodes')
    .withIndex("by_code", q => q.eq("code", codeUpper)).first();
  if (exists) return generateCode(ctx);
  return codeUpper;
}

export const authed = authMutation({
  handler: async (ctx) => {
    const { user } = ctx;

    const existingCodes = await ctx.db.query('waitlistCodes')
      .withIndex("by_user_id", q => q.eq("userId", user._id)).collect();

    if (existingCodes.length > 0) return existingCodes.map((c) => c.code);

    const amount = 3;
    const newCodes = [];
    for (let i = 0; i < amount; i++) {
      const code = await generateCode(ctx);
      await ctx.db.insert('waitlistCodes', {
        code,
        userId: user._id,
      });
      newCodes.push(code);
    }

    await updateWaitlist(ctx, { addCodes: amount });

    return newCodes;
  }
})
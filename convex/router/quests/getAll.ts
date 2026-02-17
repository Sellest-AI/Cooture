import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  handler: async (ctx) => {
    const quest = await ctx.db.query("quests").collect();
    return quest;
  }
})
import { publicQuery } from "../../../procedures";

export const anon = publicQuery({
  handler: async ({ db }) => {
    const config = await db.query("config").first();
    return config;
  }
})
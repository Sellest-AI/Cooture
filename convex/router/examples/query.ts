import { v } from "convex/values";
import { publicQuery, serverQuery } from "../../procedures";

export const server = serverQuery({
  args: {
    name: v.string()
  },
  handler: async (ctx, args): Promise<string> => {
    return `Hello, ${args.name}! This is a server query.`;
  }
})

export const anon = publicQuery({
  args: {
    name: v.string()
  },
  handler: async (ctx, args): Promise<string> => {
    return `Hello, ${args.name}! This is a public query.`;
  }
})
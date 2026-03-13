import { mutation } from "../../_generated/server";

export const anon = mutation({
  handler: async () => {
    return {
      email: 'test@cooture.app',
      password: 'test1234'
    }
  }
})
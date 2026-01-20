import { v } from "convex/values";
import { authQuery, publicQuery, internalQuery, serverQuery } from "../../../procedures";
import { getImageWithObjects } from "../../../functions/images";

const args = {
  id: v.id('images'),
}

export const anon = publicQuery({
  args, handler: (ctx, args) => getImageWithObjects(ctx, args.id)
})

export const authed = authQuery({
  args, handler: (ctx, args) => getImageWithObjects(ctx, args.id)
})

export const server = serverQuery({
  args, handler: (ctx, args) => getImageWithObjects(ctx, args.id)
})

const internalArgs = {
  id: v.id('images'),
}
export const _internal = internalQuery({
  args: internalArgs, handler: (ctx, args) => getImageWithObjects(ctx, args.id)
})
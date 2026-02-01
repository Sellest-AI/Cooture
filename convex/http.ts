import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { replicateHandler } from "./http/replicate";
import { stripeWebhookHttpAction } from "./router/stripe/http.webhook";

const http = httpRouter();

http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: stripeWebhookHttpAction,
});

http.route({
  path: "/api/replicate/webhook",
  method: "POST",
  handler: replicateHandler,
})

auth.addHttpRoutes(http);
export default http;
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { replicateHandler } from "./http/replicate";
import { revenueCatHandler } from "./http/revenuecat";
import { runpodHandler } from "./http/runpod";
import { stripeWebhookHttpAction } from "./router/stripe/http.webhook";

const http = httpRouter();

http.route({
  path: "/api/webhooks/revenuecat",
  method: "POST",
  handler: revenueCatHandler,
});

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

http.route({
  path: "/api/runpod/webhook",
  method: "POST",
  handler: runpodHandler,
})

auth.addHttpRoutes(http);
export default http;
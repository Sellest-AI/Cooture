import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { stripeWebhookHttpAction } from "./router/stripe/http.webhook";

const http = httpRouter();

http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: stripeWebhookHttpAction,
});

auth.addHttpRoutes(http);
export default http;
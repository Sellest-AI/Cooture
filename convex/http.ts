import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { kieHandler } from "./http/kie";
import { replicateHandler } from "./http/replicate";
import { revenueCatHandler } from "./http/revenuecat";
import { runpodGenerateVideoHandler } from "./http/runpod/generateVideo";
import { runpodRemoveBackgroundHandler } from "./http/runpod/removeBackground";
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
  path: "/api/kie/webhook",
  method: "POST",
  handler: kieHandler,
})

http.route({
  path: "/api/runpod/webhook/remove-background",
  method: "POST",
  handler: runpodRemoveBackgroundHandler,
})

http.route({
  path: "/api/runpod/webhook/video-generation",
  method: "POST",
  handler: runpodGenerateVideoHandler,
})

auth.addHttpRoutes(http);
export default http;
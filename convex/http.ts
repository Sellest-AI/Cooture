import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { replicateHandler } from "./http/replicate";
import { revenueCatHandler } from "./http/revenuecat";
import { runpodGenerateVideoHandler } from "./http/runpod/generateVideo";
import { runpodRemoveBackgroundHandler } from "./http/runpod/removeBackground";
import { removeBackgroundHandler } from "./http/server";
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
  path: "/api/runpod/webhook/remove-background",
  method: "POST",
  handler: runpodRemoveBackgroundHandler,
})

http.route({
  path: "/api/runpod/webhook/video-generation",
  method: "POST",
  handler: runpodGenerateVideoHandler,
})

http.route({
  path: "/api/server/remove-background",
  method: "POST",
  handler: removeBackgroundHandler
});

auth.addHttpRoutes(http);
export default http;
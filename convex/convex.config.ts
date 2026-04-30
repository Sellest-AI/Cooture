// convex/convex.config.ts
import cache from "@convex-dev/action-cache/convex.config";
import agent from "@convex-dev/agent/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import rag from "@convex-dev/rag/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(migrations);
// app.use(workflow);
app.use(cache);
app.use(agent);
app.use(rag);

export default app;

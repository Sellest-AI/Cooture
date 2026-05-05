import { defineEvent, vWorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { TableNames } from "../../_generated/dataModel";
import { internalMutation } from "../../procedures";
import { workflow } from "../config";

type ValidTableName = TableNames;

export const countByFieldDoneEvent = defineEvent({
  name: "countByFieldDone",
  validator: v.object({ counts: v.record(v.string(), v.number()) }),
});

type Result = typeof countByFieldDoneEvent.validator.type;

export const run = workflow.define({
  args: {
    table: v.string(),
    field: v.string(),
    startTime: v.optional(v.number()),
  },
  returns: countByFieldDoneEvent.validator,
  handler: async (step, args): Promise<Result> => {
    await step.runMutation(internal.workflows.database.countByField._internal, {
      cursor: null,
      table: args.table,
      field: args.field,
      startTime: args.startTime,
      workflowId: step.workflowId,
      accumulator: {},
    });

    const { counts } = await step.awaitEvent(countByFieldDoneEvent);

    return { counts };
  },
});

export const _internal = internalMutation({
  args: {
    table: v.string(),
    field: v.string(),
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    workflowId: vWorkflowId,
    accumulator: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    const { table, field, startTime, cursor } = args;
    const counts = args.accumulator;

    const result = await ctx.db
      .query(table as ValidTableName)
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;
    const docs = page as any[];

    for (const doc of docs) {
      if (startTime && doc._creationTime < startTime) continue;

      const value = doc[field];
      if (value !== undefined) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }

    if (isDone) {
      await workflow.sendEvent(ctx, {
        name: countByFieldDoneEvent.name,
        workflowId: args.workflowId,
        value: { counts }
      });
      return;
    }

    await ctx.scheduler.runAfter(0, internal.workflows.database.countByField._internal, {
      table,
      field,
      startTime,
      cursor: continueCursor,
      workflowId: args.workflowId,
      accumulator: counts,
    });
  }
});

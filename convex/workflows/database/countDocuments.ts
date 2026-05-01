import { defineEvent, vWorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { TableNames } from "../../_generated/dataModel";
import { internalMutation } from "../../procedures";
import { workflow } from "../config";

type ValidTableName = TableNames;

export const countDocumentsDoneEvent = defineEvent({
  name: "countDocumentsDone",
  validator: v.object({ count: v.number() }),
});

export const run = workflow.define({
  args: {
    table: v.string(),
    timeField: v.optional(v.string()),
    startTime: v.optional(v.number()),
  },
  returns: v.number(),
  handler: async (step, args): Promise<number> => {
    await step.runMutation(internal.workflows.database.countDocuments._internal, {
      cursor: null,
      table: args.table,
      timeField: args.timeField,
      startTime: args.startTime,
      // Workflow
      workflowId: step.workflowId,
    });

    const { count } = await step.awaitEvent(countDocumentsDoneEvent);

    return count;
  },
});

export const _internal = internalMutation({
  args: {
    table: v.string(),
    timeField: v.optional(v.string()),
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    // workflow
    workflowId: vWorkflowId,
    accumulator: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { table, timeField, startTime, cursor } = args;
    const result = await ctx.db
      .query(table as ValidTableName)
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;

    let count = args.accumulator || 0;

    if (startTime) {
      count += page.filter((doc: any) => {
        const time = doc[timeField ?? '_creationTime'] || doc._creationTime;
        return time >= startTime;
      }).length;
    } else {
      count += page.length;
    }

    if (isDone) {
      await workflow.sendEvent(ctx, {
        name: countDocumentsDoneEvent.name,
        workflowId: args.workflowId,
        value: { count }
      });

      return;
    }

    await ctx.scheduler.runAfter(0, internal.workflows.database.countDocuments._internal, {
      table,
      timeField,
      startTime,
      cursor: continueCursor,
      // Workflow
      workflowId: args.workflowId,
      accumulator: count,
    });
  }
})
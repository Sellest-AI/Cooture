import { defineEvent, vWorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalMutation } from "../../procedures";
import { workflow } from "../config";

export const countUserMetricsDoneEvent = defineEvent({
  name: "countUserMetricsDone",
  validator: v.object({
    totalUsers: v.number(),
    newRegistrations: v.number(),
    roleCounts: v.object({
      admin: v.number(),
      user: v.number(),
      guest: v.number(),
      bot: v.number(),
    }),
    statusCounts: v.object({
      active: v.number(),
      inactive: v.number(),
      flagged: v.number(),
      suspended: v.number(),
      waitlist: v.number(),
      deleted: v.number(),
    }),
    withSubscriptions: v.number(),
  }),
});

type Result = typeof countUserMetricsDoneEvent.validator.type;

export type UserMetrics = Result;

export const run = workflow.define({
  args: {
    startTime: v.optional(v.number()),
  },
  returns: countUserMetricsDoneEvent.validator,
  handler: async (step, args): Promise<Result> => {
    await step.runMutation(internal.workflows.database.countUserMetrics._internal, {
      cursor: null,
      startTime: args.startTime,
      workflowId: step.workflowId,
      accumulator: {
        totalUsers: 0,
        newRegistrations: 0,
        roleCounts: { admin: 0, user: 0, guest: 0, bot: 0 },
        statusCounts: { active: 0, inactive: 0, flagged: 0, suspended: 0, waitlist: 0, deleted: 0 },
        withSubscriptions: 0,
      },
    });

    const metrics = await step.awaitEvent(countUserMetricsDoneEvent);
    return metrics;
  },
});

export const _internal = internalMutation({
  args: {
    startTime: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    workflowId: vWorkflowId,
    accumulator: v.object({
      totalUsers: v.number(),
      newRegistrations: v.number(),
      roleCounts: v.object({
        admin: v.number(),
        user: v.number(),
        guest: v.number(),
        bot: v.number(),
      }),
      statusCounts: v.object({
        active: v.number(),
        inactive: v.number(),
        flagged: v.number(),
        suspended: v.number(),
        waitlist: v.number(),
        deleted: v.number(),
      }),
      withSubscriptions: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { startTime, cursor } = args;
    let { totalUsers, newRegistrations, roleCounts, statusCounts, withSubscriptions } = args.accumulator;

    const result = await ctx.db
      .query("usersExtended")
      .paginate({ cursor, numItems: 512 });

    const { page, continueCursor, isDone } = result;

    for (const user of page) {
      totalUsers++;

      if (startTime && user._creationTime >= startTime) {
        newRegistrations++;
      }

      // Count by role
      if (user.role && roleCounts[user.role.toLowerCase() as keyof typeof roleCounts] !== undefined) {
        roleCounts[user.role.toLowerCase() as keyof typeof roleCounts]++;
      }

      // Count by status
      if (user.accountStatus) {
        const status = user.accountStatus.toLowerCase() as keyof typeof statusCounts;
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++;
        }
      }

      // With subscriptions
      if (user.plan) {
        withSubscriptions++;
      }
    }

    if (isDone) {
      if (!startTime) {
        newRegistrations = totalUsers;
      }

      await workflow.sendEvent(ctx, {
        name: countUserMetricsDoneEvent.name,
        workflowId: args.workflowId,
        value: {
          totalUsers,
          newRegistrations,
          roleCounts,
          statusCounts,
          withSubscriptions,
        }
      });
      return;
    }

    await ctx.scheduler.runAfter(0, internal.workflows.database.countUserMetrics._internal, {
      startTime,
      cursor: continueCursor,
      workflowId: args.workflowId,
      accumulator: {
        totalUsers,
        newRegistrations,
        roleCounts,
        statusCounts,
        withSubscriptions,
      },
    });
  }
});

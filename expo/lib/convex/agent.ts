"use client";
export type { Thread, UIMessage } from "@convex-dev/agent";
export type ThreadId = string;

export { useSmoothText } from "@convex-dev/agent/react";
export { useUIMessages } from "@convex-dev/agent/react";
export { useThreadMessages } from "@convex-dev/agent/react";
export { toUIMessages } from "@convex-dev/agent/react";

export * from './api';

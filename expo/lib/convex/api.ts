import { api as convexApi } from "../../../convex/_generated/api";
export type { Doc, Id } from '../../../convex/_generated/dataModel';

export * as API_CONSTANTS from '../../../convex/schema/constants';

export const api = convexApi;

export type Api = typeof api;
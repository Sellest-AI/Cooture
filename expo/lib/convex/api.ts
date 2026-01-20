import { api as convexApi } from "../../../convex/_generated/api";
export type { Id, Doc } from '../../../convex/_generated/dataModel';

export const api = convexApi;

export type Api = typeof api;
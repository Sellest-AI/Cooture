"use node"
import runpodSdk from 'runpod-sdk';
import { env } from '../../env';
import { TaskCallback, TaskType } from './types';

const runpod = runpodSdk(env.RUNPOD_API_KEY);

const ENDPOINTS: (TaskType & { endpoint: string })[] = [
  { name: 'REMOVE_BACKGROUND', version: '1.0', endpoint: 'e53gyrt44m46b6' },
]

const findEndpoint = (task: TaskType) =>
  ENDPOINTS.find(e => e.name === task.name && e.version === task.version)?.endpoint;


type RunOptions<T> = { input: T & { callback: TaskCallback }, expectedResultsCount?: number }
export const runAsync = async <T extends object>(task: TaskType, options: RunOptions<T>) => {
  const WEBHOOK_URL = env.CONVEX_SITE_URL + "/api/runpod/webhook"

  const endpointId = findEndpoint(task);
  if (!endpointId) return null;
  const endpoint = runpod.endpoint(endpointId);

  const run = await endpoint?.run({
    input: {
      ...options.input,
      callback: {
        ...options.input.callback,
        task,
      }
    },
    webhook: WEBHOOK_URL,
  }, 30000);

  if (!run) return null;

  return run;
}
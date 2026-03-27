"use node"
import runpodSdk from 'runpod-sdk';
import { env } from '../../env';
import { TaskCallback, TaskType } from './types';

const runpod = runpodSdk(env.RUNPOD_API_KEY);

const ENDPOINTS: (TaskType & { endpoint: string, webhookPath: string })[] = [
  { name: 'REMOVE_BACKGROUND', version: '1.0', endpoint: 'e53gyrt44m46b6', webhookPath: '/api/runpod/webhook/remove-background' },
  { name: 'GENERATE_VIDEO', version: '1.0', endpoint: 'oeifbz41w2fo8a', webhookPath: '/api/runpod/webhook/video-generation' },
]

const findEndpoint = (task: TaskType) =>
  ENDPOINTS.find(e => e.name === task.name && e.version === task.version);


type RunOptions<T> = { input: T & { callback: TaskCallback }, expectedResultsCount?: number }
export const runAsync = async <T extends object>(task: TaskType, options: RunOptions<T>) => {
  const _endpoint = findEndpoint(task);
  if (!_endpoint) return null;

  const { endpoint: endpointId, webhookPath } = _endpoint;

  const WEBHOOK_URL = env.CONVEX_SITE_URL + webhookPath;

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
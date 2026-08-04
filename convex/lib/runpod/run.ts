"use node"
import runpodSdk from 'runpod-sdk';
import { env } from '../../env';
import { withWebhookToken } from '../crypto';
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

  // RunPod does not sign its callbacks, so the callback URL carries a capability token
  // that the handler verifies. Without it the webhook is a public write endpoint.
  // No worker/Docker change is needed: RunPod POSTs back to this URL verbatim, query
  // string included (undocumented, but verified end to end against the dev endpoint).
  const WEBHOOK_URL = withWebhookToken(env.CONVEX_SITE_URL + webhookPath, env.RUNPOD_WEBHOOK_SECRET);

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
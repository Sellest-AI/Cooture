import type { EndpointOutput } from "runpod-sdk";
import type { RemoveBackgroundOutput } from "./removeBackground";

export const taskStatus = ["IN_QUEUE", "IN_PROGRESS", "COMPLETING", "COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"] as const;
export type TaskStatus = typeof taskStatus[number];

export const taskNames = ["REMOVE_BACKGROUND"] as const;
export type TaskName = typeof taskNames[number];

type TaskTypeGeneric = { name: TaskName, version: string }
const taskTypes = [
  { name: 'REMOVE_BACKGROUND', version: '1.0' } as const,
] satisfies readonly TaskTypeGeneric[];

export type TaskType = typeof taskTypes[number];

export type TaskCallback = {
  userId: string,
  baseImageId?: string,
};

export type TaskInput = { callback: TaskCallback };
type TaskInputInternal<T extends TaskType> = { callback: TaskCallback & { handleServerSide: boolean, task: T, } }

type TaskOutputShared<T extends TaskType> = { callback?: TaskInputInternal<T>['callback'] }
type TaskOutput<T extends TaskType> = TaskOutputShared<T> &
  (
    T['name'] extends "REMOVE_BACKGROUND" ? RemoveBackgroundOutput :
    object);


type TaskRunpod = Omit<EndpointOutput, 'output' | 'status'>;
export type Task<T extends TaskType> = TaskRunpod & {
  type: T,
  input: TaskInputInternal<T>,
  output: TaskOutput<T>,
  status: TaskStatus,
  hasEnded: boolean
}
"use node"
import { runAsync } from "../run";
import { TaskInput } from "../types";
import { compileWorkflow } from "./workflow";

type CallbackInput = TaskInput['callback'];
type TaskInputExtended = Omit<TaskInput, 'callback'> & {
  imageUrl: string,
  prompt: string,
  durationMs: number,
  callback: CallbackInput
}

type Callback = CallbackInput & {
  video: {
    fps: number,
    durationMs: number,
    width: number,
    height: number,
  }
};

export type GenerateVideoOutput = TaskInputExtended &
{ callback: Callback } &
{ url: string, position: { left: number, top: number }, format: 'webp' }

export const generateVideo = async (args: TaskInputExtended) => {
  const callback: Callback = {
    ...args.callback,
    video: {
      durationMs: args.durationMs,
      width: 1080,
      height: 1920,
      fps: 32,
    }
  }

  const workflow = compileWorkflow({
    imageUrl: args.imageUrl,
    durationS: Math.floor(args.durationMs / 1000),
    prompt: args.prompt,
  })

  const input = {
    workflow: 'custom',
    payload: workflow,
    callback,
  };

  const run = await runAsync({ name: 'GENERATE_VIDEO', version: '1.0' }, { input })

  if (!run) throw new Error(`Error starting video generation`);

  return run;
};
"use node"
import { runAsync } from "../run";
import { TaskInput } from "../types";
import { compileWorkflow } from "./workflow";

type CallbackInput = TaskInput['callback'];
type TaskInputExtended = Omit<TaskInput, 'callback'> & {
  imageUrl: string,
  imageId?: string,
  prompt: string,
  durationMs: number,
  callback: CallbackInput
}

type Callback = CallbackInput & {
  imageId?: string,
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
    imageId: args.imageId,
    video: {
      durationMs: args.durationMs,
      width: 900,
      height: 1600,
      fps: 30,
    }
  }

  const workflow = compileWorkflow({
    imageUrl: args.imageUrl,
    durationS: Math.floor(args.durationMs / 1000),
    prompt: args.prompt,
    fps: callback.video.fps,
    outputDimensions: {
      width: callback.video.width,
      height: callback.video.height,
    }
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
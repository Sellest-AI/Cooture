"use node"
import { runAsync } from "./run";
import { TaskInput } from "./types";

type TaskInputExtended = Omit<TaskInput, 'callback'> & { callback: Callback }
type Callback = TaskInput['callback'] & { nextStep: 'SAVE_IMAGE' | 'CREATE_ITEM' };

export type RemoveBackgroundOutput = TaskInputExtended &
{ url: string, position: { left: number, top: number }, format: 'webp' }

export const removeBackground = async (args: { url?: string, base64url?: string } & TaskInputExtended) => {
  const { url, base64url, callback } = args;
  const input = {
    image_data_url: base64url,
    image_url: url,
    callback,
  };

  const run = await runAsync({ name: 'REMOVE_BACKGROUND', version: '1.0' }, { input })

  if (!run) throw new Error(`Error starting remove background`);

  return run;
};
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from "../../env";
import { providerOptions } from "./providers";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

// Perfect
const gemini31pro = openrouter.chat("google/gemini-3-pro-preview");
const gemini3flash = openrouter.chat("google/gemini-3-flash-preview");

// Best Price / Performance balance
const gemini431B = openrouter.chat("google/gemma-4-31b-it");
const gptOss120b = openrouter.chat("openai/gpt-oss-120b");

// Vision support
const qwen359b = openrouter.chat("qwen/qwen3.5-9b");

// Cheapest (for offloading non-critical tasks)
const deepseek4Flash = openrouter.chat("deepseek/deepseek-v4-flash");

export const models = {
  orchestrator: {
    default: {
      model: gptOss120b,
      ...providerOptions.openrouter.gptOss120b
    }
  },
  offload: {
    cheapest: {
      model: deepseek4Flash,
      ...providerOptions.openrouter.deepseek4Flash,
    }
  },
  default: {
    model: gptOss120b,
    ...providerOptions.openrouter.gptOss120b,
  },
  vision: {
    smartest: {
      model: gemini31pro,
      ...providerOptions.openrouter.gemini31pro,
    },
    smart: {
      model: gemini3flash,
      ...providerOptions.openrouter.gemini3flash,
    },
    mini: {
      model: gemini431B,
      ...providerOptions.openrouter.gemini431B
    },
    nano: {
      model: qwen359b,
      ...providerOptions.openrouter.qwen359b
    }
  },
  reasoning: {
    smartest: {
      model: gemini3flash,
      ...providerOptions.openrouter.gemini3flash,
    },
    smart: {
      model: gptOss120b,
      ...providerOptions.openrouter.gptOss120b,
    },
  },
}
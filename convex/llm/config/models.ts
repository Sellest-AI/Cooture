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
const grok41fast = openrouter.chat("x-ai/grok-4.1-fast");
const gptOss120b = openrouter.chat("openai/gpt-oss-120b");

// Vision support
const qwen359b = openrouter.chat("qwen/qwen3.5-9b");

export const models = {
  orchestrator: {
    smartest: {
      model: grok41fast,
      ...providerOptions.openrouter.grok41fast,
    },
    default: {
      model: gptOss120b,
      ...providerOptions.openrouter.gptOss120b
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
      model: grok41fast,
      ...providerOptions.openrouter.grok41fast
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
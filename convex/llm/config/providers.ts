const openrouterGptOss120b = {
  pricing: {
    inputTokens: 0.05,
    outputTokens: 0.26,
  },
  providerOptions: (options: { effort: 'low' | 'medium' | 'high' }) => ({
    openrouter: {
      reasoning: {
        effort: options.effort,
      },
      provider: {
        // ------ EXACTO
        // only: ["groq", "deepinfra/fp4"],
        // order: ["groq", "deepinfra/fp4"],
        // ------- BASE
        only: ['google-vertex', 'groq'],
        order: ['google-vertex', 'groq'],
        // quantizations: ["bf16", "fp16"],
        allow_fallbacks: true,
      }
    }
  })
}

const openrouterQwen3vl8b = {
  pricing: {
    inputTokens: 0.12,
    outputTokens: 0.60,
  },
  providerOptions: {
    openrouter: {
      provider: {
        only: ["novita/fp8", "parasail/bf16"],
        order: ["novita/fp8", "parasail/bf16"],
        allow_fallbacks: true,
      }
    }
  }
}

const openrouterGrok41fast = {
  pricing: {
    inputTokens: 0.2,
    outputTokens: 0.5,
  },
  providerOptions: {
    openrouter: {
      reasoning: {
        enabled: true,
        effort: "high"
      },
      provider: {
        allow_fallbacks: true,
      }
    }
  }
}

const openrouterGemini3pro = {
  pricing: {
    inputTokens: 0.5,
    outputTokens: 3,
  },
  providerOptions: (options: { effort: 'none' | 'medium' | "high" }) => ({
    openrouter: {
      reasoning: options.effort === 'none' ? {
        enabled: false,
        effort: 'none'
      } : (options.effort === 'high' ? {
        enabled: true,
        effort: "high"
      } : {
        enabled: true,
        effort: "medium"
      }),
      provider: {
        only: ["google-ai-studio", "google-vertex"],
        order: ["google-ai-studio", "google-vertex"],
        allow_fallbacks: true,
      }
    }
  })
}

const openrouterGemini3flash = {
  pricing: {
    inputTokens: 0.5,
    outputTokens: 3,
  },
  providerOptions: (options: { effort: 'none' | 'medium' | "high" }) => ({
    openrouter: {
      reasoning: options.effort === 'none' ? {
        enabled: false,
        effort: 'none'
      } : (options.effort === 'high' ? {
        enabled: true,
        effort: "high"
      } : {
        enabled: true,
        effort: "medium"
      }),
      provider: {
        only: ["google-ai-studio", "google-vertex"],
        order: ["google-ai-studio", "google-vertex"],
        allow_fallbacks: true,
      }
    }
  })
}

const openrouterGemini25flash = {
  pricing: {
    inputTokens: 0.3,
    outputTokens: 2.5,
  },
  providerOptions: {
    openrouter: {
      reasoning: {
        enabled: true,
        effort: "medium"
      },
      provider: {
        only: ["google-vertex/global", "google-vertex"],
        order: ["google-vertex/global", "google-vertex"],
        allow_fallbacks: true,
      }
    }
  }
}
export const providerOptions = {
  openrouter: {
    gemini3pro: openrouterGemini3pro,
    gemini3flash: openrouterGemini3flash,
    gemini25flash: openrouterGemini25flash,
    gptOss120b: openrouterGptOss120b,
    qwen3vl8b: openrouterQwen3vl8b,
    grok41fast: openrouterGrok41fast,
  },
}


# Convex LLM Integration Documentation

## Overview

The `llm/` folder handles all AI agent operations, embeddings, and LLM-powered features. It provides a structured way to integrate Large Language Models, manage token usage, and implement AI tools with proper error handling and retry logic.

---

## Directory Structure

```
llm/
├── agents/          # AI agent definitions with custom prompts
├── config/          # LLM provider and model configurations
├── rag/             # Retrieval-Augmented Generation (embeddings)
├── tools/           # Custom tools for AI agents
├── triggers/        # Route endpoints for LLM operations
└── utils/           # Shared utilities (sanitization, usage tracking)
```

---

## `agents/` - AI Agent Definitions

Contains different AI agents with personalized instructions and system prompts.

### Default Agent

**⚠️ CRITICAL**: ALWAYS use the default agent's `generateText` function. NEVER import `generateText` directly from `ai` or `@ai-sdk/` packages.

**Why?**
- Includes automatic token usage tracking via `usageHandler`
- Updates user subscription token usage automatically
- Provides consistent error handling and retry logic
- Centralizes model configuration

**File**: `llm/agents/default.ts`

### Using the Default Agent

**✅ CORRECT**:
```typescript
import { generateText } from "../../llm/agents/default";

export const authed = authAction({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const result = await generateText(ctx, args.prompt, {
      // Optional: Override the default model
      model: models.vision.smartest.model,
    });
    
    return result.text;
  },
});
```

**❌ WRONG - Never Do This**:
```typescript
// DON'T import directly from ai packages
import { generateText } from "ai";

// This bypasses usage tracking and consistent configuration
const result = await generateText({
  model: someModel,
  prompt: "...",
});
```

### Custom Agents

You can create specialized agents with custom instructions and behaviors:

```typescript
// llm/agents/imageDescriber.ts
import { Agent } from "@convex-dev/agent";
import { components } from "../../_generated/api";
import { models } from "../config";
import { usageHandler } from "../utils";

export const imageDescriberAgent = new Agent(components.agent, {
  name: "Image Describer",
  providerOptions: models.vision.smartest.providerOptions({ effort: 'high' }),
  languageModel: models.vision.smartest.model,
  instructions: `You are an expert image analyst. Provide detailed, accurate descriptions of images.
Focus on:
- Main subjects and objects
- Colors and composition
- Mood and atmosphere
- Technical quality

Be concise but thorough.`,
  contextOptions: { recentMessages: 0 },
  maxSteps: 3,
  usageHandler,
});
```

---

## `config/` - LLM Configuration

### Models Configuration

Centralized model definitions with pricing and provider options.

**File**: `llm/config/models.ts`

**Usage**:

ALWAYS include the providers options !

```typescript
import { models } from "../../llm/config";

// Use default model
const result = await generateText(ctx, prompt, { storageOptions: { saveMessages: "none" } });

// Override with vision model
const visionResult = await generateText(ctx, prompt, {
  model: models.vision.smartest.model,
  providerOptions: models.vision.smarters.providerOptions,
}, { storageOptions: { saveMessages: "none" } });

// Override with reasoning model
const reasoningResult = await generateText(ctx, prompt, {
  model: models.reasoning.smart.model,
  providerOptions: models.vision.smarters.providerOptions,
}, { storageOptions: { saveMessages: "none" } });
```

### Provider Options

Contains provider-specific configuration including pricing for token usage calculation.

**File**: `llm/config/providers.ts`

Each model configuration includes:
- `providerOptions()` - Function returning provider-specific settings
- `pricing` - Object with `inputTokens` and `outputTokens` costs

### Embedding Configuration

**File**: `llm/config/embedding.ts`

Defines embedding models for text and multimodal (image) embeddings.

---

## `rag/` - Retrieval-Augmented Generation

Contains functions for embedding text and images, enabling semantic search and RAG patterns.

**File**: `llm/rag/rag.ts`

### Using RAG for Semantic Search

**Example: Embedding and Storing Text**
```typescript
import { authAction } from "../../procedures";
import { embedText, RAG_NAMESPACES } from "../../llm/rag/rag";
import { v } from "convex/values";

export const authed = authAction({
  args: { 
    content: v.string(),
    metadata: v.object({ title: v.string() }),
  },
  handler: async (ctx, args) => {
    // Generate embedding
    const { embedding } = await embedText(args.content);
    
    // ...
    
    return { success: true };
  },
});
```

---

## `tools/` - Custom AI Agent Tools

Contains all custom tools that LLM agents can use to perform specific tasks.
This can also includes generic AI functions. It's not necessary to wrap them into a tool call.

**Purpose**:
- Define reusable AI functions (e.g., describe image, generate prompt, analyze sentiment)
- Each tool should be focused and do one thing well
- Tools can be used by agents to extend their capabilities

---

## `triggers/` - LLM Operation Routes

Like the `/router` folder but specifically for LLM-powered operations. Exposes queries, mutations, and actions that can be called from Next.js.

**⚠️ CRITICAL**: Follow the same naming convention as `/router`:
- `anon` for public procedures
- `authed` for authenticated procedures
- `server` for server-to-server procedures
- `_internal` for internal procedures

**Example Structure**:
```
triggers/
├── texts/
│   └── generate.ts        # text generation
├── images/
│   └── analyze.ts        # image analyze
```

**Example Trigger**:
```typescript
// llm/triggers/images/analyze.ts
import { authAction } from "../../../procedures";
import { generateText } from "../../agents/default";
import { models } from "../../config";
import { sanitizeAiText } from "../../utils";
import { v } from "convex/values";

export const authed = authAction({
  args: {
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    // Retrieve image url from image id
    // ....

    // Generate text with optional model override
    const result = await generateText(ctx, {
      prompt: [
        {
          role: 'user',
          content: [
            { type: 'image', image: 'HTTPS://URL' },
            { type: 'text', text: "Describe this image" }
          ]
        }
      ]
    }, { storageOptions: { saveMessages: "none" } });
    
    // ....
    
    return {
      text: cleanText,
      usage: result.usage,
    };
  },
});
```

---

## `utils/` - LLM Utilities

Shared utilities for LLM operations that are used across multiple tools and agents.

### Barrel Export

**File**: `llm/utils/index.ts`

---

## Best Practices

### ✅ DO:

1. **Always use the default agent**
   ```typescript
   import { generateText } from "../../llm/agents/default";
   ```

2. **Sanitize AI output**
   ```typescript
   import { sanitizeAiText } from "../../llm/utils";
   const clean = sanitizeAiText(result.text);
   ```

3. **Use namespaces for RAG**
   ```typescript
   import { RAG_NAMESPACES } from "../../llm/rag/rag";
   const namespace = RAG_NAMESPACES.USER(ctx.userId);
   ```

4. **Follow naming conventions in triggers/**
   ```typescript
   export const authed = authAction({ ... });
   export const server = serverAction({ ... });
   ```

### ❌ DON'T:

1. **Don't bypass the default agent**
   ```typescript
   // ❌ WRONG
   import { generateText } from "ai";
   ```

2. **Don't hardcode model IDs**
   ```typescript
   // ❌ WRONG
   const model = openrouter.chat("google/gemini-3-flash-preview");
   
   // ✅ CORRECT
   import { models } from "../config";
   const model = models.vision.smartest.model;
   ```

3. **Don't skip usage tracking**
   ```typescript
   // The usageHandler is automatically included in agents
   // Never create agents without it
   ```

---

## Summary

The `llm/` folder provides:

- ✅ **Centralized AI agent management** with automatic usage tracking
- ✅ **Model configuration** with pricing and provider options
- ✅ **RAG capabilities** for text and image embeddings
- ✅ **Custom tools** for extending agent capabilities
- ✅ **Organized triggers** following router naming conventions
- ✅ **Utility functions** for sanitization and usage tracking
- ✅ **Error handling** with retry logic for API calls
- ✅ **Type safety** throughout the entire AI stack

**Golden Rules**:
1. Always use the default agent (includes usage tracking)
2. Configure models in `config/`, not inline
3. Use RAG namespaces for organized embeddings
4. Follow naming conventions in `triggers/`
5. Sanitize AI output before returning to users
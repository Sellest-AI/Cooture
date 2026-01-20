import { components } from "../../_generated/api";
import { RAG } from "@convex-dev/rag";
import { MultimodalEmbeddingInput, imageEmbeddingModel, TextEmbeddingInput, textEmbeddingModel } from "../config";
import { Id } from "../../_generated/dataModel";
import { embed, embedMany } from "ai";
import { retryPromise } from "@shared/utils";

export const ragText = new RAG(components.rag, {
  textEmbeddingModel,
  embeddingDimension: 1024, // Needs to match your embedding model
});

export const ragImage = new RAG(components.rag, {
  textEmbeddingModel: imageEmbeddingModel,
  embeddingDimension: 1024, // Needs to match your embedding model
});

/* For text embeddings */
export const embedText = async (text: string) =>
  retryPromise(() => embed<TextEmbeddingInput>({ model: textEmbeddingModel, value: text }));

/* For image embeddings */
export const embedImage = async (imageUrl: string) => {
  const { embeddings, ...rest } = await retryPromise(() => embedMany<MultimodalEmbeddingInput>({
    model: imageEmbeddingModel,
    values: [{ image: imageUrl }]
  }));
  return {
    ...rest,
    embedding: embeddings[0]!
  }
}

/* For text -> image multimodal search */
export const embedTextImage = async (text: string) => {
  const { embeddings, ...rest } = await retryPromise(() => embedMany<MultimodalEmbeddingInput>({
    model: imageEmbeddingModel,
    values: [{ text }]
  }));
  return {
    ...rest,
    embedding: embeddings[0]!
  }
}

export const RAG_NAMESPACES = {
  USER: (userId: Id<'users'>) => `user:${userId}` as const,
  GLOBAL: `global` as const,
}

export type RagNamespace = ReturnType<typeof RAG_NAMESPACES['USER']> | typeof RAG_NAMESPACES['GLOBAL'];
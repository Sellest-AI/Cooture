import { voyage } from 'voyage-ai-provider';

export const textEmbeddingModel = voyage.textEmbeddingModel("voyage-3.5-lite");

export const imageEmbeddingModel = voyage.multimodalEmbeddingModel("voyage-multimodal-3");

export type { MultimodalEmbeddingInput, TextEmbeddingInput } from "voyage-ai-provider";

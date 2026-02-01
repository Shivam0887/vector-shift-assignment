/**
 * LLM Service
 * Text generation using Vercel AI SDK with multi-provider support
 */

import { generateText, streamText } from "ai";
import { createModel } from "./ai-providers";

// ============================================
// Types
// ============================================

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  modelId: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
}

export interface StreamOptions extends GenerateOptions {
  onChunk?: (chunk: string) => void;
  onFinish?: (result: GenerateResult) => void;
}

// ============================================
// Text Generation
// ============================================

/**
 * Generate text using the specified model
 */
export async function generate(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const {
    systemPrompt,
    userPrompt,
    modelId,
    maxTokens = 1000,
    temperature = 0.7,
  } = options;

  const model = createModel(modelId);

  const result = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: model as any,
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: maxTokens,
    temperature,
  });

  return {
    text: result.text,
    model: modelId,
  };
}

/**
 * Stream text generation using the specified model
 */
export async function generateStream(
  options: StreamOptions,
): Promise<GenerateResult> {
  const {
    systemPrompt,
    userPrompt,
    modelId,
    maxTokens = 1000,
    temperature = 0.7,
    onChunk,
    onFinish,
  } = options;

  const model = createModel(modelId);

  const result = streamText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: model as any,
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: maxTokens,
    temperature,
  });

  let fullText = "";

  for await (const textPart of result.textStream) {
    fullText += textPart;
    onChunk?.(textPart);
  }

  const finalResult: GenerateResult = {
    text: fullText,
    model: modelId,
  };

  onFinish?.(finalResult);
  return finalResult;
}

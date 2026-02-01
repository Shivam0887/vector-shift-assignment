/**
 * AI Provider Registry
 * Configures multiple LLM providers using Vercel AI SDK
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// ============================================
// Types
// ============================================

export type ProviderType = "openai" | "anthropic" | "google";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

export interface AIConfig {
  apiKey: string;
}

// ============================================
// Available Models
// ============================================

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable OpenAI model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and affordable",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "Previous generation",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "Legacy model",
  },

  // Anthropic Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Best for most tasks",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    description: "Fast and efficient",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Most powerful",
  },

  // Google Models
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    description: "Advanced reasoning",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    description: "Fast responses",
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Latest experimental",
  },
];

// ============================================
// Provider Configuration Storage
// ============================================

interface ProviderConfigs {
  openai?: AIConfig;
  anthropic?: AIConfig;
  google?: AIConfig;
}

// Store API keys in memory (in production, use secure storage)
let providerConfigs: ProviderConfigs = {};

/**
 * Configure an AI provider with API key
 */
export function configureProvider(
  provider: ProviderType,
  config: AIConfig,
): void {
  providerConfigs[provider] = config;
}

/**
 * Get configured providers
 */
export function getConfiguredProviders(): ProviderType[] {
  return Object.keys(providerConfigs).filter(
    (p) => providerConfigs[p as ProviderType]?.apiKey,
  ) as ProviderType[];
}

/**
 * Check if a provider is configured
 */
export function isProviderConfigured(provider: ProviderType): boolean {
  return !!providerConfigs[provider]?.apiKey;
}

/**
 * Get available models for configured providers only
 */
export function getAvailableModels(): ModelConfig[] {
  const configured = getConfiguredProviders();
  return AVAILABLE_MODELS.filter((m) => configured.includes(m.provider));
}

// ============================================
// Model Creation
// ============================================

/**
 * Create a model instance for the specified model ID
 * Returns a model compatible with Vercel AI SDK generateText/streamText
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createModel(modelId: string): any {
  const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const config = providerConfigs[modelConfig.provider];
  if (!config?.apiKey) {
    throw new Error(
      `Provider ${modelConfig.provider} is not configured. Please set API key.`,
    );
  }

  switch (modelConfig.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: config.apiKey });
      return openai(modelId);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: config.apiKey });
      return anthropic(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return google(modelId);
    }
    default:
      throw new Error(`Unsupported provider: ${modelConfig.provider}`);
  }
}

/**
 * Get default model (first configured model)
 */
export function getDefaultModel(): ModelConfig | undefined {
  return getAvailableModels()[0];
}

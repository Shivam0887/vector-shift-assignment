/**
 * LLM API Client
 * Uses Vercel AI SDK for LLM calls - re-exports from lib
 */

export {
  generate,
  generateStream,
  type GenerateOptions,
  type GenerateResult,
  type StreamOptions,
} from "@/lib/llm-service";
export {
  configureProvider,
  getAvailableModels,
  getConfiguredProviders,
  isProviderConfigured,
  getDefaultModel,
  AVAILABLE_MODELS,
  type ProviderType,
  type ModelConfig,
  type AIConfig,
} from "@/lib/ai-providers";

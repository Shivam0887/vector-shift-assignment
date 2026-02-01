/**
 * LLM Node Definition
 * Uses Vercel AI SDK for multi-provider LLM support
 * Includes System (Instructions) and Prompt fields with variable support
 */

import { Bot } from "lucide-react";
import type { NodeDefinition } from "../types";

export const llmNodeDefinition: NodeDefinition = {
  type: "llm",
  displayName: "LLM",
  icon: Bot,
  category: "processing",
  description: "Large Language Model - supports OpenAI, Anthropic, Google",
  fields: [
    {
      name: "provider",
      label: "Provider",
      type: "select",
      defaultValue: "openai",
      options: [
        { value: "openai", label: "OpenAI" },
        { value: "anthropic", label: "Anthropic" },
        { value: "google", label: "Google" },
      ],
    },
    {
      name: "model",
      label: "Model",
      type: "select",
      defaultValue: "gpt-4o-mini",
      options: [
        // OpenAI
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
        // Anthropic
        { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
        { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        // Google
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
      ],
    },
    {
      name: "temperature",
      label: "Temperature",
      type: "text",
      defaultValue: "0.7",
      placeholder: "0.0 - 1.0",
    },
    {
      name: "systemPrompt",
      label: "System (Instructions)",
      type: "textarea",
      placeholder: "You are a helpful assistant...",
      defaultValue: "",
    },
    {
      name: "prompt",
      label: "Prompt",
      type: "textarea",
      placeholder: "Type {{ to insert variables from other nodes...",
      defaultValue: "",
      dynamic: true, // Enable variable autocomplete
    },
  ],
  handles: [
    {
      id: "response",
      type: "source",
      position: "right",
      label: "Response",
    },
  ],
  dynamicHandles: true, // Generate handles from {{variables}} in prompt
};

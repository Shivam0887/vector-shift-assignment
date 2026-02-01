/**
 * AI Settings Component
 * Configure API keys for different LLM providers
 */

import { useState } from "react";
import { Settings, Eye, EyeOff, Check, X } from "lucide-react";
import {
  configureProvider,
  isProviderConfigured,
  type ProviderType,
} from "@/lib/ai-providers";
import { cn } from "@/lib/cn";

interface ProviderSettingProps {
  provider: ProviderType;
  label: string;
  placeholder: string;
}

function ProviderSetting({
  provider,
  label,
  placeholder,
}: ProviderSettingProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const isConfigured = isProviderConfigured(provider);

  const handleSave = () => {
    configureProvider(provider, { apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey("");
    configureProvider(provider, { apiKey: "" });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isConfigured && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            Configured
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!apiKey}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium text-white transition-colors",
            apiKey
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-300",
          )}
        >
          {saved ? "Saved!" : "Save"}
        </button>
        {isConfigured && (
          <button
            onClick={handleClear}
            className="rounded-md border border-gray-300 px-2 py-2 text-gray-600 hover:bg-gray-50"
            title="Clear API key"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AISettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        title="AI Settings"
      >
        <Settings className="h-4 w-4" />
        <span>AI Settings</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Provider Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <ProviderSetting
                provider="openai"
                label="OpenAI API Key"
                placeholder="sk-..."
              />
              <ProviderSetting
                provider="anthropic"
                label="Anthropic API Key"
                placeholder="sk-ant-..."
              />
              <ProviderSetting
                provider="google"
                label="Google AI API Key"
                placeholder="AIza..."
              />
            </div>

            <div className="mt-6 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
              <strong>Note:</strong> API keys are stored in browser memory only
              and are not persisted. You'll need to re-enter them after refresh.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

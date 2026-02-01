/**
 * App Component
 * Root component for the VectorShift Pipeline Builder
 */

import { ReactFlowProvider } from "@xyflow/react";
import { Toolbar } from "./components/toolbar";
import { PipelineCanvas } from "./components/canvas";
import { SubmitButton } from "./components/submit-button";
import { AISettingsPanel } from "./components/ai-settings-panel";

export function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">
            VectorShift Pipeline Builder
          </h1>
          <AISettingsPanel />
        </header>

        {/* Toolbar */}
        <Toolbar />

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <PipelineCanvas />
        </main>

        {/* Submit */}
        <SubmitButton />
      </div>
    </ReactFlowProvider>
  );
}

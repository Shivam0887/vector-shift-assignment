/**
 * Outputs Panel Component
 * Displays the output fields of a node in a separate panel to the right
 * Matches VectorShift platform style
 */

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { HandleDefinition } from "../types";

interface OutputsPanelProps {
  outputs: HandleDefinition[];
  nodeId: string;
  nodeName: string;
}

// Map field types to badge colors
const typeBadgeColors: Record<string, { bg: string; text: string }> = {
  text: { bg: "bg-blue-100", text: "text-blue-700" },
  response: { bg: "bg-blue-100", text: "text-blue-700" },
  file: { bg: "bg-purple-100", text: "text-purple-700" },
  number: { bg: "bg-green-100", text: "text-green-700" },
  decimal: { bg: "bg-green-100", text: "text-green-700" },
  llm: { bg: "bg-amber-100", text: "text-amber-700" },
  default: { bg: "bg-gray-100", text: "text-gray-700" },
};

function getTypeBadgeColor(type: string) {
  return typeBadgeColors[type.toLowerCase()] || typeBadgeColors.default;
}

export function OutputsPanel({ outputs, nodeId, nodeName }: OutputsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Split into main outputs and advanced outputs
  const mainOutputs = outputs.slice(0, 3);
  const advancedOutputs = outputs.slice(3);

  return (
    <div className="min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
        <span className="text-xs font-medium text-gray-600">Outputs</span>
      </div>

      {/* Output Fields */}
      <div className="p-2 space-y-1">
        {mainOutputs.map((output) => {
          const badgeColor = getTypeBadgeColor(output.label || output.id);
          return (
            <div
              key={output.id}
              className="flex items-center justify-between gap-2 rounded px-2 py-1.5 hover:bg-gray-50 cursor-pointer group"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "variable",
                  JSON.stringify({
                    nodeId,
                    nodeName,
                    fieldId: output.id,
                    fieldLabel: output.label || output.id,
                  }),
                );
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">
                  {output.id}
                </span>
                {output.label && output.label !== output.id && (
                  <span className="text-[10px] text-gray-500">
                    {output.label}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  badgeColor.bg,
                  badgeColor.text,
                )}
              >
                Text
              </span>
            </div>
          );
        })}

        {/* Advanced Outputs */}
        {advancedOutputs.length > 0 && (
          <div className="border-t border-gray-100 pt-1 mt-1">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-full px-2 py-1"
            >
              {showAdvanced ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Advanced Outputs
            </button>

            {showAdvanced && (
              <div className="space-y-1 mt-1">
                {advancedOutputs.map((output) => {
                  const badgeColor = getTypeBadgeColor(
                    output.label || output.id,
                  );
                  return (
                    <div
                      key={output.id}
                      className="flex items-center justify-between gap-2 rounded px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "variable",
                          JSON.stringify({
                            nodeId,
                            nodeName,
                            fieldId: output.id,
                            fieldLabel: output.label || output.id,
                          }),
                        );
                      }}
                    >
                      <span className="text-xs text-gray-700">{output.id}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          badgeColor.bg,
                          badgeColor.text,
                        )}
                      >
                        {output.label || "Text"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

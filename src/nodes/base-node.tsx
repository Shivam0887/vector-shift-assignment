/**
 * Base Node Component - VectorShift Style
 * Features:
 * - Node card with fields on the left
 * - Separate Outputs panel on the right
 * - Warning system for unused connections
 * - Dynamic handle generation from {{variables}}
 */

import { useMemo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useStore } from "@/store";
import { getNodeDefinition } from "./registry";
import { extractVariables } from "@/lib/variable-parser";
import {
  TextField,
  SelectField,
  TextareaField,
  OutputsPanel,
  UnusedNodeWarning,
} from "./components";
import type { BaseNodeData, HandlePosition, FieldDefinition } from "./types";
import { cn } from "@/lib/cn";
import { useUnusedConnections } from "@/hooks";

// Map position string to React Flow Position enum
const positionMap: Record<HandlePosition, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

export function BaseNode({ id, data, type, selected }: NodeProps) {
  const nodeData = data as BaseNodeData;
  const definition = getNodeDefinition(type!);
  const updateNodeField = useStore((s) => s.updateNodeField);

  // Get unused connections for warning
  const unusedConnections = useUnusedConnections(id);

  // Calculate dynamic handles from variables in text fields
  const dynamicHandles = useMemo(() => {
    if (!definition?.dynamicHandles) return [];

    const allVariables: string[] = [];
    definition.fields.forEach((field) => {
      if (field.dynamic && typeof nodeData[field.name] === "string") {
        const vars = extractVariables(nodeData[field.name] as string);
        allVariables.push(...vars);
      }
    });

    return [...new Set(allVariables)];
  }, [definition, nodeData]);

  // Field change handler
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      updateNodeField(id, fieldName, value);
    },
    [id, updateNodeField],
  );

  if (!definition) {
    return (
      <div className="rounded-lg border border-red-500 bg-red-50 p-4">
        <span className="text-red-700">Unknown node type: {type}</span>
      </div>
    );
  }

  const Icon = definition.icon;

  // Get node display name (e.g., "openai_0", "input_0")
  const getNodeDisplayId = () => {
    const idPart = id.split("-")[1] || "0";
    switch (type) {
      case "customInput":
        return `input_${idPart}`;
      case "customOutput":
        return `output_${idPart}`;
      case "llm":
        return `openai_${idPart}`;
      case "text":
        return `text_${idPart}`;
      default:
        return `${type}_${idPart}`;
    }
  };

  // Calculate handle positions
  const getHandleStyle = (
    index: number,
    total: number,
    position: HandlePosition,
  ) => {
    if (total === 1) return {};
    const percentage = ((index + 1) / (total + 1)) * 100;
    if (position === "left" || position === "right") {
      return { top: `${percentage}%` };
    }
    return { left: `${percentage}%` };
  };

  // Group handles by position
  const leftHandles = definition.handles.filter((h) => h.position === "left");
  const rightHandles = definition.handles.filter((h) => h.position === "right");
  const totalLeftHandles = leftHandles.length + dynamicHandles.length;

  // Get source handles for outputs panel
  const outputHandles = definition.handles.filter((h) => h.type === "source");

  return (
    <div className="flex gap-2">
      {/* Main Node Card */}
      <div
        className={cn(
          "min-w-[260px] max-w-[320px] rounded-lg border bg-white shadow-md",
          selected ? "border-blue-500 shadow-lg" : "border-gray-200",
        )}
      >
        {/* Header with Node ID */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">
              {definition.displayName}
            </span>
          </div>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-600">
            {getNodeDisplayId()}
          </span>
        </div>

        {/* Warning for unused connections */}
        {unusedConnections.length > 0 && (
          <div className="p-2">
            <UnusedNodeWarning unusedNodes={unusedConnections} />
          </div>
        )}

        {/* Content / Fields */}
        <div className="space-y-3 p-3">
          {definition.fields.length === 0 ? (
            <p className="text-xs text-gray-500">{definition.description}</p>
          ) : (
            definition.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={nodeData[field.name] as string}
                onChange={(value) => handleFieldChange(field.name, value)}
                nodeId={id}
              />
            ))
          )}
        </div>

        {/* Dynamic Handles Section */}
        {dynamicHandles.length > 0 && (
          <div className="border-t border-gray-100 bg-amber-50 px-3 py-2">
            <div className="text-xs font-medium text-amber-700 mb-1">
              Input Variables
            </div>
            <div className="flex flex-wrap gap-1">
              {dynamicHandles.map((varName) => (
                <div
                  key={varName}
                  className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {varName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Static Handles - Left */}
        {leftHandles.map((handle, index) => (
          <Handle
            key={handle.id}
            id={`${id}-${handle.id}`}
            type={handle.type}
            position={positionMap[handle.position]}
            style={getHandleStyle(index, totalLeftHandles, handle.position)}
            title={handle.label}
            className={cn(
              "!h-3 !w-3 !rounded-full !border-2 !border-white",
              handle.type === "source" ? "!bg-green-500" : "!bg-blue-500",
            )}
          />
        ))}

        {/* Dynamic Handles from Variables */}
        {dynamicHandles.map((varName, index) => (
          <Handle
            key={`dynamic-${varName}`}
            id={`${id}-${varName}`}
            type="target"
            position={Position.Left}
            style={getHandleStyle(
              leftHandles.length + index,
              totalLeftHandles,
              "left",
            )}
            title={varName}
            className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-amber-500"
          />
        ))}

        {/* Static Handles - Right */}
        {rightHandles.map((handle, index) => (
          <Handle
            key={handle.id}
            id={`${id}-${handle.id}`}
            type={handle.type}
            position={positionMap[handle.position]}
            style={getHandleStyle(index, rightHandles.length, handle.position)}
            title={handle.label}
            className={cn(
              "!h-3 !w-3 !rounded-full !border-2 !border-white",
              handle.type === "source" ? "!bg-green-500" : "!bg-blue-500",
            )}
          />
        ))}
      </div>

      {/* Outputs Panel (Right Side) */}
      {outputHandles.length > 0 && (
        <OutputsPanel
          outputs={outputHandles}
          nodeId={id}
          nodeName={getNodeDisplayId()}
        />
      )}
    </div>
  );
}

/**
 * Field Renderer
 */
interface FieldRendererProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  nodeId: string;
}

function FieldRenderer({ field, value, onChange, nodeId }: FieldRendererProps) {
  const displayValue = value ?? field.defaultValue ?? "";

  switch (field.type) {
    case "text":
      return (
        <TextField
          value={displayValue}
          onChange={onChange}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case "select":
      return (
        <SelectField
          value={displayValue}
          onChange={onChange}
          label={field.label}
          options={field.options ?? []}
        />
      );

    case "textarea":
      return (
        <TextareaField
          value={displayValue}
          onChange={onChange}
          label={field.label}
          placeholder={field.placeholder}
          dynamic={field.dynamic}
          nodeId={nodeId}
        />
      );

    default:
      return null;
  }
}

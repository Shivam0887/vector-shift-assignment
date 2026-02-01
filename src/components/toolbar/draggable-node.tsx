/**
 * Draggable Node Component
 * Renders a node in the toolbar that can be dragged onto the canvas
 */

import type { NodeDefinition } from "@/nodes/types";
import { cn } from "@/lib/cn";

interface DraggableNodeProps {
  definition: NodeDefinition;
}

export function DraggableNode({ definition }: DraggableNodeProps) {
  const Icon = definition.icon;

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ nodeType: definition.type }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all",
        "hover:border-blue-300 hover:shadow-md",
        "active:cursor-grabbing active:scale-95",
      )}
    >
      <Icon className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">
        {definition.displayName}
      </span>
    </div>
  );
}

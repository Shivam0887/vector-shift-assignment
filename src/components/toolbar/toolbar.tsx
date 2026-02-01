/**
 * Pipeline Toolbar
 * Displays draggable nodes that can be added to the canvas
 */

import { getAllNodeDefinitions } from "@/nodes/registry";
import { DraggableNode } from "./draggable-node";

export function Toolbar() {
  const definitions = getAllNodeDefinitions();

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Nodes
        </span>
        <div className="h-4 w-px bg-gray-300" />
        {definitions.map((definition) => (
          <DraggableNode key={definition.type} definition={definition} />
        ))}
      </div>
    </div>
  );
}

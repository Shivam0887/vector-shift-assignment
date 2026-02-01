/**
 * Use Unused Connections Hook
 * Tracks connected nodes that are not being used in any fields
 */

import { useMemo } from "react";
import { useStore } from "@/store";
import { getNodeDefinition } from "@/nodes/registry";
import { extractVariables } from "@/lib/variable-parser";

interface UnusedConnection {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

/**
 * Returns a list of connected nodes that are not referenced in any dynamic fields
 */
export function useUnusedConnections(nodeId: string): UnusedConnection[] {
  const edges = useStore((s) => s.edges);
  const nodes = useStore((s) => s.nodes);

  return useMemo(() => {
    // Get the current node
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return [];

    // Get the definition to find dynamic fields
    const definition = getNodeDefinition(currentNode.type!);
    if (!definition) return [];

    // Extract all variables used in dynamic fields
    const usedVariables: Set<string> = new Set();
    definition.fields.forEach((field) => {
      if (field.dynamic && typeof currentNode.data[field.name] === "string") {
        const vars = extractVariables(currentNode.data[field.name] as string);
        vars.forEach((v) => {
          // Extract the node name from variable (e.g., "input_0.text" -> "input_0")
          const nodePart = v.split(".")[0];
          usedVariables.add(nodePart.toLowerCase());
        });
      }
    });

    // Find all connected source nodes
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const unusedConnections: UnusedConnection[] = [];

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) continue;

      const sourceDefinition = getNodeDefinition(sourceNode.type!);
      if (!sourceDefinition) continue;

      // Get the node name for this source
      let nodeName = "";
      if (sourceNode.type === "customInput") {
        nodeName =
          (sourceNode.data.inputName as string) ||
          `input_${sourceNode.id.replace("customInput-", "")}`;
      } else if (sourceNode.type === "customOutput") {
        nodeName =
          (sourceNode.data.outputName as string) ||
          `output_${sourceNode.id.replace("customOutput-", "")}`;
      } else {
        nodeName = `${sourceNode.type}_${sourceNode.id.split("-")[1] || "0"}`;
      }

      // Check if this node is being used
      const sanitizedName = nodeName.toLowerCase().replace(/\s+/g, "_");
      if (!usedVariables.has(sanitizedName)) {
        unusedConnections.push({
          nodeId: sourceNode.id,
          nodeName: nodeName,
          nodeType: sourceNode.type!,
        });
      }
    }

    return unusedConnections;
  }, [edges, nodes, nodeId]);
}

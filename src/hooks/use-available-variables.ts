/**
 * Variable Provider Hooks
 * Provides available variables from canvas nodes for autocomplete
 */

import { useMemo } from "react";
import { useStore } from "@/store";
import { getNodeDefinition } from "@/nodes/registry";

export interface AvailableVariable {
  /** Variable name to insert (e.g., "input_1.text") */
  name: string;
  /** Display name for the node */
  nodeName: string;
  /** Source node ID */
  nodeId: string;
  /** Source node type */
  nodeType: string;
  /** Output field name */
  fieldName: string;
  /** Description for the autocomplete dropdown */
  description: string;
}

/**
 * Get ALL available variables from ALL nodes on the canvas
 * This is used for the context-aware dropdown when typing {{
 */
export function useAllCanvasVariables(
  excludeNodeId?: string,
): AvailableVariable[] {
  const nodes = useStore((s) => s.nodes);

  return useMemo(() => {
    const variables: AvailableVariable[] = [];

    for (const node of nodes) {
      // Skip the current node (don't show self in dropdown)
      if (node.id === excludeNodeId) continue;

      const definition = getNodeDefinition(node.type!);
      if (!definition) continue;

      // Get all source handles (outputs) from this node
      const sourceHandles = definition.handles.filter(
        (h) => h.type === "source",
      );

      for (const handle of sourceHandles) {
        // Get a friendly name for the node
        let nodeName = "";

        // Use the node's custom name if available
        if (node.type === "customInput") {
          nodeName =
            (node.data.inputName as string) ||
            `Input ${node.id.replace("customInput-", "")}`;
        } else if (node.type === "customOutput") {
          nodeName =
            (node.data.outputName as string) ||
            `Output ${node.id.replace("customOutput-", "")}`;
        } else if (node.type === "text") {
          nodeName = `Text ${node.id.replace("text-", "")}`;
        } else if (node.type === "llm") {
          nodeName = `LLM ${node.id.replace("llm-", "")}`;
        } else {
          nodeName = `${definition.displayName} ${node.id}`;
        }

        // Variable name format: nodeName.outputField (sanitized)
        const sanitizedNodeName = nodeName.toLowerCase().replace(/\s+/g, "_");
        const variableName = `${sanitizedNodeName}.${handle.id}`;

        variables.push({
          name: variableName,
          nodeName: nodeName,
          nodeId: node.id,
          nodeType: node.type!,
          fieldName: handle.label || handle.id,
          description: `${definition.displayName} → ${handle.label || handle.id}`,
        });
      }
    }

    return variables;
  }, [nodes, excludeNodeId]);
}

/**
 * Get available variables only from connected nodes
 * (Legacy - kept for backward compatibility)
 */
export function useAvailableVariables(nodeId: string): AvailableVariable[] {
  const edges = useStore((s) => s.edges);
  const nodes = useStore((s) => s.nodes);

  return useMemo(() => {
    const variables: AvailableVariable[] = [];

    // Find all edges where this node is the target
    const incomingEdges = edges.filter((e) => e.target === nodeId);

    for (const edge of incomingEdges) {
      // Find the source node
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) continue;

      const definition = getNodeDefinition(sourceNode.type!);
      if (!definition) continue;

      // Get the source handle info
      const handleId =
        edge.sourceHandle?.replace(`${sourceNode.id}-`, "") ?? "value";
      const handle = definition.handles.find((h) => h.id === handleId);

      // Get a friendly name for the node
      let nodeName = "";
      if (sourceNode.type === "customInput") {
        nodeName =
          (sourceNode.data.inputName as string) || `input_${sourceNode.id}`;
      } else if (sourceNode.type === "customOutput") {
        nodeName =
          (sourceNode.data.outputName as string) || `output_${sourceNode.id}`;
      } else {
        nodeName = `${definition.displayName}_${sourceNode.id}`;
      }

      const sanitizedNodeName = nodeName.toLowerCase().replace(/\s+/g, "_");
      const variableName = `${sanitizedNodeName}.${handleId}`;

      variables.push({
        name: variableName,
        nodeName: nodeName,
        nodeId: sourceNode.id,
        nodeType: sourceNode.type!,
        fieldName: handle?.label ?? handleId,
        description: `${definition.displayName} → ${handle?.label ?? handleId}`,
      });
    }

    return variables;
  }, [edges, nodes, nodeId]);
}

/**
 * Node Registry
 * Central registry for all node types and their definitions
 */

import type { NodeDefinition } from "./types";
import { inputNodeDefinition } from "./definitions/input-node";
import { outputNodeDefinition } from "./definitions/output-node";
import { llmNodeDefinition } from "./definitions/llm-node";
import { textNodeDefinition } from "./definitions/text-node";

// Registry mapping node types to their definitions
const nodeRegistry = new Map<string, NodeDefinition>();

// Register all built-in nodes
function registerNode(definition: NodeDefinition) {
  nodeRegistry.set(definition.type, definition);
}

// Initialize registry
registerNode(inputNodeDefinition);
registerNode(outputNodeDefinition);
registerNode(llmNodeDefinition);
registerNode(textNodeDefinition);

/**
 * Get a node definition by type
 */
export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return nodeRegistry.get(type);
}

/**
 * Get all registered node definitions
 */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return Array.from(nodeRegistry.values());
}

/**
 * Get node definitions by category
 */
export function getNodesByCategory(
  category: NodeDefinition["category"],
): NodeDefinition[] {
  return getAllNodeDefinitions().filter((def) => def.category === category);
}

/**
 * Check if a node type is registered
 */
export function isNodeTypeRegistered(type: string): boolean {
  return nodeRegistry.has(type);
}

// Export all definitions for direct access
export { inputNodeDefinition } from "./definitions/input-node";
export { outputNodeDefinition } from "./definitions/output-node";
export { llmNodeDefinition } from "./definitions/llm-node";
export { textNodeDefinition } from "./definitions/text-node";

/**
 * Node Type Definitions
 * n8n-inspired declarative node configuration system
 */

import type { LucideIcon } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

// ============================================
// Field Types
// ============================================

export type FieldType = "text" | "select" | "textarea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  /** Unique field name (used as key in node data) */
  name: string;
  /** Display label */
  label: string;
  /** Field type determines the renderer */
  type: FieldType;
  /** Default value for new nodes */
  defaultValue?: string;
  /** Options for select fields */
  options?: SelectOption[];
  /** Whether this field should be parsed for {{variables}} */
  dynamic?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

// ============================================
// Handle Types
// ============================================

export type HandlePosition = "left" | "right" | "top" | "bottom";

export interface HandleDefinition {
  /** Unique handle ID within the node */
  id: string;
  /** Connection type */
  type: "source" | "target";
  /** Position on the node */
  position: HandlePosition;
  /** Optional label shown on hover */
  label?: string;
}

// ============================================
// Node Definition (Declarative Configuration)
// ============================================

export type NodeCategory = "input" | "output" | "processing" | "utility";

export interface NodeDefinition {
  /** Unique node type identifier */
  type: string;
  /** Display name in UI */
  displayName: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Category for grouping in toolbar */
  category: NodeCategory;
  /** Field definitions */
  fields: FieldDefinition[];
  /** Static handle definitions */
  handles: HandleDefinition[];
  /** Whether to generate dynamic handles from {{variables}} in fields */
  dynamicHandles?: boolean;
  /** Description shown in tooltip */
  description?: string;
}

// ============================================
// Node Data Types
// ============================================

export interface BaseNodeData extends Record<string, unknown> {
  /** Node ID (duplicated for convenience) */
  id: string;
  /** Node type */
  nodeType: string;
}

export type PipelineNode = Node<BaseNodeData>;
export type PipelineEdge = Edge;

// ============================================
// Store Types
// ============================================

export interface Variable {
  /** Variable name */
  name: string;
  /** Node ID that defined this variable */
  sourceNodeId: string;
  /** Handle ID for this variable */
  handleId: string;
  /** Current value (if resolved) */
  value?: string;
}

export interface PipelineState {
  // Node state
  nodes: PipelineNode[];
  nodeIDs: Record<string, number>;

  // Edge state
  edges: PipelineEdge[];

  // Variable registry
  variables: Map<string, Variable>;

  // Actions
  getNodeID: (type: string) => string;
  addNode: (node: PipelineNode) => void;
  updateNodeField: (nodeId: string, field: string, value: unknown) => void;
  removeNode: (nodeId: string) => void;

  onNodesChange: (
    changes: import("@xyflow/react").NodeChange<PipelineNode>[],
  ) => void;
  onEdgesChange: (
    changes: import("@xyflow/react").EdgeChange<PipelineEdge>[],
  ) => void;
  onConnect: (connection: import("@xyflow/react").Connection) => void;

  // Pipeline operations
  getPipelineData: () => { nodes: PipelineNode[]; edges: PipelineEdge[] };
  clearPipeline: () => void;
}

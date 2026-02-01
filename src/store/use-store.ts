/**
 * Zustand Store
 * Centralized state management for the pipeline builder
 */

import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { PipelineState, PipelineNode, PipelineEdge } from "@/nodes/types";

export const useStore = create<PipelineState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  nodeIDs: {},
  variables: new Map(),

  // Generate unique node ID
  getNodeID: (type: string) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  // Add a new node
  addNode: (node: PipelineNode) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  // Update a specific field in a node's data
  updateNodeField: (nodeId: string, field: string, value: unknown) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, [field]: value },
          };
        }
        return node;
      }),
    });
  },

  // Remove a node
  removeNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    });
  },

  // Handle node changes (move, resize, select, etc.)
  onNodesChange: (changes: NodeChange<PipelineNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  // Handle edge changes
  onEdgesChange: (changes: EdgeChange<PipelineEdge>[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Handle new connections
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            height: 20,
            width: 20,
          },
        },
        get().edges,
      ),
    });
  },

  // Get pipeline data for submission
  getPipelineData: () => ({
    nodes: get().nodes,
    edges: get().edges,
  }),

  // Clear the entire pipeline
  clearPipeline: () => {
    set({
      nodes: [],
      edges: [],
      nodeIDs: {},
      variables: new Map(),
    });
  },
}));

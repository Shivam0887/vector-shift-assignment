/**
 * Pipeline Canvas
 * The main React Flow canvas for building pipelines
 */

import { useRef, useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionLineType,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useStore } from "@/store";
import { BaseNode, getAllNodeDefinitions, getNodeDefinition } from "@/nodes";
import type { PipelineNode, BaseNodeData } from "@/nodes/types";

// Grid settings
const GRID_SIZE = 20;

// Node types registry - all nodes use BaseNode
const nodeTypes = getAllNodeDefinitions().reduce(
  (acc, def) => {
    acc[def.type] = BaseNode;
    return acc;
  },
  {} as Record<string, typeof BaseNode>,
);

export function PipelineCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<PipelineNode> | null>(null);

  // Get store state and actions
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);

  // Create initial node data based on definition
  const getInitialNodeData = useCallback(
    (nodeId: string, nodeType: string): BaseNodeData => {
      const definition = getNodeDefinition(nodeType);
      const data: BaseNodeData = {
        id: nodeId,
        nodeType: nodeType,
      };

      // Set default values from field definitions
      if (definition) {
        definition.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            data[field.name] = field.defaultValue;
          } else if (field.name === "inputName") {
            data[field.name] = nodeId.replace("customInput-", "input_");
          } else if (field.name === "outputName") {
            data[field.name] = nodeId.replace("customOutput-", "output_");
          }
        });
      }

      return data;
    },
    [],
  );

  // Handle node drop from toolbar
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData("application/reactflow");

      if (!dataStr || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const { nodeType } = JSON.parse(dataStr);

      // Check if valid node type
      if (!nodeType) {
        return;
      }

      // Calculate drop position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Snap to grid
      position.x = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
      position.y = Math.round(position.y / GRID_SIZE) * GRID_SIZE;

      // Create new node
      const nodeId = getNodeID(nodeType);
      const newNode: PipelineNode = {
        id: nodeId,
        type: nodeType,
        position,
        data: getInitialNodeData(nodeId, nodeType),
      };

      addNode(newNode);
    },
    [reactFlowInstance, getNodeID, addNode, getInitialNodeData],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={GRID_SIZE}
          size={1}
          color="#d1d5db"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-white! border-gray-200!"
        />
      </ReactFlow>
    </div>
  );
}

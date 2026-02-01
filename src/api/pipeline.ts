/**
 * Pipeline API Client
 * Handles communication with the FastAPI backend
 */

const API_BASE_URL = "http://localhost:8000";

export interface PipelineAnalysisResult {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
}

export interface PipelineNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PipelinePayload {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

/**
 * Submit pipeline for analysis
 */
export async function analyzePipeline(
  pipeline: PipelinePayload,
): Promise<PipelineAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

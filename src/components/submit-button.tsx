/**
 * Submit Button Component
 * Submits the pipeline to the backend for analysis
 */

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useStore } from "@/store";
import {
  analyzePipeline,
  type PipelineAnalysisResult,
  type PipelinePayload,
} from "@/api";
import { cn } from "@/lib/cn";

export function SubmitButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const getPipelineData = useStore((s) => s.getPipelineData);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { nodes, edges } = getPipelineData();

      // Transform to API format
      const payload = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type ?? "unknown",
          data: n.data as Record<string, unknown>,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
      };

      const analysisResult = await analyzePipeline(payload as PipelinePayload);
      setResult(analysisResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze pipeline",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 border-t border-gray-200 bg-white px-4 py-3">
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all",
          loading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Submit Pipeline</span>
          </>
        )}
      </button>

      {/* Result display */}
      {result && (
        <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-sm">
            <span className="font-medium text-green-800">
              Nodes: {result.num_nodes}
            </span>
            <span className="mx-2 text-green-600">|</span>
            <span className="font-medium text-green-800">
              Edges: {result.num_edges}
            </span>
            <span className="mx-2 text-green-600">|</span>
            <span className="font-medium text-green-800">
              DAG: {result.is_dag ? "Yes ✓" : "No ✗"}
            </span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Warning Box Component
 * Displays orange warning messages for unused connections
 */

import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

interface WarningBoxProps {
  type?: "warning" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function WarningBox({
  type = "warning",
  title,
  children,
  className,
  action,
}: WarningBoxProps) {
  const isWarning = type === "warning";
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        "rounded-md border p-3",
        isWarning
          ? "border-amber-200 bg-amber-50"
          : "border-blue-200 bg-blue-50",
        className,
      )}
    >
      <div className="flex gap-2">
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 mt-0.5",
            isWarning ? "text-amber-600" : "text-blue-600",
          )}
        />
        <div className="flex-1 min-w-0">
          {title && (
            <p
              className={cn(
                "text-xs font-medium mb-1",
                isWarning ? "text-amber-800" : "text-blue-800",
              )}
            >
              {title}
            </p>
          )}
          <div
            className={cn(
              "text-xs",
              isWarning ? "text-amber-700" : "text-blue-700",
            )}
          >
            {children}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-2 text-xs font-medium underline",
                isWarning
                  ? "text-amber-800 hover:text-amber-900"
                  : "text-blue-800 hover:text-blue-900",
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Unused Node Warning
 * Shows when a connected node is not being used in fields
 */
interface UnusedNodeWarningProps {
  unusedNodes: Array<{ nodeId: string; nodeName: string }>;
}

export function UnusedNodeWarning({ unusedNodes }: UnusedNodeWarningProps) {
  if (unusedNodes.length === 0) return null;

  return (
    <WarningBox type="warning">
      <p className="font-medium mb-1">
        You are not using any of the <strong>connected input nodes</strong>.
      </p>
      <div className="flex flex-wrap gap-1 mb-2">
        {unusedNodes.map((node) => (
          <span
            key={node.nodeId}
            className="inline-flex items-center rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
          >
            {node.nodeName}.x
          </span>
        ))}
      </div>
      <p>
        Drag a <span className="font-medium">'variable field'</span> from the
        above into input area or type{" "}
        <span className="font-mono font-medium">"{`{{`}"</span>
      </p>
    </WarningBox>
  );
}

/**
 * Variable Chip Component
 * Displays a variable reference as a removable chip/tag
 * Format: = nodename.field
 */

import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface VariableChipProps {
  nodeName: string;
  fieldName: string;
  onRemove?: () => void;
  className?: string;
}

export function VariableChip({
  nodeName,
  fieldName,
  onRemove,
  className,
}: VariableChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800",
        className,
      )}
    >
      <span className="text-amber-600">=</span>
      <span>
        {nodeName}.{fieldName}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-amber-200 transition-colors"
          aria-label={`Remove ${nodeName}.${fieldName}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

/**
 * Parse a variable string like "{{nodename.field}}" into parts
 */
export function parseVariableString(variable: string): {
  nodeName: string;
  fieldName: string;
} | null {
  const match = variable.match(/^\{\{(.+?)\.(.+?)\}\}$/);
  if (match) {
    return { nodeName: match[1], fieldName: match[2] };
  }
  return null;
}

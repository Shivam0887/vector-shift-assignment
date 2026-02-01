/**
 * Select Field Component
 */

import { cn } from "@/lib/cn";
import type { SelectOption } from "../types";

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: SelectOption[];
  className?: string;
}

export function SelectField({
  value,
  onChange,
  label,
  options,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="nodrag rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

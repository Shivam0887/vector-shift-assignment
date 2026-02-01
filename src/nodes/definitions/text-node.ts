/**
 * Text Node Definition
 * Supports dynamic handle generation from {{variables}}
 */

import { Type } from "lucide-react";
import type { NodeDefinition } from "../types";

export const textNodeDefinition: NodeDefinition = {
  type: "text",
  displayName: "Text",
  icon: Type,
  category: "utility",
  description: "Text template with variable interpolation",
  fields: [
    {
      name: "text",
      label: "Text",
      type: "textarea",
      defaultValue: "{{input}}",
      placeholder: "Enter text with {{variables}}",
      dynamic: true, // Enable variable parsing
    },
  ],
  handles: [
    {
      id: "output",
      type: "source",
      position: "right",
      label: "Output",
    },
  ],
  dynamicHandles: true, // Generate handles for {{variables}}
};

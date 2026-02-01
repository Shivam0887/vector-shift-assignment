/**
 * Output Node Definition
 */

import { LogOut } from "lucide-react";
import type { NodeDefinition } from "../types";

export const outputNodeDefinition: NodeDefinition = {
  type: "customOutput",
  displayName: "Output",
  icon: LogOut,
  category: "output",
  description: "Outputs values from the pipeline",
  fields: [
    {
      name: "outputName",
      label: "Name",
      type: "text",
      placeholder: "Enter output name",
    },
    {
      name: "outputType",
      label: "Type",
      type: "select",
      defaultValue: "Text",
      options: [
        { value: "Text", label: "Text" },
        { value: "Image", label: "Image" },
      ],
    },
    {
      name: "outputValue",
      label: "Result",
      type: "textarea",
      placeholder: "Select variables to combine in output...",
      dynamic: true, // Enable variable chips and dropdown
    },
  ],
  handles: [
    {
      id: "value",
      type: "target",
      position: "left",
      label: "Value",
    },
  ],
  dynamicHandles: true, // Generate handles from variables
};

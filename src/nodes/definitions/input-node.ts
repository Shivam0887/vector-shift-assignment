/**
 * Input Node Definition
 */

import { LogIn } from "lucide-react";
import type { NodeDefinition } from "../types";

export const inputNodeDefinition: NodeDefinition = {
  type: "customInput",
  displayName: "Input",
  icon: LogIn,
  category: "input",
  description: "Provides input values to the pipeline",
  fields: [
    {
      name: "inputName",
      label: "Name",
      type: "text",
      placeholder: "Enter input name",
    },
    {
      name: "inputType",
      label: "Type",
      type: "select",
      defaultValue: "Text",
      options: [
        { value: "Text", label: "Text" },
        { value: "File", label: "File" },
      ],
    },
    {
      name: "inputValue",
      label: "Value",
      type: "textarea",
      placeholder: "Enter input value...",
    },
  ],
  handles: [
    {
      id: "value",
      type: "source",
      position: "right",
      label: "Value",
    },
  ],
};

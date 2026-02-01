/**
 * Variable Parser
 * Extracts {{variable}} patterns from text and provides highlighting
 */

const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g;

/**
 * Extract all unique variable names from text
 */
export function extractVariables(text: string): string[] {
  const matches = text.matchAll(VARIABLE_REGEX);
  return [...new Set([...matches].map((m) => m[1]))];
}

/**
 * Check if a string contains any variables
 */
export function hasVariables(text: string): boolean {
  return VARIABLE_REGEX.test(text);
}

/**
 * Replace variables in text with their values
 */
export function replaceVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(VARIABLE_REGEX, (match, varName) => {
    return values[varName] ?? match;
  });
}

/**
 * Get segments of text split by variables for highlighting
 */
export interface TextSegment {
  type: "text" | "variable";
  content: string;
  variableName?: string;
}

export function parseTextWithVariables(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(VARIABLE_REGEX.source, "g");

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the variable
    segments.push({
      type: "variable",
      content: match[0],
      variableName: match[1],
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

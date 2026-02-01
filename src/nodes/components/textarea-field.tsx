/**
 * TextareaField - Chip/Tag Style Variable Input
 *
 * Features:
 * 1. Contenteditable div for mixed text + chip rendering
 * 2. Type {{ to trigger autocomplete popup
 * 3. Two-step selection: Node → Field
 * 4. Chips rendered inline with remove button
 * 5. Proper focus/blur handling
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { useAllCanvasVariables } from "@/hooks";

// =============================================================================
// TYPES
// =============================================================================

interface TextareaFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  dynamic?: boolean;
  className?: string;
  nodeId?: string;
  readOnly?: boolean;
}

interface NodeData {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  fields: string[];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TextareaField({
  value,
  onChange,
  label,
  placeholder,
  dynamic = false,
  className,
  nodeId,
  readOnly = false,
}: TextareaFieldProps) {
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState<1 | 2>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Track if clicking inside popup (to prevent blur closing it)
  const clickingPopup = useRef(false);

  // Get available variables from canvas
  const allVariables = useAllCanvasVariables(nodeId);

  // ==========================================================================
  // STEP 1: Group variables by node
  // ==========================================================================

  const nodes: NodeData[] = (() => {
    const map = new Map<string, NodeData>();

    allVariables.forEach((v) => {
      if (!map.has(v.nodeId)) {
        map.set(v.nodeId, {
          nodeId: v.nodeId,
          nodeName: v.nodeName,
          nodeType: v.nodeType,
          fields: [],
        });
      }
      map.get(v.nodeId)!.fields.push(v.fieldName);
    });

    return Array.from(map.values());
  })();

  // Get selected node data for Step 2
  const selectedNode = nodes.find((n) => n.nodeId === selectedNodeId);

  // ==========================================================================
  // STEP 2: Sync value to editor HTML
  // ==========================================================================

  const renderValueToHTML = useCallback(
    (text: string): string => {
      // Match {{variable.name}} patterns
      const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g;

      let result = "";
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Add text before match (escaped)
        if (match.index > lastIndex) {
          const textBefore = text.slice(lastIndex, match.index);
          result += escapeHTML(textBefore);
        }

        // Add chip for variable
        const varName = match[1];
        result += createChipHTML(varName);

        lastIndex = regex.lastIndex;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        result += escapeHTML(text.slice(lastIndex));
      }

      return (
        result ||
        `<span class="placeholder">${placeholder || "Type here..."}</span>`
      );
    },
    [placeholder],
  );

  // Sync value → editor HTML
  useEffect(() => {
    if (!editorRef.current || !dynamic) return;

    const html = renderValueToHTML(value);

    // Only update if different (prevents cursor jump)
    if (editorRef.current.innerHTML !== html) {
      // Save selection
      const selection = window.getSelection();
      const hadFocus = document.activeElement === editorRef.current;

      editorRef.current.innerHTML = html;

      // Restore cursor at end if had focus
      if (hadFocus && selection) {
        moveCursorToEnd(editorRef.current);
      }
    }
  }, [value, dynamic, renderValueToHTML]);

  // ==========================================================================
  // STEP 3: Extract value from editor HTML
  // ==========================================================================

  const extractValueFromEditor = useCallback((): string => {
    if (!editorRef.current) return "";

    let result = "";

    const walkNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.classList.contains("chip")) {
          // Extract variable from data attribute
          const varName = el.dataset.variable;
          if (varName) {
            result += `{{${varName}}}`;
          }
        } else if (el.classList.contains("placeholder")) {
          // Skip placeholder
        } else if (el.tagName === "BR") {
          result += "\n";
        } else {
          // Recurse into children
          el.childNodes.forEach(walkNodes);
        }
      }
    };

    editorRef.current.childNodes.forEach(walkNodes);
    return result;
  }, []);

  // ==========================================================================
  // STEP 4: Handle input in editor
  // ==========================================================================

  const handleInput = useCallback(() => {
    const newValue = extractValueFromEditor();
    onChange(newValue);

    // Check for {{ trigger
    if (dynamic) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          const text = range.startContainer.textContent || "";
          const cursor = range.startOffset;
          const beforeCursor = text.slice(0, cursor);

          const lastOpen = beforeCursor.lastIndexOf("{{");
          const lastClose = beforeCursor.lastIndexOf("}}");

          if (lastOpen > lastClose) {
            // Show popup
            setShowPopup(true);
            setPopupStep(1);
            setSelectedNodeId(null);
            setHighlightIndex(0);
            return;
          }
        }
      }
    }

    // Hide popup if no trigger
    setShowPopup(false);
  }, [dynamic, extractValueFromEditor, onChange]);

  // ==========================================================================
  // STEP 5: Handle blur (close popup unless clicking inside it)
  // ==========================================================================

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!clickingPopup.current) {
        setShowPopup(false);
        setPopupStep(1);
        setSelectedNodeId(null);
      }
    }, 100);
  }, []);

  // ==========================================================================
  // STEP 6: Insert variable at cursor
  // ==========================================================================

  const insertVariable = useCallback(
    (nodeName: string, fieldName: string) => {
      if (!editorRef.current) return;

      const varName = `${nodeName.toLowerCase().replace(/\s+/g, "_")}.${fieldName}`;

      // Get current selection
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // No selection, append
        onChange(value + `{{${varName}}}`);
      } else {
        const range = selection.getRangeAt(0);

        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = range.startContainer;
          const text = textNode.textContent || "";
          const cursor = range.startOffset;

          // Find {{ before cursor
          const beforeCursor = text.slice(0, cursor);
          const lastOpen = beforeCursor.lastIndexOf("{{");

          if (lastOpen !== -1) {
            // Replace from {{ to cursor with the chip
            const before = text.slice(0, lastOpen);
            const after = text.slice(cursor);

            // Update the text node
            textNode.textContent = before + after;

            // Create and insert chip
            const chip = createChipElement(varName);

            // Insert chip at position
            if (before.length === 0 && textNode.parentNode) {
              textNode.parentNode.insertBefore(chip, textNode);
            } else {
              // Split text node and insert chip
              const afterNode = document.createTextNode(after);
              textNode.textContent = before;
              textNode.parentNode?.insertBefore(chip, textNode.nextSibling);
              textNode.parentNode?.insertBefore(afterNode, chip.nextSibling);

              // Move cursor after chip
              const newRange = document.createRange();
              newRange.setStartAfter(chip);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }

            // Sync value
            onChange(extractValueFromEditor());
          } else {
            // Fallback: append
            onChange(value + `{{${varName}}}`);
          }
        } else {
          // Fallback: append
          onChange(value + `{{${varName}}}`);
        }
      }

      // Close popup
      setShowPopup(false);
      setPopupStep(1);
      setSelectedNodeId(null);
      clickingPopup.current = false;

      // Refocus editor
      setTimeout(() => editorRef.current?.focus(), 0);
    },
    [value, onChange, extractValueFromEditor],
  );

  // ==========================================================================
  // STEP 7: Handle node selection (go to Step 2)
  // ==========================================================================

  const handleSelectNode = useCallback((node: NodeData) => {
    setSelectedNodeId(node.nodeId);
    setPopupStep(2);
    setHighlightIndex(0);

    // Keep editor focused
    setTimeout(() => editorRef.current?.focus(), 0);
  }, []);

  // ==========================================================================
  // STEP 8: Handle chip removal
  // ==========================================================================

  const handleChipRemove = useCallback(
    (varName: string) => {
      const newValue = value.replace(`{{${varName}}}`, "");
      onChange(newValue);
    },
    [value, onChange],
  );

  // Handle click on editor (for chip remove buttons)
  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("chip-remove")) {
        e.preventDefault();
        e.stopPropagation();
        const varName = target.dataset.variable;
        if (varName) {
          handleChipRemove(varName);
        }
      }
    },
    [handleChipRemove],
  );

  // ==========================================================================
  // STEP 9: Keyboard navigation
  // ==========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showPopup) return;

      const items = popupStep === 1 ? nodes : selectedNode?.fields || [];
      if (items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((i) => Math.min(i + 1, items.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (popupStep === 1) {
            handleSelectNode(nodes[highlightIndex]);
          } else if (selectedNode) {
            insertVariable(
              selectedNode.nodeName,
              selectedNode.fields[highlightIndex],
            );
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowPopup(false);
          break;
        case "Backspace":
          if (popupStep === 2) {
            // Go back to step 1
            setPopupStep(1);
            setSelectedNodeId(null);
            setHighlightIndex(0);
          }
          break;
      }
    },
    [
      showPopup,
      popupStep,
      nodes,
      selectedNode,
      highlightIndex,
      handleSelectNode,
      insertVariable,
    ],
  );

  // ==========================================================================
  // RENDER: Non-dynamic mode (simple textarea)
  // ==========================================================================

  if (!dynamic) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "nodrag w-full resize-none rounded-lg border-2 px-3 py-2.5 text-sm",
            "font-normal leading-relaxed",
            "placeholder:text-gray-400 placeholder:font-normal",
            "transition-all duration-200 ease-out",
            "focus:outline-none",
            readOnly
              ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-400"
          )}
          style={{ minHeight: "80px" }}
        />
      </div>
    );
  }

  // ==========================================================================
  // RENDER: Dynamic mode with chips
  // ==========================================================================

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</label>

      {/* Editor Styles */}
      <style>{`
        .chip-editor {
          transition: all 0.2s ease-out;
        }
        .chip-editor:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .chip-editor .chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1.5px solid #fcd34d;
          border-radius: 6px;
          padding: 2px 8px;
          margin: 0 3px;
          font-size: 12px;
          font-weight: 600;
          color: #b45309;
          user-select: none;
          vertical-align: middle;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .chip-editor .chip-text {
          pointer-events: none;
          letter-spacing: 0.3px;
        }
        .chip-editor .chip-remove {
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 2px 4px;
          border-radius: 3px;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .chip-editor .chip-remove:hover {
          background: rgba(245, 158, 11, 0.3);
        }
        .chip-editor .placeholder {
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }
      `}</style>

      <div className="relative">
        {/* Contenteditable Editor */}
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onClick={handleEditorClick}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            "chip-editor nodrag w-full min-h-[80px] rounded-lg border-2 px-3 py-2.5 text-sm font-normal leading-relaxed",
            "transition-all duration-200 ease-out",
            readOnly
              ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:outline-none",
          )}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            outline: "none",
          }}
          suppressContentEditableWarning
        />

        {/* Popup */}
        {showPopup && nodes.length > 0 && (
          <div
            ref={popupRef}
            className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
            onMouseDown={() => {
              clickingPopup.current = true;
            }}
            onMouseUp={() => {
              clickingPopup.current = false;
            }}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2">
              <StepDot active={popupStep === 1} label="Step 1" />
              <div className="h-px w-8 bg-gray-300" />
              <StepDot active={popupStep === 2} label="Step 2" />
            </div>

            {/* Step 1: Node List */}
            {popupStep === 1 && (
              <>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                  NODES
                </div>
                <div className="max-h-40 overflow-auto py-1">
                  {nodes.map((node, i) => (
                    <button
                      key={node.nodeId}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                        i === highlightIndex
                          ? "bg-blue-50"
                          : "hover:bg-gray-50",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        clickingPopup.current = true;
                      }}
                      onClick={() => handleSelectNode(node)}
                      onMouseEnter={() => setHighlightIndex(i)}
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {node.nodeName}
                      </span>
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                        {node.nodeType}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Field List */}
            {popupStep === 2 && selectedNode && (
              <>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline mr-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clickingPopup.current = true;
                    }}
                    onClick={() => {
                      setPopupStep(1);
                      setSelectedNodeId(null);
                      setHighlightIndex(0);
                      editorRef.current?.focus();
                    }}
                  >
                    ← Back
                  </button>
                  {selectedNode.nodeName} → Fields
                </div>
                <div className="max-h-40 overflow-auto py-1">
                  {selectedNode.fields.map((field, i) => (
                    <button
                      key={field}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors",
                        i === highlightIndex
                          ? "bg-blue-50"
                          : "hover:bg-gray-50",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        clickingPopup.current = true;
                      }}
                      onClick={() =>
                        insertVariable(selectedNode.nodeName, field)
                      }
                      onMouseEnter={() => setHighlightIndex(i)}
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {field}
                      </span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        Text
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          active ? "bg-blue-500" : "bg-gray-300",
        )}
      />
      <span
        className={cn(
          "text-xs",
          active ? "text-blue-600 font-medium" : "text-gray-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function createChipHTML(varName: string): string {
  const [nodeName, fieldName] = varName.split(".");
  return `<span class="chip" contenteditable="false" data-variable="${varName}"><span class="chip-text">= ${nodeName}.${fieldName || ""}</span><span class="chip-remove" data-variable="${varName}">×</span></span>`;
}

function createChipElement(varName: string): HTMLSpanElement {
  const [nodeName, fieldName] = varName.split(".");
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.contentEditable = "false";
  chip.dataset.variable = varName;
  chip.innerHTML = `<span class="chip-text">= ${nodeName}.${fieldName || ""}</span><span class="chip-remove" data-variable="${varName}">×</span>`;
  return chip;
}

function moveCursorToEnd(el: HTMLElement) {
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

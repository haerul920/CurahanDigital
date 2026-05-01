"use client";

import { Bold, Italic, Underline, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface RichTextEditorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMarkdownAction: (action: "bold" | "italic" | "underline") => void;
}

export const RichTextEditor = forwardRef<
  HTMLTextAreaElement,
  RichTextEditorProps
>(({ value, onChange, onMarkdownAction, className, ...props }, ref) => {
  // Helper to wrap selected text
  const handleAction = (type: "bold" | "italic" | "underline") => {
    onMarkdownAction(type);
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center px-2 py-2 border-b border-zinc-700/50 bg-zinc-900 gap-1">
        <button
          type="button"
          onClick={() => handleAction("bold")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAction("italic")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAction("underline")}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-zinc-700 mx-2" />
        <span className="text-xs text-zinc-500 font-medium">
          Markdown Supported
        </span>
      </div>

      {/* Input */}
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        className="min-h-[150px] p-4 bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed resize-none placeholder:text-zinc-600 text-zinc-200"
        placeholder="Start typing your confession..."
        {...props}
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

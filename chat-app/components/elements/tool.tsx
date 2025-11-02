"use client";

import type { ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible 
    defaultOpen={true} 
    className={cn("not-prose mb-4 w-full", className)} 
    {...props} 
  />
);

export type ToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
  input?: Record<string, unknown>;
};

const getToolMessage = (
  type: string,
  input: Record<string, unknown>,
  isComplete: boolean
): string => {
  // Convert tool names to natural language
  if (type === "tool-getTopEpisodes" && input.series) {
    return isComplete
      ? `Found the best episodes of ${input.series}`
      : `Finding the best episodes of ${input.series}`;
  }
  if (type === "tool-searchMovies") {
    const parts: string[] = [];
    if (input.genre) parts.push(`${input.genre}`);
    parts.push("movies");
    if (input.start_year && input.end_year) {
      parts.push(`from ${input.start_year}-${input.end_year}`);
    } else if (input.start_year) {
      parts.push(`from ${input.start_year}`);
    }
    if (input.min_rating) parts.push(`rated ${input.min_rating}+`);
    const searchTerms = parts.join(" ");
    return isComplete ? `Found ${searchTerms}` : `Searching for ${searchTerms}`;
  }
  if (type === "tool-searchSeries" && input.query) {
    return isComplete
      ? `Found TV series: ${input.query}`
      : `Searching for TV series: ${input.query}`;
  }
  if (type === "tool-compareSeries") {
    return isComplete ? `Compared TV series` : `Comparing TV series`;
  }
  if (type === "tool-compareMovies") {
    return isComplete ? `Compared movies` : `Comparing movies`;
  }
  if (type === "tool-getEpisodes" && input.tconst) {
    return isComplete ? `Loaded all episodes` : `Loading all episodes`;
  }
  if (type === "tool-seriesAnalytics") {
    return isComplete ? `Analyzed series data` : `Analyzing series data`;
  }
  if (type === "tool-worstEpisodes") {
    return isComplete
      ? `Found the lowest-rated episodes`
      : `Finding the lowest-rated episodes`;
  }
  if (type === "tool-topMovies") {
    return isComplete ? `Found top-rated movies` : `Finding top-rated movies`;
  }
  if (type === "tool-genreAnalysis") {
    return isComplete ? `Analyzed genres` : `Analyzing genres`;
  }
  if (type === "tool-decadeAnalysis") {
    return isComplete ? `Analyzed by decade` : `Analyzing by decade`;
  }
  if (type === "tool-movieDetails") {
    return isComplete ? `Found movie details` : `Looking up movie details`;
  }
  if (type === "tool-resolveSeries") {
    return isComplete
      ? `Found series information`
      : `Looking up series information`;
  }
  if (type === "tool-checkImdbHealth") {
    return isComplete ? `Database is healthy` : `Checking database status`;
  }

  return isComplete ? "Complete" : "Searching";
};

const formatContextualDetails = (input: Record<string, unknown>): string[] => {
  const details: string[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;

    const formattedKey = key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .toLowerCase()
      .trim();

    if (typeof value === "string") {
      details.push(`Looking for ${formattedKey}: "${value}"`);
    } else if (typeof value === "number") {
      details.push(`Using ${formattedKey}: ${value}`);
    } else if (typeof value === "boolean") {
      details.push(`${formattedKey}: ${value ? "enabled" : "disabled"}`);
    } else if (Array.isArray(value)) {
      details.push(`Checking ${formattedKey}: ${value.join(", ")}`);
    }
  }

  return details;
};

export const ToolHeader = ({
  className,
  type,
  state,
  input,
  ...props
}: ToolHeaderProps) => {
  const isStreaming =
    state === "input-available" || state === "input-streaming";
  const isComplete = state === "output-available";
  const message = getToolMessage(type, input || {}, isComplete);

  // If not complete, just show non-interactive text
  if (!isComplete) {
    return (
      <div
        className={cn(
          "mb-2 w-fit rounded-full bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm animate-in fade-in slide-in-from-top-1 duration-500",
          className
        )}
      >
        <TextShimmer duration={2} className="text-sm">
          {message}
        </TextShimmer>
      </div>
    );
  }

  // When complete, show expandable trigger with chevron
  return (
    <CollapsibleTrigger
      className={cn(
        "group mb-2 flex w-fit items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm transition-all hover:bg-muted animate-in fade-in slide-in-from-top-1 duration-500",
        className
      )}
      {...props}
    >
      <span>{message}</span>
      <ChevronDownIcon className="size-3 transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2",
      className
    )}
    {...props}
  />
);

export type ToolDetailsProps = {
  input: Record<string, unknown>;
  className?: string;
};

export const ToolDetails = ({ input, className }: ToolDetailsProps) => {
  const details = formatContextualDetails(input);

  if (details.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-2 space-y-1 rounded-lg bg-muted/30 p-3 text-muted-foreground text-xs",
        className
      )}
    >
      {details.map((detail, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
          <span className="leading-relaxed">{detail}</span>
        </div>
      ))}
    </div>
  );
};

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ReactNode;
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  if (errorText) {
    return (
      <div
        className={cn(
          "rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100",
          className
        )}
        {...props}
      >
        <p className="text-sm">{errorText}</p>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {output}
    </div>
  );
};

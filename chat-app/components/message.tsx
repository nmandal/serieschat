"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
  ToolDetails,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { ImdbAnalytics } from "./imdb-analytics";
import { ImdbBrowseMovies } from "./imdb-browse-movies";
import { ImdbBrowseTv } from "./imdb-browse-tv";
import { ImdbComparison } from "./imdb-comparison";
import { ImdbDecadeAnalysis } from "./imdb-decade-analysis";
import { ImdbEpisodeGraph } from "./imdb-episode-graph";
import { ImdbEpisodes } from "./imdb-episodes";
import { ImdbGenreAnalysis } from "./imdb-genre-analysis";
import { ImdbHealth } from "./imdb-health";
import { ImdbMovieComparison } from "./imdb-movie-comparison";
import { ImdbMovieDetails } from "./imdb-movie-details";
import { ImdbMovieSearch } from "./imdb-movie-search";
import { ImdbSearchResults } from "./imdb-search-results";
import { ImdbSeriesInfo } from "./imdb-series-info";
import { ImdbTopEpisodes } from "./imdb-top-episodes";
import { ImdbTopMovies } from "./imdb-top-movies";
import { ImdbWorstEpisodes } from "./imdb-worst-episodes";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "min-h-96": message.role === "assistant" && requiresScrollPadding,
            "w-full":
              (message.role === "assistant" &&
                message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                )) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-getWeather"
                    input={part.input}
                  />
                  <ToolContent>
                    <ToolDetails
                      input={part.input as Record<string, unknown>}
                    />
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={<Weather weatherAtLocation={part.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId } = part;

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-requestSuggestions"
                    input={part.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={part.output}
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-resolveSeries" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-resolveSeries"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbSeriesInfo seriesInfo={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-getEpisodes" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-getEpisodes"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbEpisodes data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-getTopEpisodes" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-getTopEpisodes"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbTopEpisodes data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-checkImdbHealth" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-checkImdbHealth"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={<ImdbHealth data={toolPart.output} />}
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-searchSeries" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-searchSeries"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbSearchResults data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-compareSeries" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-compareSeries"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbComparison data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-seriesAnalytics" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-seriesAnalytics"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbAnalytics data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-worstEpisodes" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-worstEpisodes"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbWorstEpisodes data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-searchMovies" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-searchMovies"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbMovieSearch data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-movieDetails" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-movieDetails"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbMovieDetails data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-compareMovies" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-compareMovies"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbMovieComparison data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-topMovies" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-topMovies"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbTopMovies data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-genreAnalysis" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-genreAnalysis"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbGenreAnalysis data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-decadeAnalysis" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-decadeAnalysis"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbDecadeAnalysis data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-browseTv" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-browseTv"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbBrowseTv data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-browseMovies" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-browseMovies"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbBrowseMovies data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-rankedTv" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-rankedTv"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbBrowseTv data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-rankedMovies" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-rankedMovies"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbBrowseMovies data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            if (type === ("tool-seriesEpisodeGraph" as typeof type)) {
              const toolPart = part as any;
              const { toolCallId, state } = toolPart;

              return (
                <Tool key={toolCallId}>
                  <ToolHeader
                    state={state}
                    type="tool-seriesEpisodeGraph"
                    input={toolPart.input}
                  />
                  <ToolContent>
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={
                          toolPart.errorText ||
                          ("error" in toolPart.output
                            ? String(toolPart.output.error)
                            : undefined)
                        }
                        output={
                          "error" in toolPart.output ? null : (
                            <ImdbEpisodeGraph data={toolPart.output} />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
      return false;
    }
    if (!equal(prevProps.message.parts, nextProps.message.parts)) {
      return false;
    }
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }

    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="p-0 text-muted-foreground text-sm">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};

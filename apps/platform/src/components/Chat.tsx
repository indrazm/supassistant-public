import { createHttpClientTransport } from "@anvia/client";
import { useChat } from "@anvia/react";
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@anvia/react-ui";

const transport = createHttpClientTransport({ endpoint: "/api/chat" });

export function Chat() {
  const chat = useChat({ transport });
  const busy =
    chat.status === "submitted" || chat.status === "streaming" || chat.status === "waiting";

  return (
    <ChatProvider controller={chat}>
      <main className="chat">
        <header className="chat-header">SuperAssistant</header>
        <ThreadPrimitive.Root className="chat-thread">
          <ThreadPrimitive.Viewport className="chat-viewport">
            <ThreadPrimitive.Empty>
              <p className="chat-empty">What can I help with?</p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages className="chat-messages">
              {(message) => (
                <MessagePrimitive.Root
                  key={message.id}
                  className={`chat-message chat-message--${message.role}`}
                >
                  <MessagePrimitive.Parts
                    filter={(part) => part.type === "text" || part.type === "tool"}
                    stream={{
                      isStreaming:
                        chat.status === "streaming" &&
                        message.role === "assistant" &&
                        chat.messages.at(-1)?.id === message.id,
                      resetKey: message.id,
                      flushImmediately: chat.status === "error",
                    }}
                  >
                    {(part) =>
                      part.type === "text" ? (
                        <MessagePrimitive.Markdown />
                      ) : part.type === "tool" ? (
                        <p className="chat-tool-call">
                          {part.state === "output-available" || part.state === "error"
                            ? `${part.toolName} · done`
                            : `${part.toolName}…`}
                        </p>
                      ) : null
                    }
                  </MessagePrimitive.Parts>
                </MessagePrimitive.Root>
              )}
            </ThreadPrimitive.Messages>
            <ThreadPrimitive.Error>
              {(error) => <p className="chat-error">Something went wrong: {String(error)}</p>}
            </ThreadPrimitive.Error>
          </ThreadPrimitive.Viewport>
          <ThreadPrimitive.ViewportFooter>
            <ComposerPrimitive.Root className="chat-composer">
              <ComposerPrimitive.TextareaInput
                className="chat-input"
                placeholder="Message SuperAssistant…"
                autoResize
                maxRows={8}
                rows={1}
              />
              {busy ? (
                <ComposerPrimitive.Stop className="chat-send chat-send--stop">
                  Stop
                </ComposerPrimitive.Stop>
              ) : (
                <ComposerPrimitive.Submit className="chat-send">Send</ComposerPrimitive.Submit>
              )}
            </ComposerPrimitive.Root>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Root>
      </main>
    </ChatProvider>
  );
}

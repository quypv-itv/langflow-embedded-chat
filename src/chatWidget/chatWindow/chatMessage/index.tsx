import Markdown from "react-markdown";
import { ChatMessageType } from "../../../types/chatWidget";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";

export default function ChatMessage({
  message,
  isSend,
  error,
  isStreaming,
  user_message_style,
  bot_message_style,
  error_message_style,
}: ChatMessageType) {

  return (
    <div
      className={
        "cl-chat-message " + (isSend ? " cl-justify-end" : " cl-justify-start")
      }
    >
      {isSend ? (
        <div style={user_message_style} className="cl-user_message">
          {message}
        </div>
      ) : error ? (
        <div style={error_message_style} className={"cl-error_message"}>
          {message}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <img src="https://cdn2.hubspot.net/hub/6619918/hubfs/logo-innotech-vietnam-corporation-tach-nen.png?width=40&height=40" alt="Logo" width={35} height={35} />
          <div className={`cl-bot_message ${isStreaming ? 'cl-streaming-text' : ''}`} style={bot_message_style}>
            {message === "loading" ? (
              <div className="cl-thinking-container">
                <span className="cl-thinking-text-shimmer">Thinking</span>
                <div className="cl-thinking-dots">
                  <span className="cl-dot cl-dot-1">.</span>
                  <span className="cl-dot cl-dot-2">.</span>
                  <span className="cl-dot cl-dot-3">.</span>
                </div>
              </div>
            ) : (
              <Markdown 
            className={"markdown-body prose flex flex-col word-break-break-word"}
            remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeMathjax]}
            >
              {message}
            </Markdown>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

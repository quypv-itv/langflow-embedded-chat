import React from "react";
import { ChatMessagePlaceholderType } from "../types/chatWidget";

export default function ChatMessagePlaceholder({
  bot_message_style,
}: ChatMessagePlaceholderType) {
  return (
    <div className="cl-chat-message cl-justify-start">
      <div style={bot_message_style} className="cl-bot_message">
        <div className="cl-thinking-container">
          <span className="cl-thinking-text">Xin chờ một chút</span>
          <div className="cl-thinking-dots">
            <span className="cl-dot cl-dot-1">.</span>
            <span className="cl-dot cl-dot-2">.</span>
            <span className="cl-dot cl-dot-3">.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

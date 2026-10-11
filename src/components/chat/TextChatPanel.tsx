"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/useMatchmaking";
import { Send, X, MessageSquare } from "lucide-react";

interface TextChatPanelProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  className?: string;
}

export const TextChatPanel: React.FC<TextChatPanelProps> = ({
  messages,
  currentUserId,
  isOpen,
  onClose,
  onSendMessage,
  isConnected,
  className = "",
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !isConnected) return;
    onSendMessage(trimmed);
    setInputText("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex flex-col h-full rounded-3xl bg-[#0c101c]/95 border border-white/10 backdrop-blur-xl shadow-glass overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Live Text Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-xs">
              {isConnected
                ? "Say hello! Messages are private to this call."
                : "Messages will appear here once matched."}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words ${
                    isMe
                      ? "bg-gradient-to-r from-brand-600 to-brand-violet text-white rounded-br-none shadow-sm"
                      : "bg-white/10 text-slate-200 rounded-bl-none border border-white/5"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 px-1">{time}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/40">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!isConnected}
            placeholder={isConnected ? "Type a message..." : "Match with someone to chat"}
            maxLength={500}
            className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="absolute right-1.5 p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand-500 transition-colors"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

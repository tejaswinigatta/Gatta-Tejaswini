/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Settings,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  ChatMessage,
  DEFAULT_N8N_WEBHOOK_URL,
  getN8nSessionId,
  getN8nWebhookUrl,
  loadSavedChatHistory,
  resetN8nSessionId,
  resetN8nWebhookUrl,
  saveChatHistory,
  sendN8nChatMessage,
  setN8nWebhookUrl,
  TaskContextSummary,
} from '../services/n8nChat';

interface N8nChatWidgetProps {
  taskContext?: TaskContextSummary;
  onAddTaskFromChat?: (title: string, description?: string) => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
  hideFloatingTrigger?: boolean;
}

const STARTER_PROMPTS = [
  'Help me prioritize my pending tasks',
  'Suggest a study schedule for college exams',
  'Tips for breaking down a large project',
  'How do I maintain focus today?',
];

export const N8nChatWidget: React.FC<N8nChatWidgetProps> = ({
  taskContext,
  onAddTaskFromChat,
  isOpenExternal,
  onToggleExternal,
  hideFloatingTrigger = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookInput, setWebhookInput] = useState(getN8nWebhookUrl());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external open state if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Load chat history on mount
  useEffect(() => {
    const history = loadSavedChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Default initial welcome greeting
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'bot',
          text: "👋 Hi! I'm your **TaskFlow AI Assistant** powered by your n8n workflow. I can help you organize tasks, suggest study routines, prioritize your schedule, or break down big projects. What are you working on today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  // Scroll to bottom on message change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
    if (onToggleExternal && isOpenExternal !== isOpen) {
      onToggleExternal(isOpen);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await sendN8nChatMessage(text, taskContext);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedMessages = [...newMessages, botMsg];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error: unknown) {
      const err = error as Error;
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'bot',
        text: `⚠️ **Connection Error**: ${err.message || 'Failed to reach n8n workflow.'}\n\n*Please ensure your n8n workflow is active and public CORS is enabled on the Chat Trigger.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      const updatedMessages = [...newMessages, errorMsg];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetSession = () => {
    if (window.confirm('Start a new chat session? This will clear the chat history and restart conversation context.')) {
      resetN8nSessionId();
      const freshHistory: ChatMessage[] = [
        {
          id: 'msg-welcome-new',
          sender: 'bot',
          text: "🔄 New session started. How can I help you with your tasks or planning?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setMessages(freshHistory);
      saveChatHistory(freshHistory);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setN8nWebhookUrl(webhookInput);
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleResetWebhookToDefault = () => {
    const defaultUrl = resetN8nWebhookUrl();
    setWebhookInput(defaultUrl);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      await sendN8nChatMessage('ping');
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('failed');
      setTimeout(() => setTestStatus('idle'), 4000);
    }
  };

  // Safe simple markdown-to-elements renderer
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 shrink-0" />
                <span className="flex-1">{renderInlineMarkdown(content)}</span>
              </div>
            );
          }

          // Numbered lists (e.g. "1. Step")
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5 shrink-0">
                  {numMatch[1]}.
                </span>
                <span className="flex-1">{renderInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          // Normal paragraph line
          return <p key={idx}>{renderInlineMarkdown(line)}</p>;
        })}
      </div>
    );
  };

  // Helper for inline markdown: **bold**, *italic*, `code`
  const renderInlineMarkdown = (text: string) => {
    // Split by markdown delimiters
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-neutral-800 dark:text-neutral-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded font-mono text-[12px] bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!hideFloatingTrigger && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={handleToggle}
            aria-label={isOpen ? 'Close n8n AI Chat' : 'Open n8n AI Assistant'}
            className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full font-medium text-sm shadow-xl transition-all duration-200 cursor-pointer ${
              isOpen
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-95'
                : 'bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-600 text-white hover:shadow-2xl hover:scale-105 active:scale-95'
            }`}
          >
            {isOpen ? (
              <X className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}

            <span className="font-semibold tracking-tight">
              {isOpen ? 'Close Assistant' : 'n8n Assistant'}
            </span>

            {hasUnread && !isOpen && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-950" />
            )}
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="n8n AI Chatbot"
          className="fixed bottom-22 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-7rem)] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    TaskFlow Assistant
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    n8n Online
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  AI Task & Productivity Workflow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Webhook connection settings"
                aria-label="Webhook settings"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showSettings
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetSession}
                title="Restart conversation"
                aria-label="Reset chat session"
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat"
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Webhook Settings Drawer */}
          {showSettings && (
            <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 animate-in slide-in-from-top duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  n8n Webhook Configuration
                </span>
                <button
                  type="button"
                  onClick={handleResetWebhookToDefault}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset default
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-2">
                <input
                  type="url"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  placeholder="https://.../webhook/.../chat"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="px-2.5 py-1 text-[11px] font-medium rounded bg-neutral-200 dark:bg-neutral-750 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer flex items-center gap-1"
                  >
                    {testStatus === 'testing' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {testStatus === 'success' && <Check className="w-3 h-3 text-emerald-500" />}
                    {testStatus === 'failed' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    <span>
                      {testStatus === 'testing'
                        ? 'Testing...'
                        : testStatus === 'success'
                        ? 'Connected!'
                        : testStatus === 'failed'
                        ? 'Ping Failed'
                        : 'Test Ping'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] font-semibold rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 cursor-pointer"
                  >
                    {settingsSaved ? 'Saved!' : 'Save URL'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Context Banner */}
          {taskContext && (
            <div className="px-4 py-1.5 bg-neutral-100/70 dark:bg-neutral-850/60 border-b border-neutral-200/60 dark:border-neutral-800/60 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>
                Context: {taskContext.pendingCount} pending · {taskContext.todayCount} due today
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                Session: {getN8nSessionId().slice(0, 12)}...
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs transition-all ${
                      isBot
                        ? msg.isError
                          ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                          : 'bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-100 rounded-tl-sm'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-sm'
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    <div
                      className={`flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] border-t ${
                        isBot
                          ? 'border-neutral-200/50 dark:border-neutral-700/50 text-neutral-400 dark:text-neutral-400'
                          : 'border-white/20 text-indigo-100'
                      }`}
                    >
                      <span>{msg.timestamp}</span>

                      {/* Action buttons on bot messages */}
                      {isBot && !msg.isError && (
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            title="Copy response"
                            className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          {onAddTaskFromChat && (
                            <button
                              onClick={() => {
                                // Extract first line or summary as a quick task
                                const firstLine = msg.text.split('\n')[0].replace(/^[#*-\d.\s]+/, '').slice(0, 60);
                                if (firstLine) {
                                  onAddTaskFromChat(firstLine, msg.text);
                                }
                              }}
                              title="Turn response into a TaskFlow task"
                              className="flex items-center gap-1 p-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Add Task</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0 mb-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 border border-neutral-200/50 dark:border-neutral-700/50">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-neutral-50/70 dark:bg-neutral-900/60 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Suggested Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="text-left text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask n8n assistant or type a task question..."
                  rows={1}
                  className="w-full resize-none max-h-28 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 px-1">
              <span>Press Enter to send · Shift+Enter for newline</span>
              <a
                href={DEFAULT_N8N_WEBHOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-500 flex items-center gap-0.5"
              >
                <span>n8n Cloud</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_N8N_WEBHOOK_URL =
  'https://tejaswinigatta.app.n8n.cloud/webhook/c215f943-5669-43fa-996a-b5d18aafd339/chat';

const WEBHOOK_STORAGE_KEY = 'taskflow_n8n_webhook_url';
const SESSION_STORAGE_KEY = 'taskflow_n8n_session_id';
const CHAT_HISTORY_STORAGE_KEY = 'taskflow_n8n_chat_history';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export interface TaskContextSummary {
  totalTasks: number;
  pendingCount: number;
  completedCount: number;
  todayCount: number;
  urgentCount: number;
  pendingTitles?: string[];
}

export function getN8nWebhookUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_N8N_WEBHOOK_URL;
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || DEFAULT_N8N_WEBHOOK_URL;
}

export function setN8nWebhookUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = url.trim();
  if (trimmed) {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY);
  }
}

export function resetN8nWebhookUrl(): string {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WEBHOOK_STORAGE_KEY);
  }
  return DEFAULT_N8N_WEBHOOK_URL;
}

export function getN8nSessionId(): string {
  if (typeof window === 'undefined') return 'session_default';
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

export function resetN8nSessionId(): string {
  const newSessionId = 'session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
  }
  return newSessionId;
}

export function loadSavedChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep max 50 recent messages to prevent storage bloat
    const trimmed = messages.slice(-50);
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
}

export function clearSavedChatHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
}

/**
 * Sends a message to the n8n Chat Trigger Webhook.
 * Format adheres to n8n Chat trigger standard:
 * POST with body: { action: "sendMessage", chatInput: message, sessionId }
 */
export async function sendN8nChatMessage(
  message: string,
  context?: TaskContextSummary
): Promise<string> {
  const webhookUrl = getN8nWebhookUrl();
  const sessionId = getN8nSessionId();

  // If task context is provided and relevant, enrich the chatInput or include metadata
  let formattedInput = message.trim();
  if (context && (message.toLowerCase().includes('task') || message.toLowerCase().includes('todo') || message.toLowerCase().includes('schedule') || message.toLowerCase().includes('priorit'))) {
    // Helpful context tag
    const contextNote = `[TaskFlow Context: ${context.pendingCount} pending, ${context.completedCount} completed, ${context.todayCount} due today, ${context.urgentCount} urgent/high. Pending sample: ${(context.pendingTitles || []).slice(0, 5).join(', ')}]`;
    formattedInput = `${formattedInput}\n\n${contextNote}`;
  }

  const payload = {
    action: 'sendMessage',
    chatInput: formattedInput,
    sessionId: sessionId,
    metadata: {
      source: 'TaskFlow Web App',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `n8n webhook responded with status ${response.status}: ${errorText || response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();

      // Extract output based on typical n8n AI Chat response structure
      if (typeof data.output === 'string') return data.output;
      if (typeof data.text === 'string') return data.text;
      if (typeof data.response === 'string') return data.response;
      if (typeof data.message === 'string') return data.message;
      if (Array.isArray(data) && data[0]?.output) return data[0].output;
      if (Array.isArray(data) && data[0]?.json?.output) return data[0].json.output;
      return JSON.stringify(data, null, 2);
    } else {
      const text = await response.text();
      return text || 'Message received by n8n workflow.';
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Failed to communicate with n8n chatbot webhook:', err);
    throw new Error(
      err.message || 'Unable to connect to n8n chat webhook. Please check your network or workflow activation.'
    );
  }
}

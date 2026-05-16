const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}`, 'token': token } : {};
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export interface ChatMessageDTO {
  role: string;
  content: string;
  createTime: string;
}

export interface ChatHistoryVO {
  role: string;
  content: string;
  createTime: string;
}

export interface ChatSummaryVO {
  id: number;
  summary: string;
  messageCount: number;
  createTime: string;
}

export interface ChatHistoryFullVO {
  summaries: ChatSummaryVO[];
  messages: ChatHistoryVO[];
}

export function streamChat(message: string, callbacks: StreamCallbacks): AbortController {
  const controller = new AbortController();

  fetch(`${BASE_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  }).then(async (response) => {
    console.log('[SSE] 响应状态:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('浏览器不支持流式读取');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const match = line.match(/^data:\s?(.*)$/);
          const data = match ? match[1] : '';
          console.log('[SSE] raw(%d) → data(%d):', line.length, data.length, data);
          if (data === '[DONE]' || data === '') continue;
          callbacks.onChunk(data);
        }
      }
    }

    callbacks.onDone();
  }).catch((err) => {
    console.error('[SSE] 错误:', err);
    if (err.name === 'AbortError') return;
    callbacks.onError(err);
  });

  return controller;
}

export function recognizeFood(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', '0');
  return fetch(`${BASE_URL}/ai/recognize`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  }).then(res => res.json());
}

export function saveMessages(messages: ChatMessageDTO[]) {
  return fetch(`${BASE_URL}/ai/chat/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(messages),
  }).then(res => res.json());
}

export function loadHistory(limit = 50): Promise<ChatHistoryFullVO> {
  return fetch(`${BASE_URL}/ai/chat/history?limit=${limit}`, {
    headers: authHeaders(),
  }).then(res => res.json()).then(data => data.data);
}

export function loadSummaries(): Promise<ChatSummaryVO[]> {
  return fetch(`${BASE_URL}/ai/chat/summaries`, {
    headers: authHeaders(),
  }).then(res => res.json()).then(data => data.data);
}

export function clearHistory() {
  return fetch(`${BASE_URL}/ai/chat/clear`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(res => res.json());
}

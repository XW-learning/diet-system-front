const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export function streamChat(message: string, callbacks: StreamCallbacks): AbortController {
  const controller = new AbortController();
  const token = getToken();

  fetch(`${BASE_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}`, 'token': token } : {}),
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
  // userId 由后端从 JWT 获取，但当前 recognizeImage 接口仍需传 userId 参数
  // 暂且兼容传 0，后端会处理
  formData.append('userId', '0');
  return fetch(`${BASE_URL}/ai/recognize`, {
    method: 'POST',
    headers: {
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}`, 'token': getToken()! } : {}),
    },
    body: formData,
  }).then(res => res.json());
}

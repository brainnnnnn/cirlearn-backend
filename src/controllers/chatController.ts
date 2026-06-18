import { Request, Response, NextFunction } from 'express';
import { ChatRequest } from '../types';
import { streamChat } from '../services/chatService';

const enc = new TextEncoder();

function ndjson(obj: object): Uint8Array {
  return enc.encode(JSON.stringify(obj) + '\n');
}

export async function chatController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const request = req.body as ChatRequest;
  const subject = request.subjectOverride ?? 'chinese';

  try {
    const llmResponse = await streamChat(request);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!llmResponse.ok || !llmResponse.body) {
      const text = await llmResponse.text().catch(() => `API error ${llmResponse.status}`);
      res.write(ndjson({ t: 'err', v: text }));
      res.end();
      return;
    }

    const isAnthropic = !request.baseURL && request.apiKey.startsWith('sk-ant-');
    const reader = llmResponse.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;

          let json: Record<string, unknown>;
          try {
            json = JSON.parse(data);
          } catch {
            continue;
          }

          const text = extractTextFromChunk(json, isAnthropic);
          if (text) {
            const normalized = normalizeEnglishHeadings(text, subject);
            res.write(ndjson({ t: 'tx', v: normalized }));
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.write(ndjson({ t: 'err', v: msg }));
    } finally {
      reader.releaseLock();
    }

    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
}

function extractTextFromChunk(json: Record<string, unknown>, isAnthropic: boolean): string | undefined {
  if (isAnthropic) {
    if (json.type === 'content_block_delta') {
      const delta = json.delta as Record<string, unknown> | undefined;
      if (delta?.type === 'text_delta') {
        return String(delta.text ?? '');
      }
    }
    return undefined;
  }

  const choices = json.choices as Array<Record<string, unknown>> | undefined;
  if (!choices) return undefined;
  const choice = choices[0];
  if (!choice) return undefined;
  const delta = (choice.delta ?? {}) as Record<string, unknown>;
  return typeof delta.content === 'string' ? delta.content : undefined;
}

function normalizeEnglishHeadings(text: string, subject: string): string {
  if (subject !== 'english') return text;
  return text.replace(/##\s*拼音/g, '## 音标');
}

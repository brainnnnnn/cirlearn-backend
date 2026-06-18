import { Request, Response, NextFunction } from 'express';
import { VLMRequest, VLMResponse } from '../types';
import { recognizeIntent } from '../services/vlmService';

export async function vlmController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as VLMRequest;
    const data = await recognizeIntent(body);
    const response: VLMResponse = { success: true, data };
    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as NodeJS.ErrnoException).code ?? 'API_ERROR';
    console.error('[VLM Error]', { code, message, timestamp: new Date().toISOString() });
    const response: VLMResponse = { success: false, error: { message, code } };
    res.status(200).json(response);
  }
}

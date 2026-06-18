import { Request, Response, NextFunction } from 'express';

export function validateVLM(req: Request, res: Response, next: NextFunction): void {
  const { image, provider, apiKey } = req.body;
  if (!image || typeof image !== 'string') {
    res.status(400).json({ success: false, error: 'Missing or invalid image' });
    return;
  }
  if (!provider || !['kimi', 'gpt4v'].includes(provider)) {
    res.status(400).json({ success: false, error: 'Missing or invalid provider' });
    return;
  }
  if (!apiKey || typeof apiKey !== 'string') {
    res.status(400).json({ success: false, error: 'Missing apiKey' });
    return;
  }
  next();
}

export function validateChat(req: Request, res: Response, next: NextFunction): void {
  const { messages, model, apiKey } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ success: false, error: 'Invalid messages' });
    return;
  }
  if (!model || typeof model !== 'string') {
    res.status(400).json({ success: false, error: 'Missing or invalid model' });
    return;
  }
  if (!apiKey || typeof apiKey !== 'string') {
    res.status(400).json({ success: false, error: 'Missing apiKey' });
    return;
  }
  next();
}

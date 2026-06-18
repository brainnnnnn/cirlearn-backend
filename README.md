# Cirlearn Backend

圈圈学独立后端服务，基于 Express + TypeScript。

## Endpoints

- `POST /vlm` - 视觉意图识别
- `POST /chat` - 流式学科答疑
- `GET /health` - 健康检查

## Development

```bash
npm install
npm run dev
```

## Environment Variables

- `PORT` - 服务端口，默认 3001
- `NODE_ENV` - 环境，默认 development
- `CORS_ORIGIN` - CORS 来源，默认 *

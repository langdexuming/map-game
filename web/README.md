# map-game-web

小小特工 · 出行特工版 — React + Vite Web 指挥终端，对接 Spring Boot `/api`。

## 本地开发

1. **后端**：仓库当前阶段 **Spring Boot 业务后续实现**；未启动后端时，页面请求 `/api` 会失败并提示加载错误，属正常。
2. 联调时：启动 `server`（默认 `http://127.0.0.1:8080`，`context-path=/api`）后再开前端。
3. 在仓库根：`npm install`，再 `npm run dev:web`（或在本目录 `npm run dev`）。前端请求 `/api` 由 Vite 代理到 8080。

## 生产构建

仓库根：`npm run build:web`，静态文件在 `web/dist`。可用 nginx 托管静态并反代 `/api` 至后端。

可选环境变量见 `.env.example`（`VITE_API_BASE_URL`）。

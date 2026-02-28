# 金融监控（Next.js + Cloudflare Workers）

本项目用于监控黄金等金融品的实时数据并进行规则匹配与通知，基于 Next.js，通过 OpenNext 的 Cloudflare 适配器运行在 Cloudflare Workers 上。

## 技术栈与架构

- Next.js（App Router）
- OpenNext Cloudflare Adapter（运行时在 Cloudflare Workers）
- Cloudflare KV（行情与配置存储）
- Cloudflare D1（规则存储）
- Webhook 通知（触发外部回调）
- 中间件统一鉴权与放行逻辑

核心目录：

- 管理后台与页面：[app](file:///Users/lyy/code/project/gold-watch/app)
- 采集接口：[route.ts](file:///Users/lyy/code/project/gold-watch/src/app/api/cron/collect/route.ts)
- 中间件鉴权：[middleware.ts](file:///Users/lyy/code/project/gold-watch/src/middleware.ts)
- KV 工具方法：[kv.ts](file:///Users/lyy/code/project/gold-watch/src/lib/kv.ts)

## 功能概览

- 实时采集京东黄金价格并写入 KV，供 UI 展示
- 从 D1 加载规则并进行匹配，触发 Webhook 通知
- 记录系统健康状态（采集次数、命中规则数量等）
- 管理后台页面优先 SSR，数据在服务端直接读取

## 本地开发

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

- 页面文件可在 `app/` 下修改，保存后自动热更新
- 采集接口位于 [route.ts](file:///Users/lyy/code/project/gold-watch/src/app/api/cron/collect/route.ts)

## 环境与绑定

- KV 绑定名：`KV_QUOTES`（见 wrangler.jsonc）
- D1 绑定名：`DB`（如果使用 D1，需要在 Cloudflare 侧创建并绑定）
- 可选环境变量：`ADMIN_USER`、`ADMIN_PASS`（用于 Basic Auth 备用方案）
- 变更绑定后建议执行：

```bash
npx wrangler types
```

## API

- 采集接口：`GET /api/cron/collect`
  - 当前中间件已直接放行，无需登录与 Token（见 [middleware.ts](file:///Users/lyy/code/project/gold-watch/src/middleware.ts)）
  - 若需开启 Token 校验，可在中间件中读取 KV 中的 `CRON_TOKEN` 并比对
  - 响应字段：`success`、`executions`、`lastTick`

## 部署到 Cloudflare

```bash
npm run build
npm run deploy
# 查看实时日志
npx wrangler tail
```

- 本项目通过 OpenNext 适配器将 Next.js 构建产物转换为可在 Workers 运行的形态
- 生产环境变更绑定或环境后，务必同步更新并检查运行情况

## 注意事项

- 仓库中不要提交任何密钥或敏感信息
- 管理后台页面（如 `/admin`）优先使用 SSR 并在服务端读取数据
- 文案与文档统一使用简体中文

## 贡献

欢迎提交 Issue 或 PR 来完善功能与文档。

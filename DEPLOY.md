# 部署指南 (Cloudflare Workers + OpenNext)

本项目使用 [OpenNext](https://opennext.js.org/) 将 Next.js 应用部署到 Cloudflare Workers。

## 1. 准备工作

确保你已经安装了以下工具：

- Node.js 18+
- pnpm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`

登录 Cloudflare 账号：

```bash
wrangler login
```

## 2. 创建资源

你需要手动在 Cloudflare 控制台或使用 Wrangler 命令行创建以下资源，并获取它们的 ID。

### D1 数据库 (SQLite)

用于存储规则 (Rules) 和其他结构化数据。

```bash
wrangler d1 create goldwatch-db
```

执行后会返回 `database_id`，请记录下来。

### KV Namespaces

用于缓存行情数据 (Quotes) 和系统状态。

```bash
wrangler kv:namespace create KV_QUOTES
```

执行后会返回 `id`，请记录下来。

### Queues (可选)

如果使用队列功能，需要创建队列。

```bash
wrangler queues create alerts-queue
```

## 3. 配置项目

修改根目录下的 `wrangler.jsonc` 文件，填入上一步获取的 ID。

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "goldwatch-db",
      "database_id": "YOUR_DATABASE_ID", // <--- 填入你的 D1 ID
    },
  ],
  "kv_namespaces": [
    {
      "binding": "KV_QUOTES",
      "id": "YOUR_KV_ID", // <--- 填入你的 KV ID
    },
  ],
  // ... 其他配置保持默认
}
```

## 4. 初始化数据库

在本地应用数据库 Schema（首次部署前执行）：

```bash
wrangler d1 execute goldwatch-db --remote --file=migrations/0000_schema.sql
```

> 注意：如果是在本地开发环境测试，去掉 `--remote` 参数即可应用到本地 D1。

## 5. 设置环境变量 (Secrets)

Webhook 地址等敏感信息**不要**写在代码或 `wrangler.jsonc` 中，请使用 `wrangler secret put` 设置。

```bash
# 飞书 Webhook
wrangler secret put WEBHOOK_FEISHU

# 钉钉 Webhook
wrangler secret put WEBHOOK_DINGTALK

# 企业微信 Webhook
wrangler secret put WEBHOOK_WECOM
```

执行命令后，终端会提示你输入具体的 URL。

## 6. 部署

### 方式一：本地手动部署

构建并部署到 Cloudflare：

```bash
npm run deploy
```

或者手动执行：

```bash
npx @opennextjs/cloudflare
wrangler deploy
```

部署成功后，你会看到访问链接，例如 `https://gold-watch.your-name.workers.dev`。

### 方式二：GitHub Actions 自动部署

1.  将代码推送到 GitHub 仓库。
2.  在 GitHub 仓库的 **Settings -> Secrets and variables -> Actions** 中添加以下 Repository Secrets：
    - `CLOUDFLARE_API_TOKEN`: 你的 Cloudflare API Token (权限需要包含 Workers Scripts/Edit, Workers KV/Edit, D1/Edit)。
    - `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare Account ID。
3.  每次推送到 `main` 分支时，GitHub Actions 会自动触发构建和部署。

## 7. 验证

1. 访问部署后的链接，应该会自动重定向到 `/admin/rules`。
2. 进入“系统设置”或“健康状态”页面（如果保留了的话），检查各项服务是否正常。
3. 手动触发一次价格采集（等待 Cron 自动运行或手动调用 API）。

## 常见问题

- **Cron 任务不执行**：Cloudflare 的 Cron 触发器在部署后可能需要几分钟生效。
- **数据库报错**：确保 `wrangler.jsonc` 中的 binding 名称与代码中 `getCloudflareContext().env.DB` 一致（目前代码中是 `DB`）。
- **样式丢失**：确保构建过程中静态资源正确上传。OpenNext 会自动处理 assets。

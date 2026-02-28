import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getWebhooksFn } from '@/server/webhooks'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/admin/webhooks')({
  component: WebhooksPage,
  loader: () => getWebhooksFn(),
})

function WebhooksPage() {
  const webhooks = Route.useLoaderData()
  const router = useRouter()

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="Webhook管理"
        description="查看系统集成的通知渠道状态"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.invalidate()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>环境变量 Key</TableHead>
                <TableHead>当前配置 (Masked)</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{webhook.envKey}</TableCell>
                  <TableCell className="font-mono text-xs">{webhook.url}</TableCell>
                  <TableCell>
                    {webhook.status === 'active' ? (
                      <Badge
                        variant="default"
                        className="bg-green-600"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> 已配置
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-yellow-600"
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" /> 未配置
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <p className="font-semibold mb-2">如何配置 Webhook?</p>
        <p>请在 Cloudflare Pages 的环境变量设置中添加对应的 Key 值，并填入完整的 Webhook URL。</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            飞书: <code className="bg-background px-1 rounded">WEBHOOK_FEISHU</code>
          </li>
          <li>
            钉钉: <code className="bg-background px-1 rounded">WEBHOOK_DINGTALK</code>
          </li>
          <li>
            企业微信: <code className="bg-background px-1 rounded">WEBHOOK_WECOM</code>
          </li>
        </ul>
      </div>
    </div>
  )
}

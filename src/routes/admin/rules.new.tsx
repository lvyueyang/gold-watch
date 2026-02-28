import { createFileRoute } from '@tanstack/react-router'
import { getWebhooksFn } from '@/server/webhooks'
import { RuleForm } from '@/components/rules/rule-form'

export const Route = createFileRoute('/admin/rules/new')({
  component: NewRulePage,
  loader: () => getWebhooksFn(),
})

function NewRulePage() {
  const webhooks = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">新建规则</h2>
        <p className="text-muted-foreground">创建一个新的价格监控规则</p>
      </div>
      <RuleForm webhooks={webhooks} />
    </div>
  )
}

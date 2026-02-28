import { createFileRoute } from '@tanstack/react-router'
import { getRulesFn } from '@/server/rules'
import { getWebhooksFn } from '@/server/webhooks'
import { RuleForm } from '@/components/rules/rule-form'

export const Route = createFileRoute('/admin/rules/$id')({
  component: EditRulePage,
  loader: async ({ params }) => {
    const [rules, webhooks] = await Promise.all([getRulesFn(), getWebhooksFn()])
    const rule = rules.find((r) => r.id === params.id)
    if (!rule) throw new Error('Rule not found')
    return { rule, webhooks }
  },
})

function EditRulePage() {
  const { rule, webhooks } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">编辑规则</h2>
        <p className="text-muted-foreground">修改规则配置</p>
      </div>
      <RuleForm webhooks={webhooks} initialData={rule} />
    </div>
  )
}

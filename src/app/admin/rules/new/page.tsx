import { PageHeader } from '@/components/common/page-header';
import { RuleForm } from '@/components/rules/rule-form';
import { getWebhooks } from '@/lib/data/webhooks';

// export const runtime = 'edge';

export default async function NewRulePage() {
  const webhooks = await getWebhooks();

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="新建规则"
        description="创建新的价格告警监控规则"
      />
      <RuleForm webhooks={webhooks} />
    </div>
  );
}

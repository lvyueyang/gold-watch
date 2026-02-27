import { PageHeader } from '@/components/common/page-header';
import { RuleForm } from '@/components/rules/rule-form';
import { getWebhooks } from '@/lib/data/webhooks';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { notFound } from 'next/navigation';

// export const runtime = 'edge';

async function getRule(id: string) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    const rule = await db.prepare('SELECT * FROM rules WHERE id = ?').bind(id).first<any>();

    if (!rule) {
      console.error(`Rule fetch failed or not found for ID: ${id}`);
      return null;
    }

    return {
      ...rule,
      params: JSON.parse(rule.params),
    };
  } catch (e) {
    console.error('getRule error:', e);
    return null;
  }
}

export default async function EditRulePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  console.log('Editing Rule ID:', id);

  const [rule, webhooks] = await Promise.all([getRule(id), getWebhooks()]);

  if (!rule) {
    console.error(`Rule not found for ID: ${id}`);
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="编辑规则"
        description={`正在编辑: ${rule.name}`}
      />
      <RuleForm
        webhooks={webhooks}
        initialData={rule}
      />
    </div>
  );
}

import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { createRuleFn, updateRuleFn } from '@/server/rules';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AVAILABLE_INSTRUMENTS } from '@/lib/sources/registry';
import type { WebhookStatus } from '@/lib/data/webhooks';

import type { Rule } from '@/lib/types';

interface RuleFormProps {
  webhooks: WebhookStatus[];
  initialData?: Rule;
}

export function RuleForm({ webhooks, initialData }: RuleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>(initialData?.type || 'touch_up');

  // const activeWebhooks = webhooks.filter((w) => w.status === 'active');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 构建基础数据
    const baseData = {
      name: formData.get('name') as string,
      instrumentId: formData.get('instrumentId') as string,
      type: formData.get('type') as any, // 需要根据实际类型定义
      webhook: formData.get('webhook') as string,
      status: initialData?.status || 'active',
      params: {} as any
    };

    if (type === 'range_out') {
      baseData.params = {
        min: Number(formData.get('min')),
        max: Number(formData.get('max')),
      };
    } else {
      baseData.params = {
        target: Number(formData.get('target')),
      };
    }

    try {
      if (initialData) {
        await updateRuleFn({ 
          data: { ...baseData, id: initialData.id } as Rule 
        });
        toast.success('规则更新成功');
      } else {
        await createRuleFn({ 
          data: baseData as Omit<Rule, 'id' | 'createdAt' | 'updatedAt'> 
        });
        toast.success('规则创建成功');
      }
      
      router.navigate({ to: '/admin/rules' });
      router.invalidate();
    } catch (error) {
      toast.error(initialData ? '更新规则失败' : '创建规则失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">规则名称</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：金价突破500提醒"
                defaultValue={initialData?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrumentId">监控标的</Label>
              <Select
                name="instrumentId"
                defaultValue={initialData?.instrumentId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标的" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_INSTRUMENTS.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} ({inst.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">触发条件</Label>
              <Select
                name="type"
                defaultValue={type}
                onValueChange={setType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="touch_up">向上触碰 (≥)</SelectItem>
                  <SelectItem value="touch_down">向下触碰 (≤)</SelectItem>
                  <SelectItem value="range_out">超出区间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">通知渠道</Label>
              <Select
                name="webhook"
                defaultValue={initialData?.webhook || 'feishu'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {webhooks.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} {w.status === 'inactive' && '(未配置)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-4 text-sm font-medium">参数配置</h4>
            {type === 'range_out' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min">最低价</Label>
                  <Input
                    id="min"
                    name="min"
                    type="number"
                    step="0.01"
                    defaultValue={(initialData?.params as any)?.min}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">最高价</Label>
                  <Input
                    id="max"
                    name="max"
                    type="number"
                    step="0.01"
                    defaultValue={(initialData?.params as any)?.max}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="target">目标价格</Label>
                <Input
                  id="target"
                  name="target"
                  type="number"
                  step="0.01"
                  defaultValue={(initialData?.params as any)?.target}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.history.back()}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存规则'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

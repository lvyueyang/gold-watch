'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AVAILABLE_INSTRUMENTS } from '@/lib/sources/registry';
import { WebhookStatus } from '@/lib/data/webhooks';

import { Rule } from '@/lib/types';

interface RuleFormProps {
  webhooks: WebhookStatus[];
  initialData?: Rule;
}

export function RuleForm({ webhooks, initialData }: RuleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>(initialData?.type || 'touch_up');

  const activeWebhooks = webhooks.filter((w) => w.status === 'active');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      instrumentId: formData.get('instrumentId'),
      type: formData.get('type'),
      webhook: formData.get('webhook'),
      status: initialData?.status || 'active',
    };

    if (initialData) {
      data.id = initialData.id;
    }

    if (type === 'range_out') {
      data.params = {
        min: Number(formData.get('min')),
        max: Number(formData.get('max')),
      };
    } else {
      data.params = {
        target: Number(formData.get('target')),
      };
    }

    try {
      const res = await fetch('/api/rules', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save rule');

      toast.success(initialData ? '规则更新成功' : '规则创建成功');
      router.push('/admin/rules');
      router.refresh();
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
                defaultValue={initialData?.instrumentId || AVAILABLE_INSTRUMENTS[0]?.id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标的" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_INSTRUMENTS.map((inst) => (
                    <SelectItem
                      key={inst.id}
                      value={inst.id}
                    >
                      {inst.name} ({inst.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">触发类型</Label>
              <Select
                name="type"
                value={type}
                onValueChange={setType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="touch_up">上涨至 (Touch Up)</SelectItem>
                  <SelectItem value="touch_down">下跌至 (Touch Down)</SelectItem>
                  <SelectItem value="range_out">超出区间 (Range Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">通知渠道</Label>
              <Select
                name="webhook"
                defaultValue={initialData?.webhook}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择通知渠道" />
                </SelectTrigger>
                <SelectContent>
                  {activeWebhooks.length === 0 ? (
                    <SelectItem
                      value="none"
                      disabled
                    >
                      无可用渠道 (请先配置环境变量)
                    </SelectItem>
                  ) : (
                    activeWebhooks.map((wh) => (
                      <SelectItem
                        key={wh.id}
                        value={wh.id}
                      >
                        {wh.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">参数配置</h3>

            {type === 'range_out' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min">最低价</Label>
                  <Input
                    id="min"
                    name="min"
                    type="number"
                    step="0.01"
                    defaultValue={initialData?.params.min}
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
                    defaultValue={initialData?.params.max}
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
                  defaultValue={initialData?.params.target}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? '保存修改' : '创建规则'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

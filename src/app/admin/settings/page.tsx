'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [interval, setInterval] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data: any) => setInterval(data.interval || 20));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: Number(interval) }),
      });
      if (res.ok) {
        toast.success('设置已保存');
      } else {
        toast.error('保存失败');
      }
    } catch (e) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="系统设置"
        description="系统配置与偏好设置"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Rule Defaults */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>采集配置</CardTitle>
            </div>
            <CardDescription>控制数据采集的频率。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval">采集间隔 (秒)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="5"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                />
                <p className="text-[0.8rem] text-muted-foreground">定时任务触发频率，默认为 20 秒。</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存更改'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

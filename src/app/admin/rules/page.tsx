import { CheckCircle2, Clock, PauseCircle, PlayCircle, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getRules } from '@/lib/data/rules';
import { RuleActions } from '@/components/rules/rule-actions';

// export const runtime = 'edge';

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="规则管理"
        description="配置告警触发条件"
      >
        <div className="flex items-center space-x-2">
          <Button asChild>
            <a href="/admin/rules/new">
              <Plus className="mr-2 h-4 w-4" /> 新建规则
            </a>
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>标的</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>参数</TableHead>
                <TableHead>Webhook</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最近触发</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center"
                  >
                    暂无规则。
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.instrumentId}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {rule.type === 'touch_up' && '上涨至'}
                        {rule.type === 'touch_down' && '下跌至'}
                        {rule.type === 'range_out' && '超出区间'}
                        {!['touch_up', 'touch_down', 'range_out'].includes(rule.type) && rule.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {JSON.stringify(rule.params)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground max-w-[150px] truncate">
                      {rule.webhook}
                    </TableCell>
                    <TableCell>
                      {rule.status === 'active' ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> 启用
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <PauseCircle className="mr-1 h-3 w-3" /> 暂停
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleString('zh-CN') : '从未'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <RuleActions rule={rule} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

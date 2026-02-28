import { createFileRoute, Link } from '@tanstack/react-router'
import { getRulesFn } from '@/server/rules'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RuleActions } from '@/components/rules/rule-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AVAILABLE_INSTRUMENTS } from '@/lib/sources/registry'

export const Route = createFileRoute('/admin/rules/')({
  component: RulesPage,
  loader: () => getRulesFn(),
})

function RulesPage() {
  const rules = Route.useLoaderData()

  const getInstrumentName = (id: string) => {
    return AVAILABLE_INSTRUMENTS.find((i) => i.id === id)?.name || id
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">监控规则</h2>
          <p className="text-muted-foreground">管理所有的价格监控规则</p>
        </div>
        <Link to="/admin/rules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建规则
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>标的</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>参数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  暂无规则
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{getInstrumentName(rule.instrumentId)}</TableCell>
                  <TableCell>
                    {rule.type === 'touch_up' && '向上触碰'}
                    {rule.type === 'touch_down' && '向下触碰'}
                    {rule.type === 'range_out' && '超出区间'}
                  </TableCell>
                  <TableCell>
                    {rule.type === 'range_out' ? (
                      <span>
                        {(rule.params as any).min} ~ {(rule.params as any).max}
                      </span>
                    ) : (
                      <span>{(rule.params as any).target}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        rule.status === 'active'
                          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                          : 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                      }`}
                    >
                      {rule.status === 'active' ? '运行中' : '已暂停'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RuleActions rule={rule} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

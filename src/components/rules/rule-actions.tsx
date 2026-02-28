import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { MoreHorizontal, Trash2, PauseCircle, PlayCircle, Pencil } from 'lucide-react';
import { updateRuleStatusFn, deleteRuleFn } from '@/server/rules';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Rule } from '@/lib/types';

interface RuleActionsProps {
  rule: Rule;
}

export function RuleActions({ rule }: RuleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = rule.status === 'active' ? 'inactive' : 'active';
      await updateRuleStatusFn({ data: { id: rule.id, status: newStatus } });

      toast.success(newStatus === 'active' ? '规则已恢复' : '规则已暂停');
      router.invalidate();
    } catch (e) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async () => {
    if (!confirm('确定要删除这条规则吗？')) return;

    setLoading(true);
    try {
      await deleteRuleFn({ data: { id: rule.id } });

      toast.success('规则已删除');
      router.invalidate();
    } catch (e) {
      toast.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={loading}
        >
          <span className="sr-only">打开菜单</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => router.navigate({ to: `/admin/rules/${rule.id}` })}>
          <Pencil className="mr-2 h-4 w-4" /> 编辑
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleStatus}>
          {rule.status === 'active' ? (
            <>
              <PauseCircle className="mr-2 h-4 w-4" /> 暂停
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" /> 恢复
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={deleteRule}
        >
          <Trash2 className="mr-2 h-4 w-4" /> 删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

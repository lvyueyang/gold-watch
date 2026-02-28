import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Play, Pause } from 'lucide-react';
import { toggleInstrumentStatusFn } from '@/server/instruments';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { InstrumentWithRules } from '@/lib/data/instruments';

interface InstrumentActionsProps {
  instrument: InstrumentWithRules;
}

export function InstrumentActions({ instrument }: InstrumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = instrument.status === 'active' ? false : true;
      await toggleInstrumentStatusFn({ data: { id: instrument.id, active: newStatus } });

      toast.success(newStatus ? '监控已启用' : '监控已暂停');
      router.invalidate();
    } catch (e) {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleStatus}
              disabled={loading}
            >
              {instrument.status === 'active' ? (
                <Pause className="h-4 w-4 text-yellow-600" />
              ) : (
                <Play className="h-4 w-4 text-green-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {instrument.status === 'active' ? '暂停监控' : '启用监控'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

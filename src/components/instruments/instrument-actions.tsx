'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import { Instrument } from '@/lib/types';

interface InstrumentActionsProps {
  instrument: Instrument;
}

export function InstrumentActions({ instrument }: InstrumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async (checked: boolean) => {
    setLoading(true);
    // checked = true means we want to active it
    const isActive = checked;

    try {
      const res = await fetch('/api/instruments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: instrument.id, active: isActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(isActive ? '监控已恢复' : '监控已暂停');
      router.refresh();
    } catch (e) {
      toast.error('操作失败');
      // Revert switch state if needed, but since we rely on router.refresh(),
      // the UI will eventually reflect the server state.
      // For optimistic update, we might need local state, but simple is fine here.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Switch
        checked={instrument.status === 'active'}
        onCheckedChange={toggleStatus}
        disabled={loading}
      />
    </div>
  );
}

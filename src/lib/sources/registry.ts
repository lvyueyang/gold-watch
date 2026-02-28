import type { Instrument } from '@/lib/types';

// 定义标的的静态配置
// 作为代码支持哪些标的的唯一事实来源
export const AVAILABLE_INSTRUMENTS: Omit<Instrument, 'status'>[] = [
  {
    id: 'JD-GOLD-CNY',
    symbol: 'JD-GOLD',
    name: '浙商积存金',
    precision: 2,
  },
  // 未来可以在此添加更多适配器
];

export function getInstrumentConfig(id: string) {
  return AVAILABLE_INSTRUMENTS.find((i) => i.id === id);
}

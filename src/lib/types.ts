export interface PriceTick {
  instrumentId: string;
  price: number;
  ts: number;
  source: string;
  change?: number;
  changePct?: number;
}

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  precision: number;
  status: 'active' | 'paused';
}

export interface Quote extends PriceTick {
  symbol: string;
  name: string;
  updatedAt: string; // formatted
  latency: number; // ms
}

export type RuleType = 'touch_up' | 'touch_down' | 'range_out';

export interface Rule {
  id: string;
  name: string;
  instrumentId: string;
  type: RuleType;
  params: {
    target?: number; // for touch
    min?: number; // for range
    max?: number; // for range
  };
  webhook: string;
  status: 'active' | 'inactive';
  lastTriggeredAt?: number;
  createdAt: number;
  updatedAt: number;
}

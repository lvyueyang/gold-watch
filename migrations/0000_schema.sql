-- Gold Watch Database Schema
-- Last updated: 2024-05-24

-- 规则表 (Rules)
-- 存储告警触发条件，关联代码中硬编码的标的 (Instruments)
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instrumentId TEXT NOT NULL, -- 关联硬编码的标的 ID
  type TEXT NOT NULL,         -- 规则类型: touch_up, touch_down, range_out
  params TEXT NOT NULL,       -- JSON 参数: { target: 1140, min: 1130, max: 1150 }
  webhook TEXT NOT NULL,      -- Webhook URL
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  lastTriggeredAt INTEGER,    -- 上次触发时间戳
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_rules_instrument ON rules(instrumentId);
CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);

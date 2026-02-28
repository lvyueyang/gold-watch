import type { PriceTick, Rule } from "@/lib/types";

export function matchRules(tick: PriceTick, rules: Rule[]): Rule[] {
	return rules.filter((rule) => {
		if (rule.status !== "active") return false;
		if (rule.instrumentId !== tick.instrumentId) return false;

		// TODO: Add cooldown logic (lastTriggeredAt)

		const price = tick.price;

		switch (rule.type) {
			case "touch_up":
				return rule.params.target !== undefined && price >= rule.params.target;

			case "touch_down":
				return rule.params.target !== undefined && price <= rule.params.target;

			case "range_out":
				return (
					(rule.params.min !== undefined && price < rule.params.min) ||
					(rule.params.max !== undefined && price > rule.params.max)
				);

			default:
				return false;
		}
	});
}

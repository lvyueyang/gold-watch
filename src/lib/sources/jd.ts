import { updateSourceHealth } from "@/lib/kv";
import type { PriceTick } from "@/lib/types";

// 浙商积存金 SKU
const JD_GOLD_SKU = "1961543816";
const JD_GOLD_URL = `https://api.jdjygold.com/gw2/generic/jrm/h5/m/stdLatestPrice?productSku=${JD_GOLD_SKU}`;

interface JdGoldResponse {
	resultData: {
		datas: {
			upAndDownRate: string; // e.g. "-0.23%"
			price: string; // e.g. "1144.57"
			yesterdayPrice: string; // e.g. "1147.17"
			upAndDownAmt: string; // e.g. "-2.60"
			time: string; // e.g. "1772083174000"
		};
		status: string;
	};
	success: boolean;
}

export async function fetchJdGold(): Promise<PriceTick | null> {
	try {
		const res = await fetch(JD_GOLD_URL, {
			method: "GET",
			headers: {
				"User-Agent": "GoldWatch/1.0",
			},
			cache: "no-store", // Disable caching
		});

		if (!res.ok) {
			console.error("Failed to fetch JD Gold:", res.statusText);
			await updateSourceHealth("JD", false);
			return null;
		}

		const data: JdGoldResponse = await res.json();

		if (!data.success || data.resultData.status !== "SUCCESS") {
			console.error("JD Gold API error:", data);
			await updateSourceHealth("JD", false);
			return null;
		}

		const item = data.resultData.datas;
		const price = parseFloat(item.price);
		const change = parseFloat(item.upAndDownAmt);
		// Remove % and convert to decimal ratio (e.g. -0.23 -> -0.0023)
		const changePct = parseFloat(item.upAndDownRate.replace("%", "")) / 100;
		const ts = parseInt(item.time);

		await updateSourceHealth("JD", true);

		return {
			instrumentId: "JD-GOLD-CNY", // Use a fixed ID for now or map it
			price,
			ts,
			source: "JD",
			change,
			changePct,
		};
	} catch (error) {
		console.error("Error fetching JD Gold:", error);
		await updateSourceHealth("JD", false);
		return null;
	}
}

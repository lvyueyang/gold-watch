import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getInstruments } from "../lib/data/instruments";
import { toggleInstrumentStatus } from "../lib/kv";

export const getInstrumentsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getInstruments();
	},
);

const toggleSchema = z.object({ id: z.string(), active: z.boolean() });

export const toggleInstrumentStatusFn = createServerFn({
	method: "POST",
}).handler(async (ctx: any) => {
	const data = ctx.data;
	await toggleInstrumentStatus(data.id, data.active);
	return { success: true };
});

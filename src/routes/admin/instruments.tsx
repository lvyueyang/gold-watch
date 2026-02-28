import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InstrumentActions } from "@/components/instruments/instrument-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { collectDataFn } from "@/server/collect";
import { getInstrumentsFn } from "@/server/instruments";

export const Route = createFileRoute("/admin/instruments")({
	component: InstrumentsPage,
	loader: () => getInstrumentsFn(),
});

function InstrumentsPage() {
	const instruments = Route.useLoaderData();
	const router = useRouter();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			const res = await collectDataFn();
			if (res.success) {
				toast.success("数据采集成功");
				router.invalidate();
			} else {
				toast.error("采集失败: " + res.error);
			}
		} catch (e) {
			toast.error("请求失败");
			console.error(e);
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<div className="flex-1 space-y-4 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">标的管理</h2>
					<p className="text-muted-foreground">管理监控目标</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						{isRefreshing ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-0">
					<div className="flex items-center py-4 px-4">
						<div className="relative w-full max-w-sm">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input placeholder="搜索标的..." className="pl-8" />
						</div>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>代码 (Symbol)</TableHead>
								<TableHead>名称</TableHead>
								<TableHead>状态</TableHead>
								<TableHead className="text-right">最新价</TableHead>
								<TableHead>最后更新</TableHead>
								<TableHead className="text-center">规则数</TableHead>
								<TableHead className="text-right">操作</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{instruments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="h-24 text-center">
										未找到结果。
									</TableCell>
								</TableRow>
							) : (
								instruments.map((inst) => (
									<TableRow key={inst.id}>
										<TableCell className="font-medium">{inst.symbol}</TableCell>
										<TableCell>{inst.name}</TableCell>
										<TableCell>
											<Badge
												variant={
													inst.status === "active" ? "default" : "secondary"
												}
											>
												{inst.status === "active" ? "监控中" : "已暂停"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											{inst.lastPrice.toFixed(inst.precision)}
										</TableCell>
										<TableCell>{inst.updatedAt}</TableCell>
										<TableCell className="text-center">
											<Badge variant="outline">{inst.rulesCount}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<InstrumentActions instrument={inst} />
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

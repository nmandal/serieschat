"use client";

import { Activity, ChevronDown, Star, TrendingUp, Tv, ThumbsUp } from "lucide-react";
import type { ReactElement } from "react";
import { useMemo, useState, useRef } from "react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
	CATEGORY_COLORS,
	getSeasonColor,
	SEMANTIC_COLORS,
} from "./imdb-design-tokens";

type Episode = {
	season: number;
	episode: number;
	title: string;
	rating: number;
	votes: number;
	tconst: string;
	episode_index: number;
};

type Season = {
	season: number;
	episode_count: number;
	avg_rating: number;
	start_index: number;
	end_index: number;
	trendline: {
		slope: number;
		intercept: number;
	};
};

type EpisodeGraphData = {
	series: string;
	tconst: string;
	scale: string;
	episodes: Episode[];
	seasons: Season[];
	overall_trendline: {
		slope: number;
		intercept: number;
	};
	rating_range: {
		min: number;
		max: number;
	};
};

type ScaleMode = "auto" | "0-10" | "autoscale";

export function ImdbEpisodeGraph({
	data,
}: {
	data: EpisodeGraphData;
}): ReactElement {
	const colors = CATEGORY_COLORS.series;
	const allSeasonNumbers = data.seasons.map((s) => s.season);

	const [visibleSeasons, setVisibleSeasons] = useState<Set<number>>(
		new Set(allSeasonNumbers),
	);
	const [scaleMode, setScaleMode] = useState<ScaleMode>("auto");
	const [showTrendline, setShowTrendline] = useState(false);
	const [hoveredEpisode, setHoveredEpisode] = useState<Episode | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const svgRef = useRef<SVGSVGElement>(null);

	const toggleSeason = (season: number) => {
		const newVisible = new Set(visibleSeasons);
		if (newVisible.has(season)) {
			newVisible.delete(season);
		} else {
			newVisible.add(season);
		}
		setVisibleSeasons(newVisible);
	};

	const visibleEpisodes = useMemo(
		() => data.episodes.filter((ep) => visibleSeasons.has(ep.season)),
		[data.episodes, visibleSeasons],
	);

	const { minY, maxY, yRange } = useMemo(() => {
		if (visibleEpisodes.length === 0) {
			return { minY: 0, maxY: 10, yRange: 10 };
		}

		const ratings = visibleEpisodes.map((ep) => ep.rating);
		const minRating = Math.min(...ratings);
		const maxRating = Math.max(...ratings);

		let min: number;
		let max: number;

		switch (scaleMode) {
			case "0-10":
				min = 0;
				max = 10;
				break;
			case "autoscale":
				min = Math.max(0, minRating - 0.2);
				max = Math.min(10, maxRating + 0.2);
				break;
			case "auto":
			default:
				// Smart range: use floor/ceiling with some padding
				min = Math.max(0, Math.floor(minRating) - 0.5);
				max = Math.min(10, Math.ceil(maxRating) + 0.5);
				break;
		}

		return { minY: min, maxY: max, yRange: max - min };
	}, [visibleEpisodes, scaleMode]);

	// SVG dimensions
	const chartWidth = 800;
	const chartHeight = 400;
	const padding = { top: 20, right: 60, bottom: 40, left: 50 };
	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = chartHeight - padding.top - padding.bottom;

	// Find best and worst episodes
	const bestEpisode = useMemo(
		() =>
			visibleEpisodes.length > 0
				? visibleEpisodes.reduce((best, ep) =>
						ep.rating > best.rating ? ep : best,
					)
				: null,
		[visibleEpisodes],
	);

	const worstEpisode = useMemo(
		() =>
			visibleEpisodes.length > 0
				? visibleEpisodes.reduce((worst, ep) =>
						ep.rating < worst.rating ? ep : worst,
					)
				: null,
		[visibleEpisodes],
	);

	// Scale functions
	const scaleX = (index: number) =>
		padding.left +
		(index / Math.max(1, data.episodes.length - 1)) * innerWidth;

	const scaleY = (rating: number) =>
		padding.top +
		innerHeight -
		((rating - minY) / Math.max(0.1, yRange)) * innerHeight;

	// Season colors for trendlines and markers
	const seasonColors = [
		{ line: "#8b5cf6", fill: "#8b5cf6", name: "violet" }, // Season 1
		{ line: "#3b82f6", fill: "#3b82f6", name: "blue" },   // Season 2
		{ line: "#10b981", fill: "#10b981", name: "green" },  // Season 3
		{ line: "#f59e0b", fill: "#f59e0b", name: "amber" },  // Season 4
		{ line: "#ef4444", fill: "#ef4444", name: "red" },    // Season 5
	];

	// Generate per-season trendlines
	const seasonTrendlines = useMemo(() => {
		return data.seasons
			.filter((s) => visibleSeasons.has(s.season))
			.map((season) => {
				const { slope, intercept } = season.trendline;
				const y1 = slope * season.start_index + intercept;
				const y2 = slope * season.end_index + intercept;
				
				return {
					season: season.season,
					path: `M ${scaleX(season.start_index)} ${scaleY(y1)} L ${scaleX(season.end_index)} ${scaleY(y2)}`,
					color: seasonColors[(season.season - 1) % seasonColors.length],
				};
			});
	}, [data.seasons, visibleSeasons, minY, maxY]);

	// Generate overall trendline path
	const overallTrendlinePath = useMemo(() => {
		if (!showTrendline || visibleEpisodes.length === 0) return "";

		const { slope, intercept } = data.overall_trendline;
		const firstIndex = 0;
		const lastIndex = data.episodes.length - 1;

		const y1 = slope * firstIndex + intercept;
		const y2 = slope * lastIndex + intercept;

		return `M ${scaleX(firstIndex)} ${scaleY(y1)} L ${scaleX(lastIndex)} ${scaleY(
			y2,
		)}`;
	}, [showTrendline, data, minY, maxY]);

	// Function to render different shapes for each season
	const renderSeasonMarker = (
		ep: Episode,
		isHovered: boolean,
		isBest: boolean,
		isWorst: boolean,
	) => {
		const cx = scaleX(ep.episode_index);
		const cy = scaleY(ep.rating);
		const size = isHovered ? 7 : 4.5;
		const seasonColor = seasonColors[(ep.season - 1) % seasonColors.length];
		const fill = isBest ? "#22c55e" : isWorst ? "#ef4444" : seasonColor.fill;

		// Different shapes for different seasons
		const seasonShapes = [
			// Season 1: Circle
			() => (
				<circle
					cx={cx}
					cy={cy}
					fill={fill}
					pointerEvents="none"
					r={size}
					stroke="white"
					strokeWidth={isHovered ? 2.5 : 1.5}
				/>
			),
			// Season 2: Diamond
			() => {
				const points = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
				return (
					<polygon
						fill={fill}
						pointerEvents="none"
						points={points}
						stroke="white"
						strokeWidth={isHovered ? 2.5 : 1.5}
					/>
				);
			},
			// Season 3: Square
			() => (
				<rect
					fill={fill}
					height={size * 2}
					pointerEvents="none"
					stroke="white"
					strokeWidth={isHovered ? 2.5 : 1.5}
					width={size * 2}
					x={cx - size}
					y={cy - size}
				/>
			),
			// Season 4: Triangle (up)
			() => {
				const points = `${cx},${cy - size} ${cx + size},${cy + size} ${cx - size},${cy + size}`;
				return (
					<polygon
						fill={fill}
						pointerEvents="none"
						points={points}
						stroke="white"
						strokeWidth={isHovered ? 2.5 : 1.5}
					/>
				);
			},
			// Season 5: Triangle (down)
			() => {
				const points = `${cx},${cy + size} ${cx + size},${cy - size} ${cx - size},${cy - size}`;
				return (
					<polygon
						fill={fill}
						pointerEvents="none"
						points={points}
						stroke="white"
						strokeWidth={isHovered ? 2.5 : 1.5}
					/>
				);
			},
		];

		const ShapeComponent = seasonShapes[(ep.season - 1) % seasonShapes.length];
		return <ShapeComponent />;
	};

	// Y-axis labels
	const yAxisLabels = useMemo(() => {
		const numLabels = 5;
		const labels: number[] = [];

		for (let i = 0; i <= numLabels; i++) {
			labels.push(minY + (i * yRange) / numLabels);
		}

		return labels;
	}, [minY, yRange]);

	// Handle mouse move for tooltip positioning
	const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>, ep: Episode) => {
		const svg = svgRef.current;
		if (!svg) return;

		const rect = svg.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		setTooltipPos({ x, y });
		setHoveredEpisode(ep);
	};

	const handleMouseLeave = () => {
		setHoveredEpisode(null);
	};

	return (
		<div className="w-full space-y-3">
			<Card>
				<div className="flex items-center gap-3 border-b p-4">
					<Tv className={`size-5 ${colors.icon}`} />
					<div className="flex-1">
						<h3 className="font-semibold text-lg">Episode Ratings Graph</h3>
						<p className="text-muted-foreground text-sm">{data.series}</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">
							{data.episodes.length} episodes
						</Badge>
						<Badge variant="secondary">{data.seasons.length} seasons</Badge>
					</div>
				</div>

				{/* Controls */}
				<div className="space-y-3 border-b p-4">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-sm">Seasons:</span>
						{data.seasons.map((season) => {
							const isVisible = visibleSeasons.has(season.season);
							return (
								<button
									className={`rounded-md px-3 py-1 text-sm transition-colors ${
										isVisible
											? colors.badge
											: "bg-muted text-muted-foreground hover:bg-muted/80"
									}`}
									key={season.season}
									onClick={() => toggleSeason(season.season)}
									type="button"
								>
									S{season.season}
								</button>
							);
						})}
						{allSeasonNumbers.length > 1 && (
							<button
								className="ml-2 rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/80"
								onClick={() => {
									if (visibleSeasons.size === allSeasonNumbers.length) {
										setVisibleSeasons(new Set());
									} else {
										setVisibleSeasons(new Set(allSeasonNumbers));
									}
								}}
								type="button"
							>
								{visibleSeasons.size === allSeasonNumbers.length
									? "Hide All"
									: "Show All"}
							</button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-sm">Scale:</span>
						{(["auto", "0-10", "autoscale"] as ScaleMode[]).map((mode) => (
							<button
								className={`rounded-md px-3 py-1 text-sm transition-colors ${
									scaleMode === mode
										? colors.badge
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
								key={mode}
								onClick={() => setScaleMode(mode)}
								type="button"
							>
								{mode === "0-10"
									? "0-10"
									: mode.charAt(0).toUpperCase() + mode.slice(1)}
							</button>
						))}

						<div className="ml-4 flex items-center gap-2">
							<button
								className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm transition-colors ${
									showTrendline
										? colors.badge
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
								onClick={() => setShowTrendline(!showTrendline)}
								type="button"
							>
								<Activity className="size-3" />
								Trendline
							</button>
						</div>
					</div>
				</div>

				{/* Chart */}
				<div className="p-4">
					{visibleEpisodes.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-muted-foreground">
								No episodes selected. Enable at least one season above.
							</p>
						</div>
					) : (
						<div className="relative overflow-x-auto">
							<svg
								className="mx-auto"
								height={chartHeight}
								ref={svgRef}
								width={chartWidth}
							>
								{/* Season background bands */}
								{data.seasons
									.filter((s) => visibleSeasons.has(s.season))
									.map((season, idx) => (
										<rect
											fill={getSeasonColor(idx)}
											height={innerHeight}
											key={season.season}
											width={
												((season.end_index - season.start_index + 1) /
													data.episodes.length) *
												innerWidth
											}
											x={scaleX(season.start_index)}
											y={padding.top}
										/>
									))}

								{/* Y-axis */}
								<line
									stroke="currentColor"
									strokeWidth={1}
									x1={padding.left}
									x2={padding.left}
									y1={padding.top}
									y2={chartHeight - padding.bottom}
								/>

								{/* Y-axis labels */}
								{yAxisLabels.map((label) => (
									<g key={label}>
										<line
											opacity={0.2}
											stroke="currentColor"
											strokeDasharray="2,2"
											x1={padding.left}
											x2={chartWidth - padding.right}
											y1={scaleY(label)}
											y2={scaleY(label)}
										/>
										<text
											className="text-xs"
											fill="currentColor"
											textAnchor="end"
											x={padding.left - 10}
											y={scaleY(label) + 4}
										>
											{label.toFixed(1)}
										</text>
									</g>
								))}

								{/* X-axis */}
								<line
									stroke="currentColor"
									strokeWidth={1}
									x1={padding.left}
									x2={chartWidth - padding.right}
									y1={chartHeight - padding.bottom}
									y2={chartHeight - padding.bottom}
								/>

								{/* Per-season trendlines (always visible) */}
								{seasonTrendlines.map((trendline) => (
									<path
										d={trendline.path}
										fill="none"
										key={`trendline-${trendline.season}`}
										opacity={0.6}
										stroke={trendline.color.line}
										strokeLinecap="round"
										strokeWidth={2.5}
									/>
								))}

								{/* Overall trendline (toggleable) */}
								{showTrendline && overallTrendlinePath && (
									<path
										d={overallTrendlinePath}
										fill="none"
										opacity={0.9}
										stroke="#1f2937"
										strokeDasharray="8,4"
										strokeWidth={3}
									/>
								)}

								{/* Data points with different shapes per season */}
								{visibleEpisodes.map((ep) => {
									const isHovered = hoveredEpisode?.tconst === ep.tconst;
									const isBest = bestEpisode?.tconst === ep.tconst;
									const isWorst = worstEpisode?.tconst === ep.tconst;
									
									return (
										<g key={ep.tconst}>
											{/* Hover target (larger invisible circle) */}
											<circle
												className="cursor-pointer transition-all"
												cx={scaleX(ep.episode_index)}
												cy={scaleY(ep.rating)}
												fill="transparent"
												onMouseEnter={(e) => handleMouseMove(e, ep)}
												onMouseLeave={handleMouseLeave}
												onMouseMove={(e) => handleMouseMove(e, ep)}
												r={12}
											/>
											{/* Visible marker with season-specific shape */}
											{renderSeasonMarker(ep, isHovered, isBest, isWorst)}
										</g>
									);
								})}

								{/* Best/worst indicators */}
								{bestEpisode && hoveredEpisode?.tconst !== bestEpisode.tconst && (
									<g>
										<circle
											className="animate-pulse"
											cx={scaleX(bestEpisode.episode_index)}
											cy={scaleY(bestEpisode.rating)}
											fill="none"
											r={8}
											stroke="#22c55e"
											strokeWidth={2}
										/>
									</g>
								)}
								{worstEpisode && hoveredEpisode?.tconst !== worstEpisode.tconst && (
									<g>
										<circle
											className="animate-pulse"
											cx={scaleX(worstEpisode.episode_index)}
											cy={scaleY(worstEpisode.rating)}
											fill="none"
											r={8}
											stroke="#ef4444"
											strokeWidth={2}
										/>
									</g>
								)}
							</svg>

							{/* Tooltip - Fixed positioning to escape container */}
							{hoveredEpisode && svgRef.current && (
								<div
									className="pointer-events-none fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
									style={{
										left: `${svgRef.current.getBoundingClientRect().left + tooltipPos.x}px`,
										top: `${svgRef.current.getBoundingClientRect().top + tooltipPos.y}px`,
										transform: "translate(-50%, calc(-100% - 16px))",
									}}
								>
									<Card className="border-2 bg-background p-3 shadow-2xl">
										<div className="min-w-[240px] space-y-2">
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<div className="font-semibold text-sm leading-tight">
														{hoveredEpisode.title}
													</div>
													<div className="mt-1 text-muted-foreground text-xs">
														Season {hoveredEpisode.season}, Episode{" "}
														{hoveredEpisode.episode}
													</div>
												</div>
												<Badge
													className={
														hoveredEpisode.tconst === bestEpisode?.tconst
															? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
															: hoveredEpisode.tconst === worstEpisode?.tconst
																? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
																: colors.badge
													}
													variant="secondary"
												>
													S{String(hoveredEpisode.season).padStart(2, "0")}E
													{String(hoveredEpisode.episode).padStart(2, "0")}
												</Badge>
											</div>

											<div className="flex items-center gap-3 border-t pt-2">
												<div className="flex items-center gap-1">
													<Star
														className="size-4 text-amber-500"
														fill="currentColor"
													/>
													<span className="font-bold text-lg">
														{hoveredEpisode.rating.toFixed(1)}
													</span>
													<span className="text-muted-foreground text-xs">
														/10
													</span>
												</div>

												<div className="flex items-center gap-1 text-muted-foreground">
													<ThumbsUp className="size-3" />
													<span className="text-xs">
														{hoveredEpisode.votes.toLocaleString()} votes
													</span>
												</div>
											</div>

											{/* Rating bar */}
											<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
												<div
													className={`h-full transition-all ${
														hoveredEpisode.rating >= 9
															? "bg-green-500"
															: hoveredEpisode.rating >= 8
																? "bg-blue-500"
																: hoveredEpisode.rating >= 7
																	? "bg-amber-500"
																	: hoveredEpisode.rating >= 6
																		? "bg-orange-500"
																		: "bg-red-500"
													}`}
													style={{
														width: `${(hoveredEpisode.rating / 10) * 100}%`,
													}}
												/>
											</div>
										</div>
									</Card>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Legend */}
				{visibleEpisodes.length > 0 && (
					<div className="border-t p-4">
						<div className="flex flex-wrap gap-4">
							{data.seasons
								.filter((s) => visibleSeasons.has(s.season))
								.map((season) => {
									const colorInfo = seasonColors[(season.season - 1) % seasonColors.length];
									const shapeIcons = ["●", "◆", "■", "▲", "▼"];
									const shapeIcon = shapeIcons[(season.season - 1) % shapeIcons.length];
									
									return (
										<div className="flex items-center gap-2" key={season.season}>
											<span
												className="font-bold text-lg"
												style={{ color: colorInfo.line }}
											>
												{shapeIcon}
											</span>
											<span className="text-sm">
												Season {season.season}
											</span>
											<span className="text-muted-foreground text-xs">
												(avg: {season.avg_rating.toFixed(2)})
											</span>
										</div>
									);
								})}
						</div>
					</div>
				)}
			</Card>

			{/* Best/Worst Episodes */}
			{visibleEpisodes.length > 0 && (
				<div className="grid gap-3 md:grid-cols-2">
					{bestEpisode && (
						<Card className="p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<TrendingUp
									className={`size-4 ${SEMANTIC_COLORS.success.icon}`}
								/>
								<h4 className="font-semibold text-sm">Best Episode</h4>
							</div>
							<div className="mt-2 space-y-1">
								<div className="font-medium">{bestEpisode.title}</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="text-muted-foreground">
										S{String(bestEpisode.season).padStart(2, "0")}E
										{String(bestEpisode.episode).padStart(2, "0")}
									</span>
									<span className="flex items-center gap-0.5">
										<Star
											className="size-2 text-amber-500"
											fill="currentColor"
										/>
										{bestEpisode.rating.toFixed(1)}
									</span>
									<span className="text-muted-foreground">
										{bestEpisode.votes.toLocaleString()} votes
									</span>
								</div>
							</div>
						</Card>
					)}

					{worstEpisode && (
						<Card className="p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<ChevronDown
									className={`size-4 ${SEMANTIC_COLORS.warning.icon}`}
								/>
								<h4 className="font-semibold text-sm">Lowest Rated Episode</h4>
							</div>
							<div className="mt-2 space-y-1">
								<div className="font-medium">{worstEpisode.title}</div>
								<div className="flex items-center gap-2 text-xs">
									<span className="text-muted-foreground">
										S{String(worstEpisode.season).padStart(2, "0")}E
										{String(worstEpisode.episode).padStart(2, "0")}
									</span>
									<span className="flex items-center gap-0.5">
										<Star
											className="size-2 text-amber-500"
											fill="currentColor"
										/>
										{worstEpisode.rating.toFixed(1)}
									</span>
									<span className="text-muted-foreground">
										{worstEpisode.votes.toLocaleString()} votes
									</span>
								</div>
							</div>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}


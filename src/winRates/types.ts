/** Data period: day = 1 day, week = 7 days */
export type WinRatePeriod = "day" | "week"

/** Labels for period dropdown (same order as PeriodValues) */
export const PeriodOptions = ["1 day", "Week"] as const
export type WinRatePeriodOption = (typeof PeriodOptions)[number]

/** Period values for loading data, index matches PeriodOptions */
export const PeriodValues: WinRatePeriod[] = ["day", "week"]

/** From lowest (Herald) to highest (Immortal) */
export const RANKS = [
	"HERALD",
	"GUARDIAN",
	"CRUSADER",
	"ARCHON",
	"LEGEND",
	"ANCIENT",
	"DIVINE",
	"IMMORTAL"
] as const

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RANKS_DOTA_PLUS = [
	"HERALD",
	"GUARDIAN",
	"CRUSADER",
	"ARCHON",
	"LEGEND",
	"ANCIENT",
	"DIVINE + IMMORTAL"
]

/** Positions that have data in JSON (heroesPos1..heroesPos5) */
export const DataHeroPositions = [1, 2, 3, 4, 5] as const
export type DataHeroPosition = (typeof DataHeroPositions)[number]

/** 0 = ALL positions, 1–5 = specific position */
export const HeroPositions = [0, 1, 2, 3, 4, 5] as const
export type HeroPosition = (typeof HeroPositions)[number]

export const RankOptions = ["ALL", ...RANKS]
export type WinRateRank = (typeof RankOptions)[number]

export const PositionLabelList = [
	"ALL",
	"Carry",
	"Mid",
	"Offlane",
	"Soft support",
	"Hard support"
]

export const HeroPositionLabels: Record<HeroPosition, string> = Object.fromEntries(
	HeroPositions.map((pos, i) => [pos, PositionLabelList[i]])
) as Record<HeroPosition, string>

/** Hero tier by percentile (quintiles) among heroes with enough games; no tier if sample too small */
export type HeroTier = "S" | "A" | "B" | "C" | "D" | "?"

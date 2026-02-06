import { Utils } from "github.com/octarine-public/wrapper/index"

const WIN_RATES_DIR = "win-rates"

/** Data period: day = 1 day, week = 7 days */
export type WinRatePeriod = "day" | "week"

/** Labels for period dropdown (same order as PeriodValues) */
export const PeriodOptions = ["1 day", "Week"]
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

export type WinRateRank = (typeof RankOptions)[number]
export type HeroPosition = (typeof HeroPositions)[number]
export const HeroPositions = [1, 2, 3, 4, 5] as const
export const RankOptions = ["ALL", ...RANKS]

export const PositionLabelList = [
	"Carry",
	"Mid",
	"Offlane",
	"Soft support",
	"Hard support"
]

export const HeroPositionLabels: Record<HeroPosition, string> = Object.fromEntries(
	HeroPositions.map((pos, i) => [pos, PositionLabelList[i]])
) as Record<HeroPosition, string>

interface HeroWinEntry {
	heroId: number
	matchCount: number
	winCount: number
}

type WinRatesData = Record<
	string,
	{ winDay: HeroWinEntry[] | null; winWeek?: HeroWinEntry[] | null }
>

function getWinEntries(
	data: WinRatesData,
	key: string,
	period: WinRatePeriod
): HeroWinEntry[] | null {
	const block = data[key]
	if (!block) {
		return null
	}
	const arr = period === "week" ? (block.winWeek ?? block.winDay) : block.winDay
	return Array.isArray(arr) ? arr : null
}

/** winRates[period][rank][position] */
const winRatesByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()
const pickRatesByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()
const matchCountsByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()

const winRatesByRank = new Map<WinRatePeriod, Map<string, Map<number, number>>>()
const pickRatesByRank = new Map<WinRatePeriod, Map<string, Map<number, number>>>()

/** Current selection (used by menu + panorama) */
let currentRank: WinRateRank = "ALL"
let currentPosition: HeroPosition = 1
let currentPeriod: WinRatePeriod = "day"

export function getCurrentWinRateRank(): WinRateRank {
	return currentRank
}

export function setCurrentWinRateRank(rank: WinRateRank): void {
	currentRank = rank
}

export function getCurrentHeroPosition(): HeroPosition {
	return currentPosition
}

export function setCurrentHeroPosition(position: HeroPosition): void {
	currentPosition = position
}

export function getCurrentWinRatePeriod(): WinRatePeriod {
	return currentPeriod
}

export function setCurrentWinRatePeriod(period: WinRatePeriod): void {
	currentPeriod = period
}

interface RankStats {
	winRates: Map<number, number>
	pickRates: Map<number, number>
	matchCounts: Map<number, number>
}

function loadStatsForRank(period: WinRatePeriod, rank: string): RankStats {
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	const matchCounts = new Map<number, number>()
	try {
		const path = `${WIN_RATES_DIR}/${period}/heroes_meta_positions_${rank}.json`
		const data: WinRatesData = Utils.readJSON(path)
		const aggregated = new Map<number, { wins: number; matches: number }>()
		let totalMatches = 0
		for (const key of Object.keys(data)) {
			const entries = getWinEntries(data, key, period)
			if (!entries) {
				continue
			}
			for (const entry of entries) {
				totalMatches += entry.matchCount
				const cur = aggregated.get(entry.heroId) ?? { wins: 0, matches: 0 }
				cur.wins += entry.winCount
				cur.matches += entry.matchCount
				aggregated.set(entry.heroId, cur)
			}
		}
		for (const [heroId, { wins, matches }] of aggregated) {
			if (matches > 0) {
				winRates.set(heroId, (100 * wins) / matches)
				matchCounts.set(heroId, matches)
				if (totalMatches > 0) {
					pickRates.set(heroId, (100 * matches) / totalMatches)
				}
			}
		}
	} catch {
		// keep maps empty on load error
	}
	return { winRates, pickRates, matchCounts }
}

function loadStatsForRankAndPosition(
	period: WinRatePeriod,
	rank: string,
	position: HeroPosition
): RankStats {
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	const matchCounts = new Map<number, number>()
	try {
		const path = `${WIN_RATES_DIR}/${period}/heroes_meta_positions_${rank}.json`
		const data: WinRatesData = Utils.readJSON(path)
		const key = `heroesPos${position}`
		const entries = getWinEntries(data, key, period)
		if (!entries) {
			return { winRates, pickRates, matchCounts }
		}
		let totalMatches = 0
		for (const entry of entries) {
			totalMatches += entry.matchCount
		}
		for (const entry of entries) {
			if (entry.matchCount > 0) {
				winRates.set(entry.heroId, (100 * entry.winCount) / entry.matchCount)
				matchCounts.set(entry.heroId, entry.matchCount)
				if (totalMatches > 0) {
					pickRates.set(entry.heroId, (100 * entry.matchCount) / totalMatches)
				}
			}
		}
	} catch {
		// keep maps empty on load error
	}
	return { winRates, pickRates, matchCounts }
}

function loadStatsForAllRanksAndPosition(
	period: WinRatePeriod,
	position: HeroPosition
): RankStats {
	const aggregated = new Map<number, { wins: number; matches: number }>()
	let totalMatches = 0
	for (const rank of RANKS) {
		try {
			const path = `${WIN_RATES_DIR}/${period}/heroes_meta_positions_${rank}.json`
			const data: WinRatesData = Utils.readJSON(path)
			const key = `heroesPos${position}`
			const entries = getWinEntries(data, key, period)
			if (!entries) {
				continue
			}
			for (const entry of entries) {
				totalMatches += entry.matchCount
				const cur = aggregated.get(entry.heroId) ?? { wins: 0, matches: 0 }
				cur.wins += entry.winCount
				cur.matches += entry.matchCount
				aggregated.set(entry.heroId, cur)
			}
		} catch {
			// skip rank on error
		}
	}
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	const matchCounts = new Map<number, number>()
	for (const [heroId, { wins, matches }] of aggregated) {
		if (matches > 0) {
			winRates.set(heroId, (100 * wins) / matches)
			matchCounts.set(heroId, matches)
			if (totalMatches > 0) {
				pickRates.set(heroId, (100 * matches) / totalMatches)
			}
		}
	}
	return { winRates, pickRates, matchCounts }
}

function loadAllStatsByRank(): void {
	const periods: WinRatePeriod[] = ["day", "week"]
	for (const period of periods) {
		const rankToWinRates = new Map<string, Map<number, number>>()
		const rankToPickRates = new Map<string, Map<number, number>>()
		const rankToWinByPos = new Map<string, Map<HeroPosition, Map<number, number>>>()
		const rankToPickByPos = new Map<string, Map<HeroPosition, Map<number, number>>>()
		const rankToMatchByPos = new Map<string, Map<HeroPosition, Map<number, number>>>()

		for (const rank of RANKS) {
			const { winRates, pickRates } = loadStatsForRank(period, rank)
			rankToWinRates.set(rank, winRates)
			rankToPickRates.set(rank, pickRates)

			const winByPos = new Map<HeroPosition, Map<number, number>>()
			const pickByPos = new Map<HeroPosition, Map<number, number>>()
			const matchByPos = new Map<HeroPosition, Map<number, number>>()
			for (const pos of HeroPositions) {
				const {
					winRates: wr,
					pickRates: pr,
					matchCounts: mc
				} = loadStatsForRankAndPosition(period, rank, pos)
				winByPos.set(pos, wr)
				pickByPos.set(pos, pr)
				matchByPos.set(pos, mc)
			}
			rankToWinByPos.set(rank, winByPos)
			rankToPickByPos.set(rank, pickByPos)
			rankToMatchByPos.set(rank, matchByPos)
		}

		// ALL: aggregate all ranks per position
		const allWinByPos = new Map<HeroPosition, Map<number, number>>()
		const allPickByPos = new Map<HeroPosition, Map<number, number>>()
		const allMatchByPos = new Map<HeroPosition, Map<number, number>>()
		for (const pos of HeroPositions) {
			const {
				winRates: wr,
				pickRates: pr,
				matchCounts: mc
			} = loadStatsForAllRanksAndPosition(period, pos)
			allWinByPos.set(pos, wr)
			allPickByPos.set(pos, pr)
			allMatchByPos.set(pos, mc)
		}
		rankToWinByPos.set("ALL", allWinByPos)
		rankToPickByPos.set("ALL", allPickByPos)
		rankToMatchByPos.set("ALL", allMatchByPos)

		winRatesByRank.set(period, rankToWinRates)
		pickRatesByRank.set(period, rankToPickRates)
		winRatesByRankAndPosition.set(period, rankToWinByPos)
		pickRatesByRankAndPosition.set(period, rankToPickByPos)
		matchCountsByRankAndPosition.set(period, rankToMatchByPos)
	}
}

export function getWinRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return winRatesByRank.get(currentPeriod)?.get(rank)
}

export function getPickRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return pickRatesByRank.get(currentPeriod)?.get(rank)
}

export function getWinRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	return winRatesByRankAndPosition.get(currentPeriod)?.get(rank)?.get(position)
}

export function getPickRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	return pickRatesByRankAndPosition.get(currentPeriod)?.get(rank)?.get(position)
}

/** Minimum matches required to show a tier (avoids noise from tiny samples) */
const MIN_MATCHES_FOR_TIER = 100

/** Hero tier by percentile (quintiles) among heroes with enough games; no tier if sample too small */
export type HeroTier = "S" | "A" | "B" | "C" | "D" | "?"

/** Quintile boundaries: top 20% = S, next 20% = A, 40–60% = B, 60–80% = C, bottom 20% = D */
const TIER_BY_QUINTILE: HeroTier[] = ["S", "A", "B", "C", "D"]

export function getHeroTier(
	heroId: number,
	rank: WinRateRank,
	position: HeroPosition
): Nullable<HeroTier> {
	const winRates = getWinRatesByRankAndPosition(rank, position)
	const matchCounts = matchCountsByRankAndPosition
		.get(currentPeriod)
		?.get(rank)
		?.get(position)
	if (!winRates || !matchCounts) {
		return "?"
	}
	const winRate = winRates.get(heroId)
	const matches = matchCounts.get(heroId)
	if (
		winRate === undefined ||
		matches === undefined ||
		matches < MIN_MATCHES_FOR_TIER
	) {
		return "?"
	}
	// Build list of heroes with enough games, sorted by win rate descending
	const eligible: { heroId: number; winRate: number }[] = []
	for (const [id, wr] of winRates) {
		const m = matchCounts.get(id)
		if (m !== undefined && m >= MIN_MATCHES_FOR_TIER) {
			eligible.push({ heroId: id, winRate: wr })
		}
	}
	eligible.sort((a, b) => b.winRate - a.winRate)
	const idx = eligible.findIndex(e => e.heroId === heroId)
	if (idx < 0) {
		return undefined
	}
	const n = eligible.length
	const quintileIndex = n <= 1 ? 0 : Math.min(Math.floor((idx / n) * 5), 4)
	return TIER_BY_QUINTILE[quintileIndex]
}

loadAllStatsByRank()

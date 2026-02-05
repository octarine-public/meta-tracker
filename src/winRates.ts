import { Utils } from "github.com/octarine-public/wrapper/index"

const WIN_RATES_DIR = "win-rates"

export const RANKS = [
	"ANCIENT",
	"ARCHON",
	"CRUSADER",
	"DIVINE",
	"GUARDIAN",
	"HERALD",
	"IMMORTAL",
	"LEGEND"
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

interface HeroWinDayEntry {
	heroId: number
	matchCount: number
	winCount: number
}

type WinRatesData = Record<string, { winDay: HeroWinDayEntry[] }>

const winRatesByRank = new Map<string, Map<number, number>>()
const pickRatesByRank = new Map<string, Map<number, number>>()

/** winRates[rank][position] */
const winRatesByRankAndPosition = new Map<
	string,
	Map<HeroPosition, Map<number, number>>
>()
const pickRatesByRankAndPosition = new Map<
	string,
	Map<HeroPosition, Map<number, number>>
>()

/** Current selection (used by menu + panorama) */
let currentRank: WinRateRank = "ALL"
let currentPosition: HeroPosition = 1

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

interface RankStats {
	winRates: Map<number, number>
	pickRates: Map<number, number>
}

function loadStatsForRank(rank: string): RankStats {
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	try {
		const path = `${WIN_RATES_DIR}/heroes_meta_positions_${rank}.json`
		const data: WinRatesData = Utils.readJSON(path)
		const aggregated = new Map<number, { wins: number; matches: number }>()
		let totalMatches = 0
		for (const key of Object.keys(data)) {
			const winDay = data[key]?.winDay
			for (const entry of winDay) {
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
				if (totalMatches > 0) {
					pickRates.set(heroId, (100 * matches) / totalMatches)
				}
			}
		}
	} catch {
		// keep maps empty on load error
	}
	return { winRates, pickRates }
}

function loadStatsForRankAndPosition(rank: string, position: HeroPosition): RankStats {
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	try {
		const path = `${WIN_RATES_DIR}/heroes_meta_positions_${rank}.json`
		const data: WinRatesData = Utils.readJSON(path)
		const key = `heroesPos${position}`
		const winDay = data[key]?.winDay
		if (!Array.isArray(winDay)) {
			return { winRates, pickRates }
		}
		let totalMatches = 0
		for (const entry of winDay) {
			totalMatches += entry.matchCount
		}
		for (const entry of winDay) {
			if (entry.matchCount > 0) {
				winRates.set(entry.heroId, (100 * entry.winCount) / entry.matchCount)
				if (totalMatches > 0) {
					pickRates.set(entry.heroId, (100 * entry.matchCount) / totalMatches)
				}
			}
		}
	} catch {
		// keep maps empty on load error
	}
	return { winRates, pickRates }
}

/** Aggregate wins/matches across all ranks for one position, then compute win/pick rates */
function loadStatsForAllRanksAndPosition(position: HeroPosition): RankStats {
	const aggregated = new Map<number, { wins: number; matches: number }>()
	let totalMatches = 0
	for (const rank of RANKS) {
		try {
			const path = `${WIN_RATES_DIR}/heroes_meta_positions_${rank}.json`
			const data: WinRatesData = Utils.readJSON(path)
			const key = `heroesPos${position}`
			const winDay = data[key]?.winDay
			if (!Array.isArray(winDay)) {
				continue
			}
			for (const entry of winDay) {
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
	for (const [heroId, { wins, matches }] of aggregated) {
		if (matches > 0) {
			winRates.set(heroId, (100 * wins) / matches)
			if (totalMatches > 0) {
				pickRates.set(heroId, (100 * matches) / totalMatches)
			}
		}
	}
	return { winRates, pickRates }
}

function loadAllStatsByRank(): void {
	for (const rank of RANKS) {
		const { winRates, pickRates } = loadStatsForRank(rank)
		winRatesByRank.set(rank, winRates)
		pickRatesByRank.set(rank, pickRates)

		const winByPos = new Map<HeroPosition, Map<number, number>>()
		const pickByPos = new Map<HeroPosition, Map<number, number>>()
		for (const pos of HeroPositions) {
			const { winRates: wr, pickRates: pr } = loadStatsForRankAndPosition(rank, pos)
			winByPos.set(pos, wr)
			pickByPos.set(pos, pr)
		}
		winRatesByRankAndPosition.set(rank, winByPos)
		pickRatesByRankAndPosition.set(rank, pickByPos)
	}
	// ALL: aggregate all ranks per position
	const allWinByPos = new Map<HeroPosition, Map<number, number>>()
	const allPickByPos = new Map<HeroPosition, Map<number, number>>()
	for (const pos of HeroPositions) {
		const { winRates: wr, pickRates: pr } = loadStatsForAllRanksAndPosition(pos)
		allWinByPos.set(pos, wr)
		allPickByPos.set(pos, pr)
	}
	winRatesByRankAndPosition.set("ALL", allWinByPos)
	pickRatesByRankAndPosition.set("ALL", allPickByPos)
}

export function getWinRatesByRank(rank: WinRateRank): Map<number, number> | undefined {
	return winRatesByRank.get(rank)
}

export function getPickRatesByRank(rank: WinRateRank): Map<number, number> | undefined {
	return pickRatesByRank.get(rank)
}

export function getWinRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Map<number, number> | undefined {
	return winRatesByRankAndPosition.get(rank)?.get(position)
}

export function getPickRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Map<number, number> | undefined {
	return pickRatesByRankAndPosition.get(rank)?.get(position)
}

/** Hero tier by win rate: S (≥54%), A (50–54%), B (46–50%), C (42–46%), D (<42%) */
export type HeroTier = "S" | "A" | "B" | "C" | "D"

const TIER_THRESHOLDS: { min: number; tier: HeroTier }[] = [
	{ min: 54, tier: "S" },
	{ min: 50, tier: "A" },
	{ min: 46, tier: "B" },
	{ min: 42, tier: "C" },
	{ min: 0, tier: "D" }
]

export function getHeroTier(
	heroId: number,
	rank: WinRateRank,
	position: HeroPosition
): HeroTier | undefined {
	const winRates = getWinRatesByRankAndPosition(rank, position)
	const winRate = winRates?.get(heroId)
	if (winRate === undefined) {
		return undefined
	}
	for (const { min, tier } of TIER_THRESHOLDS) {
		if (winRate >= min) {
			return tier
		}
	}
	return "D"
}

loadAllStatsByRank()

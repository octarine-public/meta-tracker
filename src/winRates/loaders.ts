import { Utils } from "github.com/octarine-public/wrapper/index"

import { WIN_RATES_DIR } from "../constants"
import type { HeroPosition, WinRatePeriod } from "./types"
import { HeroPositions, RANKS } from "./types"

export function winRatesPath(period: WinRatePeriod, rank: string): string {
	return `${WIN_RATES_DIR}/${period}/heroes_meta_positions_${rank}.json`
}

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

export interface RankStats {
	winRates: Map<number, number>
	pickRates: Map<number, number>
	matchCounts: Map<number, number>
}

/** winRates[period][rank][position] */
export const winRatesByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()
export const pickRatesByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()
export const matchCountsByRankAndPosition = new Map<
	WinRatePeriod,
	Map<string, Map<HeroPosition, Map<number, number>>>
>()

export const winRatesByRank = new Map<WinRatePeriod, Map<string, Map<number, number>>>()
export const pickRatesByRank = new Map<WinRatePeriod, Map<string, Map<number, number>>>()

function loadStatsForRank(period: WinRatePeriod, rank: string): RankStats {
	const winRates = new Map<number, number>()
	const pickRates = new Map<number, number>()
	const matchCounts = new Map<number, number>()
	try {
		const data: WinRatesData = Utils.readJSON(winRatesPath(period, rank))
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
		const data: WinRatesData = Utils.readJSON(winRatesPath(period, rank))
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
			const data: WinRatesData = Utils.readJSON(winRatesPath(period, rank))
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

export function loadAllStatsByRank(): void {
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

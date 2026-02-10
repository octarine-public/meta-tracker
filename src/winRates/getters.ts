import {
	matchCountsByRank,
	matchCountsByRankAndPosition,
	pickRatesByRank,
	pickRatesByRankAndPosition,
	winRatesByRank,
	winRatesByRankAndPosition
} from "./loaders"
import { getCurrentWinRatePeriod } from "./state"
import { DataHeroPositions, HeroPosition, WinRateRank } from "./types"

export function getWinRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return winRatesByRank.get(getCurrentWinRatePeriod())?.get(rank)
}

export function getPickRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return pickRatesByRank.get(getCurrentWinRatePeriod())?.get(rank)
}

export function getMatchCountsByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return matchCountsByRank.get(getCurrentWinRatePeriod())?.get(rank)
}

/** Aggregate win rates across all positions for rank "ALL" (weighted by match count) */
function aggregateWinRatesAllPositions(rank: WinRateRank): Nullable<Map<number, number>> {
	const period = getCurrentWinRatePeriod()
	const matchByPos = matchCountsByRankAndPosition.get(period)?.get(rank)
	const winByPos = winRatesByRankAndPosition.get(period)?.get(rank)
	if (!matchByPos || !winByPos) {
		return null
	}
	const totalWins = new Map<number, number>()
	const totalMatches = new Map<number, number>()
	for (const pos of DataHeroPositions) {
		const wins = winByPos.get(pos)
		const matches = matchByPos.get(pos)
		if (!wins || !matches) {
			continue
		}
		for (const [heroId, wr] of wins) {
			const m = matches.get(heroId) ?? 0
			if (m <= 0) {
				continue
			}
			const curW = totalWins.get(heroId) ?? 0
			const curM = totalMatches.get(heroId) ?? 0
			totalWins.set(heroId, curW + (wr / 100) * m)
			totalMatches.set(heroId, curM + m)
		}
	}
	const out = new Map<number, number>()
	for (const [heroId, m] of totalMatches) {
		const w = totalWins.get(heroId) ?? 0
		if (m > 0) {
			out.set(heroId, (100 * w) / m)
		}
	}
	return out
}

/** Aggregate pick rates and match counts across all positions for rank "ALL" */
function aggregatePickAndMatchAllPositions(
	rank: WinRateRank
): { pickRates: Map<number, number>; matchCounts: Map<number, number> } | null {
	const period = getCurrentWinRatePeriod()
	const matchByPos = matchCountsByRankAndPosition.get(period)?.get(rank)
	const pickByPos = pickRatesByRankAndPosition.get(period)?.get(rank)
	if (!matchByPos || !pickByPos) {
		return null
	}
	const totalMatches = new Map<number, number>()
	let periodTotal = 0
	for (const pos of DataHeroPositions) {
		const matches = matchByPos.get(pos)
		if (!matches) {
			continue
		}
		for (const [heroId, m] of matches) {
			totalMatches.set(heroId, (totalMatches.get(heroId) ?? 0) + m)
			periodTotal += m
		}
	}
	const pickRates = new Map<number, number>()
	for (const [heroId, m] of totalMatches) {
		if (periodTotal > 0) {
			pickRates.set(heroId, (100 * m) / periodTotal)
		}
	}
	return { pickRates, matchCounts: totalMatches }
}

export function getWinRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	if (position === 0) {
		if (rank === "ALL") {
			return aggregateWinRatesAllPositions(rank)
		}
		return getWinRatesByRank(rank)
	}
	return winRatesByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

export function getPickRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	if (position === 0) {
		if (rank === "ALL") {
			const agg = aggregatePickAndMatchAllPositions(rank)
			return agg?.pickRates ?? null
		}
		return getPickRatesByRank(rank)
	}
	return pickRatesByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

export function getMatchCountsByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	if (position === 0) {
		if (rank === "ALL") {
			const agg = aggregatePickAndMatchAllPositions(rank)
			return agg?.matchCounts ?? null
		}
		return getMatchCountsByRank(rank)
	}
	return matchCountsByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

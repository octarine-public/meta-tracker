import type { HeroPosition, WinRateRank } from "./types"
import {
	matchCountsByRankAndPosition,
	pickRatesByRank,
	pickRatesByRankAndPosition,
	winRatesByRank,
	winRatesByRankAndPosition
} from "./loaders"
import { getCurrentWinRatePeriod } from "./state"

export function getWinRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return winRatesByRank.get(getCurrentWinRatePeriod())?.get(rank)
}

export function getPickRatesByRank(rank: WinRateRank): Nullable<Map<number, number>> {
	return pickRatesByRank.get(getCurrentWinRatePeriod())?.get(rank)
}

export function getWinRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	return winRatesByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

export function getPickRatesByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	return pickRatesByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

export function getMatchCountsByRankAndPosition(
	rank: WinRateRank,
	position: HeroPosition
): Nullable<Map<number, number>> {
	return matchCountsByRankAndPosition
		.get(getCurrentWinRatePeriod())
		?.get(rank)
		?.get(position)
}

import {
	getPickRatesByRank,
	getPickRatesByRankAndPosition,
	getWinRatesByRank,
	getWinRatesByRankAndPosition
} from "./getters"
import { loadAllStatsByRank } from "./loaders"
import { getHeroTier } from "./tier"
import {
	HeroPosition,
	HeroPositionLabels,
	HeroPositions,
	HeroTier,
	PeriodOptions,
	PeriodValues,
	PositionLabelList,
	RankOptions,
	RANKS,
	RANKS_DOTA_PLUS,
	WinRatePeriod,
	WinRateRank
} from "./types"

loadAllStatsByRank()

export type { HeroPosition, HeroTier, WinRatePeriod, WinRateRank }
export {
	HeroPositionLabels,
	HeroPositions,
	PeriodOptions,
	PeriodValues,
	PositionLabelList,
	RankOptions,
	RANKS,
	RANKS_DOTA_PLUS
}
export {
	getCurrentHeroPosition,
	getCurrentWinRatePeriod,
	getCurrentWinRateRank,
	setCurrentHeroPosition,
	setCurrentWinRatePeriod,
	setCurrentWinRateRank
} from "./state"
export {
	getPickRatesByRank,
	getPickRatesByRankAndPosition,
	getWinRatesByRank,
	getWinRatesByRankAndPosition
}
export { getHeroTier }

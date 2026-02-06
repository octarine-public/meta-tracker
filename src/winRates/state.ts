import { HeroPosition, WinRatePeriod, WinRateRank } from "./types"

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

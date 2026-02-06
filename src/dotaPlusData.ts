import type { HeroDataChunk, HeroDataResponse } from "./models/heroDataTypes"
import { getLatestWeekData } from "./models/heroDataTypes"

const DEFAULT_WIN_RATE = 0

let dotaPlusData: HeroDataResponse[] = []
let currentDotaPlusRankChunk = 0

export function setDotaPlusData(arr: HeroDataResponse[]): void {
	dotaPlusData = arr
}

export function getCurrentDotaPlusRankChunk(): number {
	return currentDotaPlusRankChunk
}

export function setCurrentDotaPlusRankChunk(chunk: number): void {
	currentDotaPlusRankChunk = chunk
}

function findHeroData(heroId: number): HeroDataResponse | undefined {
	return dotaPlusData.find(h => h.hero_id === heroId)
}

function getChunkForCurrentRank(hero: HeroDataResponse): HeroDataChunk | undefined {
	return hero.hero_data_per_chunk?.find(c => c.rank_chunk === currentDotaPlusRankChunk)
}

export function getWinRateForHero(heroId: number): number {
	const hero = findHeroData(heroId)
	if (!hero) {
		return DEFAULT_WIN_RATE
	}
	const chunk = getChunkForCurrentRank(hero)
	if (!chunk) {
		return DEFAULT_WIN_RATE
	}
	const week = getLatestWeekData(chunk)
	if (!week) {
		return DEFAULT_WIN_RATE
	}
	return week.win_percent * 100
}

export function getPickRateForHero(heroId: number): number {
	const hero = findHeroData(heroId)
	if (!hero) {
		return 0
	}
	const chunk = getChunkForCurrentRank(hero)
	if (!chunk) {
		return 0
	}
	const week = getLatestWeekData(chunk)
	if (!week) {
		return 0
	}
	return week.pick_percent * 100
}

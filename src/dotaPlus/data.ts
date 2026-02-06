import { HeroDataChunk, HeroDataResponse, HeroWeekData } from "../models/heroDataTypes"

const DEFAULT_WIN_RATE = 0

/** Min pick_percent to include hero in tier ranking (avoid noise from very rare picks) */
const MIN_PICK_PERCENT_FOR_TIER = 0.001

/** Quintile boundaries: top 20% = S, next 20% = A, 40–60% = B, 60–80% = C, bottom 20% = D */
const TIER_BY_QUINTILE = ["S", "A", "B", "C", "D"] as const
export type HeroTier = (typeof TIER_BY_QUINTILE)[number] | "?"

/** Returns the latest week entry (smallest week number, e.g. week 1) from chunk.week_data */
function getLatestWeekData(chunk: HeroDataChunk): Nullable<HeroWeekData> {
	if (chunk.week_data.length === 0) {
		return undefined
	}
	return chunk.week_data.reduce((a, b) => (a.week <= b.week ? a : b))
}

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

function findHeroData(heroId: number): Nullable<HeroDataResponse> {
	return dotaPlusData.find(h => h.hero_id === heroId)
}

function getChunkForCurrentRank(hero: HeroDataResponse): Nullable<HeroDataChunk> {
	return hero.hero_data_per_chunk.find(c => c.rank_chunk === currentDotaPlusRankChunk)
}

export function getWinRateForHero(heroId: number): number {
	const hero = findHeroData(heroId)
	if (hero === undefined) {
		return DEFAULT_WIN_RATE
	}
	const chunk = getChunkForCurrentRank(hero)
	if (chunk === undefined) {
		return DEFAULT_WIN_RATE
	}
	const week = getLatestWeekData(chunk)
	if (week === undefined) {
		return DEFAULT_WIN_RATE
	}
	return week.win_percent * 100
}

export function getPickRateForHero(heroId: number): number {
	const hero = findHeroData(heroId)
	if (hero === undefined) {
		return 0
	}
	const chunk = getChunkForCurrentRank(hero)
	if (chunk === undefined) {
		return 0
	}
	const week = getLatestWeekData(chunk)
	if (week === undefined) {
		return 0
	}
	return week.pick_percent * 100
}

export function getTierForHero(heroId: number): HeroTier {
	const chunkIndex = currentDotaPlusRankChunk
	const eligible: { heroId: number; winPercent: number }[] = []
	for (const hero of dotaPlusData) {
		const chunk = hero.hero_data_per_chunk.find(c => c.rank_chunk === chunkIndex)
		if (chunk === undefined) {
			continue
		}
		const week = getLatestWeekData(chunk)
		if (week === undefined || week.pick_percent < MIN_PICK_PERCENT_FOR_TIER) {
			continue
		}
		eligible.push({ heroId: hero.hero_id, winPercent: week.win_percent })
	}
	if (eligible.length === 0) {
		return "?"
	}
	eligible.sort((a, b) => b.winPercent - a.winPercent)
	const idx = eligible.findIndex(e => e.heroId === heroId)
	if (idx < 0) {
		return "?"
	}
	const n = eligible.length
	const quintileIndex = n <= 1 ? 0 : Math.min(Math.floor((idx / n) * 5), 4)
	return TIER_BY_QUINTILE[quintileIndex]
}

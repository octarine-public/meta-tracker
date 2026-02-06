import { MIN_MATCHES_FOR_TIER } from "../constants"
import type { HeroPosition, HeroTier, WinRateRank } from "./types"
import { getMatchCountsByRankAndPosition, getWinRatesByRankAndPosition } from "./getters"

/** Quintile boundaries: top 20% = S, next 20% = A, 40–60% = B, 60–80% = C, bottom 20% = D */
const TIER_BY_QUINTILE: HeroTier[] = ["S", "A", "B", "C", "D"]

export function getHeroTier(
	heroId: number,
	rank: WinRateRank,
	position: HeroPosition
): Nullable<HeroTier> {
	const winRates = getWinRatesByRankAndPosition(rank, position)
	const matchCounts = getMatchCountsByRankAndPosition(rank, position)
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

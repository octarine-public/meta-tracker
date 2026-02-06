/**
 * Data provider for hero stats overlay. Inject win rate / tier / pick rate source
 * (e.g. Dota 2 or Stratz) and visibility from menu.
 */
export interface HeroStatsDataProvider {
	getWinRate(heroID: number): number
	getTier(heroID: number): string | undefined
	getPickRate(heroID: number): number
	isVisible(): boolean
}

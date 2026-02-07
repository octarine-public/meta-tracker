export interface HeroStatsDataProvider {
	getWinRate(heroID: number): number
	getTier(heroID: number): string | undefined
	getPickRate(heroID: number): number
	isVisible(): boolean
}

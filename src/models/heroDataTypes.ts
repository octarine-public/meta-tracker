/* eslint-disable @typescript-eslint/naming-convention */
export interface HeroWeekData {
	week: number
	win_percent: number
	pick_percent: number
	ban_percent: number
}
export interface HeroDataChunk {
	// 0 = HERALD, 1 = GUARDIAN, 2 = CRUSADER, 3 = ARCHON, 4 = LEGEND, 5 = ANCIENT, 6 = DIVINE
	rank_chunk: number
	week_data: HeroWeekData[]
}
export interface HeroDataResponse {
	hero_id: number
	hero_data_per_chunk: HeroDataChunk[]
}

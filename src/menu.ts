import { Menu } from "github.com/octarine-public/wrapper/index"

import { CHART_ICON } from "./constants"
import {
	HeroPositions,
	PeriodOptions,
	PeriodValues,
	PositionLabelList,
	RankOptions,
	setCurrentHeroPosition,
	setCurrentWinRatePeriod,
	setCurrentWinRateRank
} from "./winRates"

export class MenuManager {
	public readonly State: Menu.Toggle
	private readonly winRatePeriodDropdown: Menu.Dropdown
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly winRatePositionDropdown: Menu.Dropdown

	private readonly baseMenu = Menu.AddEntryDeep(
		["Visual", "Meta tracker"],
		[CHART_ICON]
	)

	constructor() {
		this.State = this.baseMenu.AddToggle("State", true)
		this.baseMenu.SortNodes = false
		this.winRatePeriodDropdown = this.baseMenu.AddDropdown(
			"Sort by win rate period",
			PeriodOptions,
			1
		)
		// 0 = ALL, 1 = HERALD, ... 8 = IMMORTAL; default ALL
		this.winRateRankDropdown = this.baseMenu.AddDropdown(
			"Sort by win rate rank",
			RankOptions
		)
		this.winRatePositionDropdown = this.baseMenu.AddDropdown(
			"Sort by win rate position",
			PositionLabelList
		)
		this.State.OnValue(() => this.syncStateFromMenu())
		this.winRatePeriodDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRateRankDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRatePositionDropdown.OnValue(() => this.syncStateFromMenu())
		this.syncStateFromMenu()
	}

	private syncStateFromMenu(): void {
		setCurrentWinRatePeriod(PeriodValues[this.winRatePeriodDropdown.SelectedID])
		setCurrentWinRateRank(RankOptions[this.winRateRankDropdown.SelectedID])
		setCurrentHeroPosition(HeroPositions[this.winRatePositionDropdown.SelectedID])
	}
}

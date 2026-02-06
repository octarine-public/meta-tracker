import { Menu } from "github.com/octarine-public/wrapper/index"

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

	private readonly path = "github.com/octarine-public/meta-tracker/"
	private readonly icon = this.path + "scripts_files/chart.svg"
	private readonly baseMenu = Menu.AddEntryDeep(["Visual", "Meta tracker"], [this.icon])

	constructor() {
		this.State = this.baseMenu.AddToggle("State", true)
		this.baseMenu.SortNodes = false
		this.winRatePeriodDropdown = this.baseMenu.AddDropdown(
			"Sort by win rate period",
			PeriodOptions
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
		this.State.OnValue(() => this.refreshWinRateOverlay())
		this.winRatePeriodDropdown.OnValue(() => this.refreshWinRateOverlay())
		this.winRateRankDropdown.OnValue(() => this.refreshWinRateOverlay())
		this.winRatePositionDropdown.OnValue(() => this.refreshWinRateOverlay())
		this.refreshWinRateOverlay()
	}

	private refreshWinRateOverlay(): void {
		setCurrentWinRatePeriod(PeriodValues[this.winRatePeriodDropdown.SelectedID])
		setCurrentWinRateRank(RankOptions[this.winRateRankDropdown.SelectedID])
		setCurrentHeroPosition(HeroPositions[this.winRatePositionDropdown.SelectedID])
	}
}

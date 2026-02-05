import { Menu } from "github.com/octarine-public/wrapper/index"

import {
	HeroPositions,
	PositionLabelList,
	RankOptions,
	setCurrentHeroPosition,
	setCurrentWinRateRank
} from "./winRates"

export class MenuManager {
	public readonly State: Menu.Toggle
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly winRatePositionDropdown: Menu.Dropdown
	private readonly baseMenu = Menu.AddEntryDeep(["Visual", "Meta Tracker"])

	constructor() {
		this.State = this.baseMenu.AddToggle("State", true)
		this.baseMenu.SortNodes = false
		// 0 = ALL, 1 = ANCIENT, ...; default ALL
		this.winRateRankDropdown = this.baseMenu.AddDropdown("Win rate rank", RankOptions)
		this.winRatePositionDropdown = this.baseMenu.AddDropdown(
			"Win rate position",
			PositionLabelList
		)
		this.State.OnValue(() => this.refreshWinRateOverlay())
		this.winRateRankDropdown.OnValue(() => this.refreshWinRateOverlay())
		this.winRatePositionDropdown.OnValue(() => this.refreshWinRateOverlay())
	}

	private refreshWinRateOverlay(): void {
		setCurrentWinRateRank(RankOptions[this.winRateRankDropdown.SelectedID])
		setCurrentHeroPosition(HeroPositions[this.winRatePositionDropdown.SelectedID])
	}
}

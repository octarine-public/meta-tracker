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
} from "../winRates/index"

export class StratzMenu {
	private readonly winRatePeriodDropdown: Menu.Dropdown
	private readonly winRateRankDropdown: Menu.Dropdown
	private readonly winRatePositionDropdown: Menu.Dropdown

	private readonly rankName = "StratzRank"
	private readonly periodName = "StratzPeriod"
	private readonly positionName = "StratzPosition"

	constructor(node: Menu.Node) {
		this.winRatePeriodDropdown = node.AddDropdown(
			this.periodName,
			[...PeriodOptions],
			1
		)
		// 0 = ALL, 1 = HERALD, ... 8 = IMMORTAL; default ALL
		this.winRateRankDropdown = node.AddDropdown(this.rankName, [...RankOptions], 1)
		this.winRatePositionDropdown = node.AddDropdown(
			this.positionName,
			[...PositionLabelList],
			1
		)
		this.winRatePeriodDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRateRankDropdown.OnValue(() => this.syncStateFromMenu())
		this.winRatePositionDropdown.OnValue(() => this.syncStateFromMenu())
		this.syncStateFromMenu()
	}
	public SetVisible(visible: boolean): void {
		this.winRateRankDropdown.IsHidden = !visible
		this.winRatePositionDropdown.IsHidden = !visible
		this.winRatePeriodDropdown.IsHidden = !visible
	}
	private syncStateFromMenu(): void {
		if (
			this.winRateRankDropdown.IsHidden ||
			this.winRatePeriodDropdown.IsHidden ||
			this.winRatePositionDropdown.IsHidden
		) {
			return
		}
		setCurrentWinRatePeriod(PeriodValues[this.winRatePeriodDropdown.SelectedID])
		setCurrentWinRateRank(RankOptions[this.winRateRankDropdown.SelectedID])
		setCurrentHeroPosition(HeroPositions[this.winRatePositionDropdown.SelectedID])
	}
}
